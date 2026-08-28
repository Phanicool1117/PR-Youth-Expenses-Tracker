import { LOGO_BASE64 } from './logoBase64';

export async function createDonationReceiptCanvas(donation) {
  const donorName = donation.donorName || donation.name || 'Anonymous Donor';
  const amount = Number(donation.amount || 0);
  const paymentMethod = donation.paymentMethod || 'UPI / Cash';
  const invoiceId = donation.id || `DON_${Date.now().toString().slice(-6)}`;

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

  // Scale for ultra-crisp Retina HD output
  const scale = 2;
  const baseWidth = 520;
  const baseHeight = 720;

  const canvas = document.createElement('canvas');
  canvas.width = baseWidth * scale;
  canvas.height = baseHeight * scale;

  const ctx = canvas.getContext('2d');
  ctx.scale(scale, scale);

  // Background Gradient Card
  const bgGrad = ctx.createLinearGradient(0, 0, 0, baseHeight);
  bgGrad.addColorStop(0, '#ffffff');
  bgGrad.addColorStop(1, '#f8fafc');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, baseWidth, baseHeight);

  // Outer Border & Rounded Corner Outline
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 2;
  ctx.strokeRect(0, 0, baseWidth, baseHeight);

  // Top Accent Bar (Royal Blue #0f52ba)
  ctx.fillStyle = '#0f52ba';
  ctx.fillRect(0, 0, baseWidth, 8);

  // Draw Circular Emblem Logo Badge (Top Center)
  const logoCenterX = baseWidth / 2;
  const logoCenterY = 65;
  const logoRadius = 38;

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
    ctx.drawImage(img, logoCenterX - 28, logoCenterY - 28, 56, 56);
  } catch (e) {
    console.warn('Receipt logo draw skipped', e);
  }

  // H1 Headline: Penumuli Perantalamma Youth
  ctx.textAlign = 'center';
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 20px "Plus Jakarta Sans", sans-serif, Arial';
  ctx.fillText('Penumuli Perantalamma Youth', logoCenterX, 130);

  // Tagline: Penumuli Village, Duggirala Mandal, Guntur District
  ctx.fillStyle = '#64748b';
  ctx.font = '600 12px "Plus Jakarta Sans", sans-serif, Arial';
  ctx.fillText('Penumuli Village, Duggirala Mandal, Guntur District', logoCenterX, 150);

  // Official Donor Receipt Badge
  const badgeWidth = 180;
  const badgeHeight = 26;
  const badgeX = logoCenterX - badgeWidth / 2;
  const badgeY = 168;

  ctx.beginPath();
  ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 13);
  ctx.fillStyle = '#ecfdf5';
  ctx.fill();
  ctx.strokeStyle = '#a7f3d0';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = '#065f46';
  ctx.font = 'bold 11px "Plus Jakarta Sans", sans-serif, Arial';
  ctx.fillText('OFFICIAL DONATION RECEIPT', logoCenterX, badgeY + 17);

  // Dashed Divider 1
  ctx.setLineDash([4, 4]);
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(35, 215);
  ctx.lineTo(baseWidth - 35, 215);
  ctx.stroke();
  ctx.setLineDash([]); // reset dash

  // Metadata Grid (Invoice No, Date, Paid At, Method)
  const metaStartY = 245;
  const colLeft = 45;
  const colRight = baseWidth - 45;

  const drawMetaRow = (label, value, y) => {
    ctx.textAlign = 'left';
    ctx.fillStyle = '#64748b';
    ctx.font = '600 12px "Plus Jakarta Sans", sans-serif, Arial';
    ctx.fillText(label, colLeft, y);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 13px "Plus Jakarta Sans", sans-serif, Arial';
    ctx.fillText(value, colRight, y);
  };

  drawMetaRow('Receipt No', `#${invoiceId.replace('DON_', '')}`, metaStartY);
  drawMetaRow('Date', dateFormatted, metaStartY + 28);
  drawMetaRow('Paid At', timeFormatted, metaStartY + 56);
  drawMetaRow('Payment Method', paymentMethod, metaStartY + 84);

  // Dashed Divider 2
  ctx.setLineDash([4, 4]);
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(35, 355);
  ctx.lineTo(baseWidth - 35, 355);
  ctx.stroke();
  ctx.setLineDash([]); // reset dash

  // Formal Contribution Statement Box
  const statementBoxY = 375;
  const statementBoxHeight = 115;
  ctx.beginPath();
  ctx.roundRect(35, statementBoxY, baseWidth - 70, statementBoxHeight, 14);
  ctx.fillStyle = '#f8fafc';
  ctx.fill();
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Donor Acknowledgement Text Wrapping
  ctx.textAlign = 'left';
  ctx.fillStyle = '#334155';
  ctx.font = '500 12px "Plus Jakarta Sans", sans-serif, Arial';

  const line1 = `Mr/Miss: ${donorName}`;
  const line2 = `has generously contributed towards the`;
  const line3 = `Vinayaka festival / Puja, and the amount has been`;
  const line4 = `received with heartfelt thanks.`;

  ctx.font = 'bold 13px "Plus Jakarta Sans", sans-serif, Arial';
  ctx.fillStyle = '#0f172a';
  ctx.fillText(line1, 55, statementBoxY + 28);

  ctx.font = '500 12px "Plus Jakarta Sans", sans-serif, Arial';
  ctx.fillStyle = '#475569';
  ctx.fillText(line2, 55, statementBoxY + 50);
  ctx.fillText(line3, 55, statementBoxY + 70);
  ctx.fillText(line4, 55, statementBoxY + 90);

  // Highlighted Amount Card
  const amtBoxY = 510;
  const amtBoxHeight = 85;

  ctx.beginPath();
  ctx.roundRect(35, amtBoxY, baseWidth - 70, amtBoxHeight, 16);
  ctx.fillStyle = '#ecfdf5';
  ctx.fill();
  ctx.strokeStyle = '#6ee7b7';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.fillStyle = '#065f46';
  ctx.font = 'bold 11px "Plus Jakarta Sans", sans-serif, Arial';
  ctx.fillText('DONATION CONTRIBUTION RECEIVED', logoCenterX, amtBoxY + 28);

  ctx.fillStyle = '#047857';
  ctx.font = 'black 32px "Plus Jakarta Sans", sans-serif, Arial';
  ctx.fillText(`₹${amount.toLocaleString('en-IN')}`, logoCenterX, amtBoxY + 65);

  // Closing Thank You Note
  ctx.textAlign = 'center';
  ctx.fillStyle = '#0f52ba';
  ctx.font = 'bold 13px "Plus Jakarta Sans", sans-serif, Arial';
  ctx.fillText('Thanking you for your contribution.', logoCenterX, 625);

  // Footer Verification
  ctx.fillStyle = '#94a3b8';
  ctx.font = '500 10px "Plus Jakarta Sans", sans-serif, Arial';
  ctx.fillText('Penumuli Youth Committee · Authorized Digital Receipt', logoCenterX, 655);
  ctx.fillText('May Lord Ganesha shower blessings upon you and your family.', logoCenterX, 672);

  return canvas;
}
