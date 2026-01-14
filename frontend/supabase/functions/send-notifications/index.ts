// Supabase Edge Function: 캘린더 이벤트 알림 발송
// 이 함수는 매일 호출되어야 합니다 (cron 또는 스케줄러를 통해)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // CORS preflight 요청 처리
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Service Role Key를 사용하여 Supabase 클라이언트 생성
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase 환경 변수가 누락되었습니다')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // 뷰에서 대기 중인 알림 조회
    const { data: pendingNotifications, error: fetchError } = await supabase
      // 민감한 뷰는 private 스키마에서 조회
      .schema('private')
      .from('pending_notifications')
      .select('*')

    if (fetchError) {
      console.error('Error fetching pending notifications:', fetchError)
      throw fetchError
    }

    if (!pendingNotifications || pendingNotifications.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No pending notifications', count: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    const results = []
    
    // 각 알림 처리
    for (const notification of pendingNotifications) {
      try {
        // 이메일 알림 발송
        const emailResult = await sendEmailNotification(
          supabase,
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
        results.push({
          event_id: notification.event_id,
          email: notification.email,
          status: 'failed',
          error: error.message
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
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

async function sendEmailNotification(
  supabase: any,
  email: string,
  title: string,
  eventDate: string,
  notificationType: string
) {
  // 알림 타입에 따른 메시지 가져오기
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

  // Supabase 내장 이메일 기능 또는 외부 서비스 사용
  // 참고: Supabase에는 직접적인 이메일 API가 없으므로 다음 중 하나를 사용해야 합니다:
  // 1. Supabase Auth 이메일 (인증 이메일에 제한됨)
  // 2. Resend, SendGrid 등의 외부 서비스
  // 3. 외부 API를 호출하는 데이터베이스 함수
  
  // 현재는 데이터베이스 함수를 사용하여 이메일을 발송합니다
  // 이메일 서비스 설정이 필요합니다
  const { error } = await supabase.rpc('send_email_notification', {
    p_email: email,
    p_subject: subject,
    p_html_content: htmlContent,
    p_text_content: textContent
  })

  if (error) {
    throw new Error(`Failed to send email: ${error.message}`)
  }

  return { success: true }
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
