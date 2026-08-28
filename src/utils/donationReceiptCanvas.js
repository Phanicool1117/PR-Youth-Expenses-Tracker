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
  const baseWidth = 460;
  const baseHeight = 560; // Perfectly proportioned card with zero excess whitespace

  const canvas = document.createElement('canvas');
  canvas.width = baseWidth * scale;
  canvas.height = baseHeight * scale;

  const ctx = canvas.getContext('2d');
  ctx.scale(scale, scale);

  // Background Card with crisp white and subtle gradient
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, baseWidth, baseHeight);

  // Outer Border Outline
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(0, 0, baseWidth, baseHeight);

  // Top Accent Bar (Royal Blue #0f52ba)
  ctx.fillStyle = '#0f52ba';
  ctx.fillRect(0, 0, baseWidth, 6);

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
  const logoCenterY = 48;
  const logoRadius = 30;

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
    ctx.drawImage(img, logoCenterX - 22, logoCenterY - 22, 44, 44);
  } catch (e) {
    console.warn('Receipt logo draw skipped', e);
  }

  // H1 Headline: Penumuli Perantalamma Youth
  ctx.textAlign = 'center';
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 18px "Plus Jakarta Sans", sans-serif, Arial';
  ctx.fillText('Penumuli Perantalamma Youth', logoCenterX, 102);

  // Tagline: Penumuli Village, Duggirala Mandal, Guntur District
  ctx.fillStyle = '#64748b';
  ctx.font = '600 11px "Plus Jakarta Sans", sans-serif, Arial';
  ctx.fillText('Penumuli Village, Duggirala Mandal, Guntur District', logoCenterX, 118);

  // Official Donor Receipt Badge
  const badgeWidth = 166;
  const badgeHeight = 22;
  const badgeX = logoCenterX - badgeWidth / 2;
  const badgeY = 130;

  drawRoundedRect(badgeX, badgeY, badgeWidth, badgeHeight, 11, '#ecfdf5', '#a7f3d0');
  ctx.fillStyle = '#065f46';
  ctx.font = 'bold 10px "Plus Jakarta Sans", sans-serif, Arial';
  ctx.fillText('OFFICIAL DONATION RECEIPT', logoCenterX, badgeY + 15);

  // Dashed Divider (Equal symmetric spacing)
  ctx.setLineDash([4, 4]);
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(25, 166);
  ctx.lineTo(baseWidth - 25, 166);
  ctx.stroke();
  ctx.setLineDash([]); // reset dash

  // Metadata Grid (Date, Paid At, Method)
  const metaBoxY = 180;
  const metaBoxH = 68;
  drawRoundedRect(25, metaBoxY, baseWidth - 50, metaBoxH, 12, '#f8fafc', '#f1f5f9');

  const colLeft = 38;
  const colRight = baseWidth - 38;

  const drawMetaRow = (label, value, y) => {
    ctx.textAlign = 'left';
    ctx.fillStyle = '#64748b';
    ctx.font = '600 11px "Plus Jakarta Sans", sans-serif, Arial';
    ctx.fillText(label, colLeft, y);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 11.5px "Plus Jakarta Sans", sans-serif, Arial';
    ctx.fillText(value, colRight, y);
  };

  drawMetaRow('Date', dateFormatted, metaBoxY + 20);
  drawMetaRow('Paid At', timeFormatted, metaBoxY + 40);
  drawMetaRow('Payment Method', paymentMethod, metaBoxY + 60);

  // Formal Contribution Statement Box (Includes donor name in orange AND amount in green)
  const statementBoxY = 260;
  const statementBoxHeight = 100;
  drawRoundedRect(25, statementBoxY, baseWidth - 50, statementBoxHeight, 14, '#eff6ff', '#bfdbfe');

  ctx.textAlign = 'left';
  
  // Row 1: "Mr/Miss: " in dark slate, "[Donor Name]" in bold vibrant orange (#ea580c)
  ctx.fillStyle = '#1e293b';
  ctx.font = 'bold 12.5px "Plus Jakarta Sans", sans-serif, Arial';
  ctx.fillText('Mr/Miss: ', 38, statementBoxY + 24);
  
  const prefixWidth = ctx.measureText('Mr/Miss: ').width;
  ctx.fillStyle = '#ea580c'; // Vibrant Orange Highlight
  ctx.font = 'bold 13.5px "Plus Jakarta Sans", sans-serif, Arial';
  const nameTruncated = donorName.length > 28 ? donorName.substring(0, 26) + '...' : donorName;
  ctx.fillText(nameTruncated, 38 + prefixWidth, statementBoxY + 24);

  // Row 2: "has generously contributed an amount of ₹[Amount] towards the"
  ctx.fillStyle = '#334155';
  ctx.font = '500 11.5px "Plus Jakarta Sans", sans-serif, Arial';
  ctx.fillText('has generously contributed an amount of ', 38, statementBoxY + 45);
  
  const p1Width = ctx.measureText('has generously contributed an amount of ').width;
  ctx.fillStyle = '#047857';
  ctx.font = 'bold 12px "Plus Jakarta Sans", sans-serif, Arial';
  ctx.fillText(`₹${amount.toLocaleString('en-IN')}`, 38 + p1Width, statementBoxY + 45);

  const amtWidth = ctx.measureText(`₹${amount.toLocaleString('en-IN')}`).width;
  ctx.fillStyle = '#334155';
  ctx.font = '500 11.5px "Plus Jakarta Sans", sans-serif, Arial';
  ctx.fillText(' towards the', 38 + p1Width + amtWidth, statementBoxY + 45);

  // Row 3: "Vinayaka festival / Puja, and the amount has been"
  ctx.fillStyle = '#1e293b';
  ctx.font = '600 11.5px "Plus Jakarta Sans", sans-serif, Arial';
  ctx.fillText('Vinayaka festival / Puja', 38, statementBoxY + 66);
  
  const festivalWidth = ctx.measureText('Vinayaka festival / Puja').width;
  ctx.fillStyle = '#334155';
  ctx.font = '500 11.5px "Plus Jakarta Sans", sans-serif, Arial';
  ctx.fillText(', and the amount has been', 38 + festivalWidth, statementBoxY + 66);

  // Row 4: "received with heartfelt thanks."
  ctx.fillText('received with heartfelt thanks.', 38, statementBoxY + 86);

  // Highlighted Amount Card with Strong Visual Hierarchy
  const amtBoxY = 372;
  const amtBoxHeight = 80;

  drawRoundedRect(25, amtBoxY, baseWidth - 50, amtBoxHeight, 14, '#ecfdf5', '#6ee7b7', 1.5);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#065f46';
  ctx.font = 'bold 10.5px "Plus Jakarta Sans", sans-serif, Arial';
  ctx.fillText('DONATION CONTRIBUTION RECEIVED', logoCenterX, amtBoxY + 24);

  // Big, Bold, Eye-catching Amount
  ctx.fillStyle = '#047857';
  ctx.font = '900 32px "Plus Jakarta Sans", sans-serif, Arial';
  ctx.fillText(`₹${amount.toLocaleString('en-IN')}`, logoCenterX, amtBoxY + 62);

  // Closing Thank You Note
  ctx.textAlign = 'center';
  ctx.fillStyle = '#0f52ba';
  ctx.font = 'bold 12px "Plus Jakarta Sans", sans-serif, Arial';
  ctx.fillText('Thanking you for your contribution.', logoCenterX, 474);

  // Footer Verification
  ctx.fillStyle = '#94a3b8';
  ctx.font = '500 9px "Plus Jakarta Sans", sans-serif, Arial';
  ctx.fillText('Penumuli Youth Committee · Authorized Digital Receipt', logoCenterX, 506);
  ctx.fillText('May Lord Ganesha shower blessings upon you and your family.', logoCenterX, 522);

  return canvas;
}
