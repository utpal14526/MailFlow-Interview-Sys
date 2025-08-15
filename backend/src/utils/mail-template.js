export const createMailTemplate = (campaign) => {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${campaign.subject}</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f4f6f8;
        margin: 0;
        padding: 0;
        color: #333;
      }
      .email-container {
        max-width: 600px;
        margin: auto;
        background: #ffffff;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0px 4px 10px rgba(0,0,0,0.08);
      }
      .header {
        background: #4a90e2;
        color: white;
        padding: 16px 24px;
        font-size: 20px;
        font-weight: bold;
        text-align: center;
      }
      .body-content {
        padding: 24px;
        font-size: 15px;
        line-height: 1.6;
      }
      .cta-button {
        display: inline-block;
        margin-top: 20px;
        padding: 12px 24px;
        background: #4a90e2;
        color: white;
        text-decoration: none;
        border-radius: 4px;
        font-weight: bold;
      }
      .footer {
        background: #f4f6f8;
        text-align: center;
        padding: 16px;
        font-size: 13px;
        color: #666;
      }
    </style>
  </head>
  <body>
    <div class="email-container">
      <div class="header">
        ${campaign.subject}
      </div>
      <div class="body-content">
        ${campaign.body}
        <br />

      </div>
      <div class="footer">
        © ${new Date().getFullYear()} Your Company. All rights reserved.
      </div>
    </div>
  </body>
  </html>
  `;
};
