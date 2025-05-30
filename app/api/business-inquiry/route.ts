import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const inquiry = await request.json()

    // In a real implementation, you would:
    // 1. Save to database
    // 2. Send email to admins
    // 3. Send confirmation email to user

    // For now, we'll just log it and return success
    console.log("Business Inquiry Received:", inquiry)

    // You can implement email sending here using services like:
    // - Resend
    // - SendGrid
    // - Nodemailer
    // - Or any other email service

    // Example with a hypothetical email service:
    /*
    await sendEmail({
      to: "admin@topcitytickets.com",
      subject: `New Business Inquiry: ${inquiry.inquiryType}`,
      html: `
        <h2>New Business Inquiry</h2>
        <p><strong>Name:</strong> ${inquiry.name}</p>
        <p><strong>Email:</strong> ${inquiry.email}</p>
        <p><strong>Phone:</strong> ${inquiry.phone}</p>
        <p><strong>Company:</strong> ${inquiry.company}</p>
        <p><strong>Inquiry Type:</strong> ${inquiry.inquiryType}</p>
        <p><strong>Message:</strong></p>
        <p>${inquiry.message}</p>
        <p><strong>Submitted:</strong> ${inquiry.submittedAt}</p>
      `
    })
    */

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error processing business inquiry:", error)
    return NextResponse.json({ error: "Failed to process inquiry" }, { status: 500 })
  }
}
