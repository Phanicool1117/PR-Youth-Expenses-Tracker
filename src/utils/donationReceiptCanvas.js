import { LOGO_BASE64 } from './logoBase64';
import { MALE_AVATAR_BASE64, FEMALE_AVATAR_BASE64 } from './winnerAvatarsBase64';

export async function createDonationReceiptCanvas(donation) {
  const donorName = donation.donorName || donation.name || 'Devotee';
  const amount = Number(donation.amount || 0);
  const paymentMethod = donation.paymentMethod || 'Cash';
  const isLaddu = donation.subType === 'Laddu' || String(donation.note || '').toLowerCase().includes('laddu') || donation.category === 'Laddu Prasadam Auction';
  const gender = donation.gender === 'Female' ? 'Female' : 'Male';

  // Dynamic prefix based on gender for Laddu or general default
  const titlePrefix = isLaddu
    ? gender === 'Female'
      ? 'Miss: '
      : 'Mr: '
    : donation.titlePrefix ? `${donation.titlePrefix} ` : 'Mr/Miss: ';

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
  const baseHeight = isLaddu ? 640 : 490;

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

  // Helper for drawing image
  const drawImageAsync = (src) =>
    new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = src;
    });

  const centerX = baseWidth / 2;

  // 1. Logo Emblem
  const logoImg = await drawImageAsync(LOGO_BASE64);
  ctx.save();
  ctx.beginPath();
  ctx.arc(centerX, 42, 22, 0, Math.PI * 2);
  ctx.fillStyle = '#eff6ff';
  ctx.fill();
  ctx.strokeStyle = '#bfdbfe';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();

  if (logoImg) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, 42, 18, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(logoImg, centerX - 18, 24, 36, 36);
    ctx.restore();
  }

  // 2. Header Text
  ctx.textAlign = 'center';
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 18px "Plus Jakarta Sans", sans-serif, Arial';
  ctx.fillText('Penumuli Perantalamma Youth', centerX, 84);

  ctx.fillStyle = '#64748b';
  ctx.font = '600 10.5px "Plus Jakarta Sans", sans-serif, Arial';
  ctx.fillText('Penumuli Village, Duggirala Mandal, Guntur District', centerX, 100);

  // 3. Official Receipt Pill Badge
  if (isLaddu) {
    drawRoundedRect(centerX - 125, 110, 250, 22, 11, '#ecfdf5', '#a7f3d0', 1);
    ctx.fillStyle = '#047857';
    ctx.font = '900 9.5px "Plus Jakarta Sans", sans-serif, Arial';
    ctx.fillText('LADDU AUCTION WINNER RECEIPT', centerX, 124);
  } else {
    drawRoundedRect(centerX - 95, 110, 190, 22, 11, '#ecfdf5', '#a7f3d0', 1);
    ctx.fillStyle = '#047857';
    ctx.font = 'bold 9.5px "Plus Jakarta Sans", sans-serif, Arial';
    ctx.fillText('OFFICIAL DONATION RECEIPT', centerX, 124);
  }

  // 4. Dashed Divider 1
  ctx.beginPath();
  ctx.setLineDash([4, 4]);
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  ctx.moveTo(24, 142);
  ctx.lineTo(baseWidth - 24, 142);
  ctx.stroke();
  ctx.setLineDash([]);

  if (isLaddu) {
    // =========================================================================
    // DEDICATED LADDU AUCTION WINNER RECEIPT CANVAS (Exact Match)
    // =========================================================================
    const avatarSrc = gender === 'Female' ? FEMALE_AVATAR_BASE64 : MALE_AVATAR_BASE64;
    const avatarImg = await drawImageAsync(avatarSrc);

    // Radiance Glow Circle behind avatar
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, 235, 75, 0, Math.PI * 2);
    ctx.fillStyle = gender === 'Female' ? '#f0fdf4' : '#fff7ed';
    ctx.fill();
    ctx.restore();

    // Draw Character Avatar
    if (avatarImg) {
      ctx.drawImage(avatarImg, centerX - 75, 150, 150, 150);
    }

    // Congratulations
    ctx.textAlign = 'center';
    ctx.fillStyle = '#0f172a';
    ctx.font = '900 17px "Plus Jakarta Sans", sans-serif, Arial';
    ctx.fillText('✨ Congratulations! ✨', centerX, 335);

    // Devotee Name (Mr:/Miss: + Name)
    ctx.font = 'bold 15px "Plus Jakarta Sans", sans-serif, Arial';
    const prefixWidth = ctx.measureText(titlePrefix).width;
    ctx.font = '900 18px "Plus Jakarta Sans", sans-serif, Arial';
    const nameWidth = ctx.measureText(donorName).width;
    const totalNameWidth = prefixWidth + nameWidth;

    let startNameX = centerX - totalNameWidth / 2;
    ctx.textAlign = 'left';
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 15px "Plus Jakarta Sans", sans-serif, Arial';
    ctx.fillText(titlePrefix, startNameX, 362);

    ctx.fillStyle = '#ea580c';
    ctx.font = '900 18px "Plus Jakarta Sans", sans-serif, Arial';
    ctx.fillText(donorName, startNameX + prefixWidth, 362);

    // Subtext: is the proud winner of the
    ctx.textAlign = 'center';
    ctx.fillStyle = '#475569';
    ctx.font = '500 12.5px "Plus Jakarta Sans", sans-serif, Arial';
    ctx.fillText('is the proud winner of the', centerX, 385);

    // Ganesh Laddu Auction!
    ctx.fillStyle = '#047857';
    ctx.font = '900 17px "Plus Jakarta Sans", sans-serif, Arial';
    ctx.fillText('✨ Ganesh Laddu Auction! ✨', centerX, 410);

    // Winner Amount Pill
    const pillW = 240;
    const pillH = 38;
    const pillX = centerX - pillW / 2;
    const pillY = 432;
    drawRoundedRect(pillX, pillY, pillW, pillH, 19, '#ecfdf5', '#a7f3d0', 1.5);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#047857';
    ctx.font = '900 10.5px "Plus Jakarta Sans", sans-serif, Arial';
    ctx.fillText('WINNER AMOUNT:', centerX - 42, pillY + 23);

    ctx.fillStyle = '#065f46';
    ctx.font = '900 17px "Plus Jakarta Sans", sans-serif, Arial';
    ctx.fillText(`₹${amount.toLocaleString('en-IN')}`, centerX + 48, pillY + 24);

    // Thanking Note
    ctx.fillStyle = '#0f52ba';
    ctx.font = 'bold 13px "Plus Jakarta Sans", sans-serif, Arial';
    ctx.fillText('Thanking you for being a part of our celebration.', centerX, 505);

    // Official Footer Verification
    ctx.fillStyle = '#64748b';
    ctx.font = '600 9.5px "Plus Jakarta Sans", sans-serif, Arial';
    ctx.fillText('Penumuli Youth Committee · Authorized Digital Receipt', centerX, 535);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '500 8.5px "Plus Jakarta Sans", sans-serif, Arial';
    ctx.fillText('May Lord Ganesha shower blessings upon you and your family.', centerX, 552);

  } else {
    // =========================================================================
    // STANDARD CHANDA DONATION RECEIPT CANVAS
    // =========================================================================
    const metaBoxX = 24;
    const metaBoxY = 155;
    const metaBoxW = baseWidth - 48;
    const metaBoxH = 88;
    drawRoundedRect(metaBoxX, metaBoxY, metaBoxW, metaBoxH, 12, '#f8fafc', '#f1f5f9', 1);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#64748b';
    ctx.font = '500 11px "Plus Jakarta Sans", sans-serif, Arial';
    ctx.fillText('Date', metaBoxX + 14, metaBoxY + 24);
    ctx.fillText('Paid At', metaBoxX + 14, metaBoxY + 48);
    ctx.fillText('Payment Method', metaBoxX + 14, metaBoxY + 72);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 11px "Plus Jakarta Sans", sans-serif, Arial';
    ctx.fillText(dateFormatted, metaBoxX + metaBoxW - 14, metaBoxY + 24);
    ctx.fillText(timeFormatted, metaBoxX + metaBoxW - 14, metaBoxY + 48);

    const methodPillW = ctx.measureText(paymentMethod).width + 16;
    const methodPillX = metaBoxX + metaBoxW - 14 - methodPillW;
    drawRoundedRect(methodPillX, metaBoxY + 59, methodPillW, 18, 6, '#ffffff', '#e2e8f0', 1);
    ctx.fillStyle = '#334155';
    ctx.font = '600 10.5px "Plus Jakarta Sans", sans-serif, Arial';
    ctx.textAlign = 'center';
    ctx.fillText(paymentMethod, methodPillX + methodPillW / 2, metaBoxY + 72);

    // Dashed Divider 2
    ctx.beginPath();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.moveTo(24, 255);
    ctx.lineTo(baseWidth - 24, 255);
    ctx.stroke();
    ctx.setLineDash([]);

    // Statement Lines
    const lines = [
      [
        { text: 'Mr/Miss: ', font: 'bold 14px "Plus Jakarta Sans", sans-serif, Arial', color: '#0f172a' },
        { text: donorName, font: '900 16px "Plus Jakarta Sans", sans-serif, Arial', color: '#ea580c' },
      ],
      [
        { text: 'has generously contributed an amount of', font: '500 13px "Plus Jakarta Sans", sans-serif, Arial', color: '#334155' },
      ],
      [
        { text: `₹${amount.toLocaleString('en-IN')}`, font: 'bold 15px "Plus Jakarta Sans", sans-serif, Arial', color: '#047857' },
        { text: ' towards the ', font: '500 13px "Plus Jakarta Sans", sans-serif, Arial', color: '#334155' },
        { text: 'Vinayaka festival /', font: 'bold 13.5px "Plus Jakarta Sans", sans-serif, Arial', color: '#0f172a' },
      ],
      [
        { text: 'Puja', font: 'bold 13.5px "Plus Jakarta Sans", sans-serif, Arial', color: '#0f172a' },
        { text: ', and the amount has been received', font: '500 13px "Plus Jakarta Sans", sans-serif, Arial', color: '#334155' },
      ],
      [
        { text: 'with heartfelt thanks.', font: '500 13px "Plus Jakarta Sans", sans-serif, Arial', color: '#334155' },
      ],
    ];

    const statementStartY = 275;
    const lineHeight = 24;

    lines.forEach((segmentList, idx) => {
      const currentY = statementStartY + idx * lineHeight;
      let totalLineWidth = 0;
      const measuredSegments = segmentList.map((seg) => {
        ctx.font = seg.font;
        const width = ctx.measureText(seg.text).width;
        totalLineWidth += width;
        return { ...seg, width };
      });

      let currentX = (baseWidth - totalLineWidth) / 2;
      ctx.textAlign = 'left';
      measuredSegments.forEach((seg) => {
        ctx.font = seg.font;
        ctx.fillStyle = seg.color;
        ctx.fillText(seg.text, currentX, currentY);
        currentX += seg.width;
      });
    });

    const statementEndY = statementStartY + lines.length * lineHeight;
    const pillY = statementEndY + 12;
    const pillWidth = 230;
    const pillHeight = 36;
    const pillX = centerX - pillWidth / 2;

    drawRoundedRect(pillX, pillY, pillWidth, pillHeight, pillHeight / 2, '#ecfdf5', '#6ee7b7', 1.5);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#065f46';
    ctx.font = 'bold 11px "Plus Jakarta Sans", sans-serif, Arial';
    ctx.fillText('AMOUNT RECEIVED:', centerX - 46, pillY + 22);

    ctx.fillStyle = '#047857';
    ctx.font = '900 16px "Plus Jakarta Sans", sans-serif, Arial';
    ctx.fillText(`₹${amount.toLocaleString('en-IN')}`, centerX + 46, pillY + 23);

    const thankYouY = pillY + pillHeight + 26;
    ctx.textAlign = 'center';
    ctx.fillStyle = '#0f52ba';
    ctx.font = 'bold 13px "Plus Jakarta Sans", sans-serif, Arial';
    ctx.fillText('Thanking you for your contribution.', centerX, thankYouY);

    const footerY = thankYouY + 26;
    ctx.fillStyle = '#64748b';
    ctx.font = '600 9.5px "Plus Jakarta Sans", sans-serif, Arial';
    ctx.fillText('Penumuli Youth Committee · Authorized Digital Receipt', centerX, footerY);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '500 8.5px "Plus Jakarta Sans", sans-serif, Arial';
    ctx.fillText('May Lord Ganesha shower blessings upon you and your family.', centerX, footerY + 16);
  }

  return canvas;
}
