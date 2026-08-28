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

  // Scale for ultra-crisp Retina HD output
  const scale = 2;
  const baseWidth = 480;
  const baseHeight = 580; // Compact, perfectly framed height with zero excess whitespace

  const canvas = document.createElement('canvas');
  canvas.width = baseWidth * scale;
  canvas.height = baseHeight * scale;

  const ctx = canvas.getContext('2d');
  ctx.scale(scale, scale);

  // Background Crisp White Card with Subtle Gradient
  const bgGrad = ctx.createLinearGradient(0, 0, 0, baseHeight);
  bgGrad.addColorStop(0, '#ffffff');
  bgGrad.addColorStop(1, '#f8fafc');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, baseWidth, baseHeight);

  // Outer Border Outline
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 2;
  ctx.strokeRect(0, 0, baseWidth, baseHeight);

  // Top Accent Bar (Royal Blue #0f52ba)
  ctx.fillStyle = '#0f52ba';
  ctx.fillRect(0, 0, baseWidth, 6);

  // Draw Circular Emblem Logo Badge (Top Center)
  const logoCenterX = baseWidth / 2;
  const logoCenterY = 52;
  const logoRadius = 32;

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
    ctx.drawImage(img, logoCenterX - 24, logoCenterY - 24, 48, 48);
  } catch (e) {
    console.warn('Receipt logo draw skipped', e);
  }

  // H1 Headline: Penumuli Perantalamma Youth
  ctx.textAlign = 'center';
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 18px "Plus Jakarta Sans", sans-serif, Arial';
  ctx.fillText('Penumuli Perantalamma Youth', logoCenterX, 108);

  // Tagline: Penumuli Village, Duggirala Mandal, Guntur District
  ctx.fillStyle = '#64748b';
  ctx.font = '600 11px "Plus Jakarta Sans", sans-serif, Arial';
  ctx.fillText('Penumuli Village, Duggirala Mandal, Guntur District', logoCenterX, 126);

  // Official Donor Receipt Badge
  const badgeWidth = 170;
  const badgeHeight = 24;
  const badgeX = logoCenterX - badgeWidth / 2;
  const badgeY = 140;

  ctx.beginPath();
  ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 12);
  ctx.fillStyle = '#ecfdf5';
  ctx.fill();
  ctx.strokeStyle = '#a7f3d0';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = '#065f46';
  ctx.font = 'bold 10.5px "Plus Jakarta Sans", sans-serif, Arial';
  ctx.fillText('OFFICIAL DONATION RECEIPT', logoCenterX, badgeY + 16);

  // Dashed Divider
  ctx.setLineDash([4, 4]);
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(30, 180);
  ctx.lineTo(baseWidth - 30, 180);
  ctx.stroke();
  ctx.setLineDash([]); // reset dash

  // Metadata Grid (Date, Paid At, Method) - Receipt No Removed
  const metaBoxY = 194;
  const metaBoxH = 72;
  ctx.beginPath();
  ctx.roundRect(30, metaBoxY, baseWidth - 60, metaBoxH, 12);
  ctx.fillStyle = '#f8fafc';
  ctx.fill();
  ctx.strokeStyle = '#f1f5f9';
  ctx.lineWidth = 1;
  ctx.stroke();

  const colLeft = 45;
  const colRight = baseWidth - 45;

  const drawMetaRow = (label, value, y) => {
    ctx.textAlign = 'left';
    ctx.fillStyle = '#64748b';
    ctx.font = '600 11px "Plus Jakarta Sans", sans-serif, Arial';
    ctx.fillText(label, colLeft, y);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 12px "Plus Jakarta Sans", sans-serif, Arial';
    ctx.fillText(value, colRight, y);
  };

  drawMetaRow('Date', dateFormatted, metaBoxY + 22);
  drawMetaRow('Paid At', timeFormatted, metaBoxY + 44);
  drawMetaRow('Payment Method', paymentMethod, metaBoxY + 66);

  // Formal Contribution Statement Box (Tight, Highlighted Orange Donor Name & Green Amount)
  const statementBoxY = 280;
  const statementBoxHeight = 100;
  ctx.beginPath();
  ctx.roundRect(30, statementBoxY, baseWidth - 60, statementBoxHeight, 14);
  ctx.fillStyle = '#eff6ff';
  ctx.fill();
  ctx.strokeStyle = '#bfdbfe';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Donor Acknowledgement Text with Orange Highlighted Name
  ctx.textAlign = 'left';
  
  // Row 1: "Mr/Miss: " in dark slate, "[Donor Name]" in bold vibrant orange (#ea580c)
  ctx.fillStyle = '#334155';
  ctx.font = 'bold 12.5px "Plus Jakarta Sans", sans-serif, Arial';
  ctx.fillText('Mr/Miss: ', 45, statementBoxY + 26);
  
  const prefixWidth = ctx.measureText('Mr/Miss: ').width;
  ctx.fillStyle = '#ea580c'; // Vibrant Orange Highlight
  ctx.font = 'bold 13.5px "Plus Jakarta Sans", sans-serif, Arial';
  ctx.fillText(donorName, 45 + prefixWidth, statementBoxY + 26);

  // Row 2 & 3: Description
  ctx.fillStyle = '#475569';
  ctx.font = '500 11.5px "Plus Jakarta Sans", sans-serif, Arial';
  ctx.fillText(`has generously contributed towards the`, 45, statementBoxY + 48);
  ctx.fillText(`Vinayaka festival / Puja, and the amount has been`, 45, statementBoxY + 68);
  ctx.fillText(`received with heartfelt thanks.`, 45, statementBoxY + 88);

  // Highlighted Amount Card
  const amtBoxY = 394;
  const amtBoxHeight = 72;

  ctx.beginPath();
  ctx.roundRect(30, amtBoxY, baseWidth - 60, amtBoxHeight, 14);
  ctx.fillStyle = '#ecfdf5';
  ctx.fill();
  ctx.strokeStyle = '#6ee7b7';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.fillStyle = '#065f46';
  ctx.font = 'bold 10px "Plus Jakarta Sans", sans-serif, Arial';
  ctx.fillText('DONATION CONTRIBUTION RECEIVED', logoCenterX, amtBoxY + 24);

  ctx.fillStyle = '#047857';
  ctx.font = 'black 28px "Plus Jakarta Sans", sans-serif, Arial';
  ctx.fillText(`₹${amount.toLocaleString('en-IN')}`, logoCenterX, amtBoxY + 56);

  // Closing Thank You Note
  ctx.textAlign = 'center';
  ctx.fillStyle = '#0f52ba';
  ctx.font = 'bold 12px "Plus Jakarta Sans", sans-serif, Arial';
  ctx.fillText('Thanking you for your contribution.', logoCenterX, 492);

  // Footer Verification
  ctx.fillStyle = '#94a3b8';
  ctx.font = '500 9.5px "Plus Jakarta Sans", sans-serif, Arial';
  ctx.fillText('Penumuli Youth Committee · Authorized Digital Receipt', logoCenterX, 524);
  ctx.fillText('May Lord Ganesha shower blessings upon you and your family.', logoCenterX, 540);

  return canvas;
}
