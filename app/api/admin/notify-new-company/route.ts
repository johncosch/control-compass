import { type NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { companyName, companyId, userEmail, adminUrl } =
      await request.json();

    const { data, error } = await resend.emails.send({
      from: "noreply@controlcompass.io", // ensure this domain is verified in Resend
      to: ["johnj@iothrifty.com"],
      subject: `New Company Pending Approval: ${companyName}`,
      html: `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>New Company Pending Approval</title>
  </head>
  <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
      <h1 style="color: white; margin: 0; font-size: 28px;">Control Compass</h1>
      <p style="color: #f0f0f0; margin: 10px 0 0 0; font-size: 16px;">Company Directory</p>
    </div>

    <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
      <h2 style="color: #495057; margin-top: 0;">New Company Pending Approval</h2>

      <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #495057;">Company Details</h3>
        <p><strong>Company Name:</strong> ${companyName}</p>
        <p><strong>Company ID:</strong> ${companyId}</p>
        <p><strong>Submitted by:</strong> ${userEmail || "Unknown"}</p>
        <p><strong>Status:</strong> <span style="background: #ffc107; color: #212529; padding: 2px 8px; border-radius: 4px; font-size: 12px;">PENDING</span></p>
      </div>

      <p style="margin: 25px 0;">A new company has been submitted to the Control Compass directory and is awaiting your approval.</p>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${adminUrl || `${process.env.NEXT_PUBLIC_APP_URL}/admin/companies/`}"
           style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
          Review Company →
        </a>
      </div>

      <div style="background: #e9ecef; padding: 15px; border-radius: 6px; margin-top: 25px;">
        <p style="margin: 0; font-size: 14px; color: #6c757d;">
          <strong>Next Steps:</strong><br />
          • Review the company information<br />
          • Verify the details are accurate<br />
          • Approve or reject the submission<br />
          • The company owner will be notified of your decision
        </p>
      </div>
    </div>

    <div style="text-align: center; margin-top: 20px; padding: 20px; color: #6c757d; font-size: 12px;">
      <p>This is an automated notification from Control Compass</p>
      <p>© ${new Date().getFullYear()} Control Compass. All rights reserved.</p>
    </div>
  </body>
</html>`,
    });

    if (error) {
      console.error(
        "Failed to send admin notification email:",
        JSON.stringify(error, null, 2)
      );
      return NextResponse.json(
        { error: "Failed to send email" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error in notify-new-company API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
