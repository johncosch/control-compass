interface CompanyApprovedEmailProps {
  companyName: string
  companySlug: string
  recipientName?: string
}

export function CompanyApprovedEmail({ companyName, companySlug, recipientName }: CompanyApprovedEmailProps) {
  const companyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/companies/${companySlug}`

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Company Approved - Control Compass</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #FAFAFA;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
          <!-- Header -->
          <div style="background-color: #01204C; padding: 40px 30px; text-align: center;">
            <img src="${process.env.NEXT_PUBLIC_APP_URL}/images/control-compass-logo.png" 
                 alt="Control Compass" 
                 style="height: 60px; margin-bottom: 20px;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">
              🎉 Company Approved!
            </h1>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 30px;">
            <p style="font-size: 16px; line-height: 1.6; color: #2B2B2B; margin-bottom: 20px;">
              ${recipientName ? `Hi ${recipientName},` : "Hello,"}
            </p>
            
            <p style="font-size: 16px; line-height: 1.6; color: #2B2B2B; margin-bottom: 20px;">
              Great news! Your company <strong>${companyName}</strong> has been approved and is now live on Control Compass.
            </p>
            
            <p style="font-size: 16px; line-height: 1.6; color: #2B2B2B; margin-bottom: 30px;">
              Your company profile is now visible to potential customers searching for industrial controls and automation services.
            </p>
            
            <!-- CTA Button -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="${companyUrl}" 
                 style="background-color: #01204C; color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                View Your Company Profile
              </a>
            </div>
            
            <div style="background-color: #F1E6D2; padding: 20px; border-radius: 8px; margin: 30px 0;">
              <h3 style="color: #01204C; margin: 0 0 15px 0; font-size: 18px;">
                What's Next?
              </h3>
              <ul style="color: #2B2B2B; margin: 0; padding-left: 20px; line-height: 1.6;">
                <li>Share your profile with customers and partners</li>
                <li>Keep your company information up to date</li>
                <li>Invite team members to help manage your profile</li>
                <li>Monitor inquiries through your dashboard</li>
              </ul>
            </div>
            
            <p style="font-size: 16px; line-height: 1.6; color: #2B2B2B; margin-bottom: 20px;">
              If you have any questions or need assistance, don't hesitate to reach out to our support team.
            </p>
            
            <p style="font-size: 16px; line-height: 1.6; color: #2B2B2B;">
              Best regards,<br>
              The Control Compass Team
            </p>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #FAFAFA; padding: 30px; text-align: center; border-top: 1px solid #e5e5e5;">
            <p style="color: #6B6B6B; font-size: 14px; margin: 0 0 10px 0;">
              Control Compass by IOThrifty
            </p>
            <p style="color: #6B6B6B; font-size: 12px; margin: 0;">
              This email was sent to you because your company was approved on Control Compass.
            </p>
          </div>
        </div>
      </body>
    </html>
  `
}
