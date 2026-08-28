import { LOGO_BASE64 } from './logoBase64';

export async function createDonationReceiptCanvas(donation) {
  const donorName = donation.donorName || donation.name || 'Anonymous Donor';
  const amount = Number(donation.amount || 0);
  const paymentMethod = donation.paymentMethod || 'UPI / Cash';

  const txDate = donation.timestamp ? new Date(donation.timestamp) : new Date();
  const dateFormatted = txDate.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const timeFormatted = txDate.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  // Scale for ultra-crisp 3x Retina output
  const scale = 3;
  const baseWidth = 390;
  const baseHeight = 610; // Vertical tall card layout matching on-screen modal

  const canvas = document.createElement('canvas');
  canvas.width = baseWidth * scale;
  canvas.height = baseHeight * scale;

  const ctx = canvas.getContext('2d');
  ctx.scale(scale, scale);

  // Background Card with pure crisp white
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, baseWidth, baseHeight);

  // Outer Border Outline
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(0, 0, baseWidth, baseHeight);

  // Top Accent Bar (Royal Blue #0f52ba)
  ctx.fillStyle = '#0f52ba';
  ctx.fillRect(0, 0, baseWidth, 5);

  // Helper for rounded rectangle
  const drawRoundedRect = (x, y, w, h, radius, fill, stroke, strokeWidth = 1) => {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + w - radius, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
    ctx.lineTo(x + w, y + h - radius);
    ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
    ctx.lineTo(x + radius, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    if (fill) {
      ctx.fillStyle = fill;
      ctx.fill();
    }
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = strokeWidth;
      ctx.stroke();
    }
  };

  const centerX = baseWidth / 2;

  // Draw Circular Emblem Logo Badge (Top Center)
  const logoCenterY = 48;
  const logoRadius = 28;

  ctx.beginPath();
  ctx.arc(centerX, logoCenterY, logoRadius, 0, Math.PI * 2);
  ctx.fillStyle = '#eff6ff';
  ctx.fill();
  ctx.strokeStyle = '#bfdbfe';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  try {
    const img = new Image();
    img.src = LOGO_BASE64;
    await new Promise((resolve) => {
      if (img.complete) resolve();
      else {
        img.onload = () => resolve();
        img.onerror = () => resolve();
      }
    });
    ctx.drawImage(img, centerX - 20, logoCenterY - 20, 40, 40);
  } catch (e) {
    console.warn('Receipt logo draw skipped', e);
  }

  // H1 Headline: Penumuli Perantalamma Youth
  ctx.textAlign = 'center';
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 18px "Plus Jakarta Sans", sans-serif, Arial';
  ctx.fillText('Penumuli Perantalamma Youth', centerX, 98);

  // Tagline: Penumuli Village, Duggirala Mandal, Guntur District
  ctx.fillStyle = '#64748b';
  ctx.font = '600 11px "Plus Jakarta Sans", sans-serif, Arial';
  ctx.fillText('Penumuli Village, Duggirala Mandal, Guntur District', centerX, 115);

  // Official Donor Receipt Badge
  const badgeWidth = 160;
  const badgeHeight = 22;
  const badgeX = centerX - badgeWidth / 2;
  const badgeY = 125;

  drawRoundedRect(badgeX, badgeY, badgeWidth, badgeHeight, 11, '#ecfdf5', '#a7f3d0');
  ctx.fillStyle = '#065f46';
  ctx.font = 'bold 9.5px "Plus Jakarta Sans", sans-serif, Arial';
  ctx.fillText('OFFICIAL DONATION RECEIPT', centerX, badgeY + 15);

  // Dashed Divider 1
  ctx.setLineDash([4, 4]);
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(22, 158);
  ctx.lineTo(baseWidth - 22, 158);
  ctx.stroke();
  ctx.setLineDash([]);

  // Secondary Metadata Grid (Date, Paid At, Method)
  const metaBoxY = 168;
  const metaBoxH = 74;
  drawRoundedRect(22, metaBoxY, baseWidth - 44, metaBoxH, 12, '#f8fafc', '#f1f5f9');

  const colLeft = 34;
  const colRight = baseWidth - 34;

  // Metadata Row 1: Date
  ctx.textAlign = 'left';
  ctx.fillStyle = '#64748b';
  ctx.font = '500 11px "Plus Jakarta Sans", sans-serif, Arial';
  ctx.fillText('Date', colLeft, metaBoxY + 20);

  ctx.textAlign = 'right';
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 11.5px "Plus Jakarta Sans", sans-serif, Arial';
  ctx.fillText(dateFormatted, colRight, metaBoxY + 20);

  // Metadata Row 2: Paid At
  ctx.textAlign = 'left';
  ctx.fillStyle = '#64748b';
  ctx.font = '500 11px "Plus Jakarta Sans", sans-serif, Arial';
  ctx.fillText('Paid At', colLeft, metaBoxY + 42);

  ctx.textAlign = 'right';
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 11.5px "Plus Jakarta Sans", sans-serif, Arial';
  ctx.fillText(timeFormatted, colRight, metaBoxY + 42);

  // Metadata Row 3: Payment Method (with white badge)
  ctx.textAlign = 'left';
  ctx.fillStyle = '#64748b';
  ctx.font = '500 11px "Plus Jakarta Sans", sans-serif, Arial';
  ctx.fillText('Payment Method', colLeft, metaBoxY + 62);

  ctx.font = '600 10.5px "Plus Jakarta Sans", sans-serif, Arial';
  const modeWidth = ctx.measureText(paymentMethod).width;
  const badgeW = modeWidth + 14;
  drawRoundedRect(colRight - badgeW, metaBoxY + 49, badgeW, 18, 5, '#ffffff', '#e2e8f0');

  ctx.textAlign = 'center';
  ctx.fillStyle = '#334155';
  ctx.fillText(paymentMethod, colRight - badgeW / 2, metaBoxY + 62);

  // Dashed Divider 2
  ctx.setLineDash([4, 4]);
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(22, 254);
  ctx.lineTo(baseWidth - 22, 254);
  ctx.stroke();
  ctx.setLineDash([]);

  // ==========================================
  // MAIN HERO SECTION: 1-to-1 Exact Match of On-Screen Modal Card
  // ==========================================
  const statementStartY = 282;
  const lineHeight = 24;

  // Multi-token lines structured identically to on-screen preview
  const lines = [
    // Line 1: Mr/Miss: [Donor Name]
    [
      { text: 'Mr/Miss: ', font: 'bold 14px "Plus Jakarta Sans", sans-serif, Arial', color: '#0f172a' },
      { text: donorName, font: '900 16px "Plus Jakarta Sans", sans-serif, Arial', color: '#ea580c' },
    ],
    // Line 2: has generously contributed an amount of
    [
      { text: 'has generously contributed an amount of', font: '500 13px "Plus Jakarta Sans", sans-serif, Arial', color: '#334155' },
    ],
    // Line 3: ₹[Amount] towards the Vinayaka festival /
    [
      { text: `₹${amount.toLocaleString('en-IN')}`, font: 'bold 15px "Plus Jakarta Sans", sans-serif, Arial', color: '#047857' },
      { text: ' towards the ', font: '500 13px "Plus Jakarta Sans", sans-serif, Arial', color: '#334155' },
      { text: 'Vinayaka festival /', font: 'bold 13.5px "Plus Jakarta Sans", sans-serif, Arial', color: '#0f172a' },
    ],
    // Line 4: Puja, and the amount has been received
    [
      { text: 'Puja', font: 'bold 13.5px "Plus Jakarta Sans", sans-serif, Arial', color: '#0f172a' },
      { text: ', and the amount has been received', font: '500 13px "Plus Jakarta Sans", sans-serif, Arial', color: '#334155' },
    ],
    // Line 5: with heartfelt thanks.
    [
      { text: 'with heartfelt thanks.', font: '500 13px "Plus Jakarta Sans", sans-serif, Arial', color: '#334155' },
    ],
  ];

  let curY = statementStartY;
  ctx.textAlign = 'left';

  lines.forEach((lineTokens) => {
    let lineWidth = 0;
    lineTokens.forEach((token) => {
      ctx.font = token.font;
      lineWidth += ctx.measureText(token.text).width;
    });

    let curX = (baseWidth - lineWidth) / 2;
    lineTokens.forEach((token) => {
      ctx.font = token.font;
      ctx.fillStyle = token.color;
      ctx.fillText(token.text, curX, curY);
      curX += ctx.measureText(token.text).width;
    });

    curY += lineHeight;
  });

  // ==========================================
  // COMPLEMENTARY AMOUNT BADGE (Compact, Centered Pill)
  // ==========================================
  const pillWidth = 220;
  const pillHeight = 36;
  const pillX = (baseWidth - pillWidth) / 2;
  const pillY = curY + 12;

  drawRoundedRect(pillX, pillY, pillWidth, pillHeight, 18, '#ecfdf5', '#a7f3d0', 1.5);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#065f46';
  ctx.font = 'bold 9.5px "Plus Jakarta Sans", sans-serif, Arial';
  ctx.fillText('AMOUNT RECEIVED: ', centerX - 30, pillY + 23);

  ctx.fillStyle = '#047857';
  ctx.font = '900 15px "Plus Jakarta Sans", sans-serif, Arial';
  ctx.fillText(`₹${amount.toLocaleString('en-IN')}`, centerX + 46, pillY + 23);

  // Closing Thank You Note
  const thankYouY = pillY + 54;
  ctx.textAlign = 'center';
  ctx.fillStyle = '#0f52ba';
  ctx.font = 'bold 13.5px "Plus Jakarta Sans", sans-serif, Arial';
  ctx.fillText('Thanking you for your contribution.', centerX, thankYouY);

  // Footer Verification Note
  const footerY = thankYouY + 25;
  ctx.fillStyle = '#64748b';
  ctx.font = '600 9.5px "Plus Jakarta Sans", sans-serif, Arial';
  ctx.fillText('Penumuli Youth Committee · Authorized Digital Receipt', centerX, footerY);
  ctx.fillStyle = '#94a3b8';
  ctx.font = '400 8.5px "Plus Jakarta Sans", sans-serif, Arial';
  ctx.fillText('May Lord Ganesha shower blessings upon you and your family.', centerX, footerY + 14);

  return canvas;
}
