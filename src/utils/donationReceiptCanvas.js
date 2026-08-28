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
  const baseWidth = 440;
  const baseHeight = 490;

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

  // Draw Circular Emblem Logo Badge (Top Center)
  const logoCenterX = baseWidth / 2;
  const logoCenterY = 38;
  const logoRadius = 24;

  ctx.beginPath();
  ctx.arc(logoCenterX, logoCenterY, logoRadius, 0, Math.PI * 2);
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
    ctx.drawImage(img, logoCenterX - 18, logoCenterY - 18, 36, 36);
  } catch (e) {
    console.warn('Receipt logo draw skipped', e);
  }

  // H1 Headline: Penumuli Perantalamma Youth
  ctx.textAlign = 'center';
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 17px "Plus Jakarta Sans", sans-serif, Arial';
  ctx.fillText('Penumuli Perantalamma Youth', logoCenterX, 82);

  // Tagline: Penumuli Village, Duggirala Mandal, Guntur District
  ctx.fillStyle = '#64748b';
  ctx.font = '600 10.5px "Plus Jakarta Sans", sans-serif, Arial';
  ctx.fillText('Penumuli Village, Duggirala Mandal, Guntur District', logoCenterX, 97);

  // Official Donor Receipt Badge
  const badgeWidth = 156;
  const badgeHeight = 20;
  const badgeX = logoCenterX - badgeWidth / 2;
  const badgeY = 106;

  drawRoundedRect(badgeX, badgeY, badgeWidth, badgeHeight, 10, '#ecfdf5', '#a7f3d0');
  ctx.fillStyle = '#065f46';
  ctx.font = 'bold 9.5px "Plus Jakarta Sans", sans-serif, Arial';
  ctx.fillText('OFFICIAL DONATION RECEIPT', logoCenterX, badgeY + 14);

  // Dashed Divider 1
  ctx.setLineDash([4, 4]);
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(25, 136);
  ctx.lineTo(baseWidth - 25, 136);
  ctx.stroke();
  ctx.setLineDash([]);

  // Secondary Metadata Grid (Date, Paid At, Method)
  const metaBoxY = 146;
  const metaBoxH = 56;
  drawRoundedRect(25, metaBoxY, baseWidth - 50, metaBoxH, 10, '#f8fafc', '#f1f5f9');

  const colLeft = 36;
  const colRight = baseWidth - 36;

  const drawMetaRow = (label, value, y) => {
    ctx.textAlign = 'left';
    ctx.fillStyle = '#64748b';
    ctx.font = '600 10px "Plus Jakarta Sans", sans-serif, Arial';
    ctx.fillText(label, colLeft, y);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 10.5px "Plus Jakarta Sans", sans-serif, Arial';
    ctx.fillText(value, colRight, y);
  };

  drawMetaRow('Date', dateFormatted, metaBoxY + 16);
  drawMetaRow('Paid At', timeFormatted, metaBoxY + 32);
  drawMetaRow('Payment Method', paymentMethod, metaBoxY + 48);

  // Dashed Divider 2
  ctx.setLineDash([4, 4]);
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(25, 214);
  ctx.lineTo(baseWidth - 25, 214);
  ctx.stroke();
  ctx.setLineDash([]);

  // ==========================================
  // MAIN HERO SECTION: THE DONATION CONTEXT
  // (No artificial blue box background, pure prominent typography!)
  // ==========================================
  const statementStartY = 240;
  const maxRight = baseWidth - 30;
  const lineHeight = 22;

  const tokens = [
    { text: 'Mr/Miss: ', font: 'bold 14px "Plus Jakarta Sans", sans-serif', color: '#0f172a' },
    { text: `${donorName} `, font: '900 15px "Plus Jakarta Sans", sans-serif', color: '#ea580c' },
    { text: 'has generously contributed an amount of ', font: '500 13px "Plus Jakarta Sans", sans-serif', color: '#334155' },
    { text: `₹${amount.toLocaleString('en-IN')} `, font: 'bold 14px "Plus Jakarta Sans", sans-serif', color: '#047857' },
    { text: 'towards the ', font: '500 13px "Plus Jakarta Sans", sans-serif', color: '#334155' },
    { text: 'Vinayaka festival / Puja', font: 'bold 13px "Plus Jakarta Sans", sans-serif', color: '#0f172a' },
    { text: ', and the amount has been received with heartfelt thanks.', font: '500 13px "Plus Jakarta Sans", sans-serif', color: '#334155' },
  ];

  ctx.textAlign = 'left';
  let curX = 30;
  let curY = statementStartY;

  tokens.forEach((token) => {
    ctx.font = token.font;
    ctx.fillStyle = token.color;

    const words = token.text.split(' ');
    words.forEach((word, wIdx) => {
      if (!word && wIdx > 0) return;
      const wordWithSpace = wIdx < words.length - 1 ? word + ' ' : word;
      const metrics = ctx.measureText(wordWithSpace);

      if (curX + metrics.width > maxRight && curX > 30) {
        curX = 30;
        curY += lineHeight;
      }

      ctx.fillText(wordWithSpace, curX, curY);
      curX += metrics.width;
    });
  });

  // ==========================================
  // COMPLEMENTARY AMOUNT BADGE (Compact, Centered Pill)
  // ==========================================
  const pillWidth = 220;
  const pillHeight = 36;
  const pillX = (baseWidth - pillWidth) / 2;
  const pillY = 345;

  drawRoundedRect(pillX, pillY, pillWidth, pillHeight, 18, '#ecfdf5', '#a7f3d0', 1.5);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#065f46';
  ctx.font = 'bold 10px "Plus Jakarta Sans", sans-serif, Arial';
  ctx.fillText('AMOUNT RECEIVED: ', logoCenterX - 32, pillY + 23);

  ctx.fillStyle = '#047857';
  ctx.font = '900 15px "Plus Jakarta Sans", sans-serif, Arial';
  ctx.fillText(`₹${amount.toLocaleString('en-IN')}`, logoCenterX + 48, pillY + 23);

  // Closing Thank You Note
  const thankYouY = 412;
  ctx.textAlign = 'center';
  ctx.fillStyle = '#0f52ba';
  ctx.font = 'bold 13px "Plus Jakarta Sans", sans-serif, Arial';
  ctx.fillText('Thanking you for your contribution.', logoCenterX, thankYouY);

  // Footer Verification Note
  ctx.fillStyle = '#64748b';
  ctx.font = '600 9.5px "Plus Jakarta Sans", sans-serif, Arial';
  ctx.fillText('Penumuli Youth Committee · Authorized Digital Receipt', logoCenterX, thankYouY + 26);
  ctx.fillStyle = '#94a3b8';
  ctx.font = '400 8.5px "Plus Jakarta Sans", sans-serif, Arial';
  ctx.fillText('May Lord Ganesha shower blessings upon you and your family.', logoCenterX, thankYouY + 40);

  return canvas;
}
