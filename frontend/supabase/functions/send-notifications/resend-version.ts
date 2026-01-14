// Resend 이메일 서비스를 사용하는 대안 버전
// 이 버전을 사용하려면 이 파일을 index.ts로 이름을 변경하고 Resend API 키를 설정하세요

// @ts-expect-error - Deno 타입은 Node.js 환경에서 사용할 수 없음
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
// @ts-expect-error - ESM 타입은 Node.js 환경에서 사용할 수 없음
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // @ts-expect-error - Deno 전역 객체는 Node.js 환경에서 사용할 수 없음
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    // @ts-expect-error - Deno 전역 객체는 Node.js 환경에서 사용할 수 없음
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    // @ts-expect-error - Deno 전역 객체는 Node.js 환경에서 사용할 수 없음
    const resendApiKey = Deno.env.get('RESEND_API_KEY') ?? ''
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase 환경 변수가 누락되었습니다')
    }

    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY 환경 변수가 누락되었습니다')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // 대기 중인 알림 조회
    const { data: pendingNotifications, error: fetchError } = await supabase
      // 민감한 뷰는 private 스키마에서 조회
      .schema('private')
      .from('pending_notifications')
      .select('*')

    if (fetchError) {
      throw fetchError
    }

    if (!pendingNotifications || pendingNotifications.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No pending notifications', count: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    const results = []
    
    for (const notification of pendingNotifications) {
      try {
        // Resend를 통해 이메일 발송
        await sendEmailViaResend(
          resendApiKey,
          notification.email,
          notification.title,
          notification.event_date,
          notification.notification_type
        )

        // 알림 로그 기록
        const { error: logError } = await supabase
          .from('notification_logs')
          .insert({
            event_id: notification.event_id,
            user_id: notification.user_id,
            notification_type: notification.notification_type
          })

        if (logError) {
          console.error('Error logging notification:', logError)
        }

        results.push({
          event_id: notification.event_id,
          email: notification.email,
          status: 'sent',
          notification_type: notification.notification_type
        })
      } catch (error) {
        console.error(`Error processing notification for event ${notification.event_id}:`, error)
        const errorMessage = error instanceof Error ? error.message : String(error)
        results.push({
          event_id: notification.event_id,
          email: notification.email,
          status: 'failed',
          error: errorMessage
        })
      }
    }

    return new Response(
      JSON.stringify({
        message: 'Notifications processed',
        count: results.length,
        results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    console.error('Error in send-notifications function:', error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

async function sendEmailViaResend(
  apiKey: string,
  email: string,
  title: string,
  eventDate: string,
  notificationType: string
) {
  const daysUntil = getDaysUntilMessage(notificationType)
  const subject = `📅 캘린더 알림: ${title}`
  
  const eventDateFormatted = new Date(eventDate).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  })

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .event-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
        .event-title { font-size: 24px; font-weight: bold; color: #667eea; margin-bottom: 10px; }
        .event-date { font-size: 18px; color: #666; margin-bottom: 10px; }
        .notification-badge { display: inline-block; background: #667eea; color: white; padding: 5px 15px; border-radius: 20px; font-size: 14px; margin-top: 10px; }
        .footer { text-align: center; margin-top: 30px; color: #999; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📅 캘린더 알림</h1>
        </div>
        <div class="content">
          <div class="event-box">
            <div class="event-title">${title}</div>
            <div class="event-date">📆 ${eventDateFormatted}</div>
            <span class="notification-badge">${daysUntil}</span>
          </div>
          <p>일정이 다가오고 있습니다. 확인해주세요!</p>
          <div class="footer">
            <p>이 메일은 캘린더 알림 시스템에서 자동으로 발송되었습니다.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `

  const textContent = `
캘린더 알림

일정: ${title}
날짜: ${eventDateFormatted}
${daysUntil}

일정이 다가오고 있습니다. 확인해주세요!
  `

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Calendar <noreply@yourdomain.com>', // 인증된 도메인으로 변경하세요
      to: email,
      subject: subject,
      html: htmlContent,
      text: textContent,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Resend API error: ${JSON.stringify(error)}`)
  }

  return await response.json()
}

function getDaysUntilMessage(notificationType: string): string {
  switch (notificationType) {
    case 'today':
      return '⏰ 오늘입니다!'
    case '1_day_before':
      return '⏰ 내일입니다!'
    case '3_days_before':
      return '⏰ 3일 후입니다'
    case '7_days_before':
      return '⏰ 7일 후입니다'
    default:
      return '알림'
  }
}
