import { LOGO_BASE64 } from './logoBase64';

export async function createDonationReceiptCanvas(donation) {
  const rawDonorName = donation.donorName || donation.name || 'Devotee';
  const donorName = rawDonorName.trim();
  const amount = Number(donation.amount || 0);
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
    month: 'short',
    year: 'numeric',
  });
  const timeFormatted = txDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
  const paymentMethod = donation.paymentMethod || donation.paymentMode || 'Cash';

  // Scale for ultra-crisp 3x Retina output
  const scale = 3;
  const baseWidth = 390;
  // Precise tight canvas height matching content bounds with ZERO wasted white space
  const baseHeight = isLaddu ? 635 : 418;

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

  // Helper for rounded rectangle with rock-solid browser compatibility
  const drawRoundedRect = (x, y, w, h, radius, fill, stroke, strokeWidth = 1) => {
    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(x, y, w, h, radius);
    } else {
      ctx.moveTo(x + radius, y);
      ctx.arcTo(x + w, y, x + w, y + h, radius);
      ctx.arcTo(x + w, y + h, x, y + h, radius);
      ctx.arcTo(x, y + h, x, y, radius);
      ctx.arcTo(x, y, x + w, y, radius);
    }
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

  // Helper for drawing image with robust cross-origin & local handling
  const drawImageAsync = (src) =>
    new Promise((resolve) => {
      if (!src) return resolve(null);
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => {
        const retryImg = new Image();
        retryImg.onload = () => resolve(retryImg);
        retryImg.onerror = () => resolve(null);
        retryImg.src = src;
      };
      img.src = src;
    });

  const centerX = baseWidth / 2;

  // 1. Logo Emblem
  const logoImg = await drawImageAsync(LOGO_BASE64);
  ctx.save();
  ctx.beginPath();
  ctx.arc(centerX, 36, 18, 0, Math.PI * 2);
  ctx.fillStyle = '#eff6ff';
  ctx.fill();
  ctx.strokeStyle = '#bfdbfe';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();

  if (logoImg) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, 36, 15, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(logoImg, centerX - 15, 21, 30, 30);
    ctx.restore();
  }

  // 2. Header Text
  ctx.textAlign = 'center';
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 17px "Plus Jakarta Sans", sans-serif, Arial';
  ctx.fillText('Penumuli Perantalamma Youth', centerX, 72);

  ctx.fillStyle = '#64748b';
  ctx.font = '600 10px "Plus Jakarta Sans", sans-serif, Arial';
  ctx.fillText('Penumuli Village, Duggirala Mandal, Guntur District', centerX, 87);

  // 3. Official Receipt Pill Badge
  if (isLaddu) {
    drawRoundedRect(centerX - 120, 98, 240, 20, 10, '#ecfdf5', '#a7f3d0', 1);
    ctx.fillStyle = '#047857';
    ctx.font = '900 9.5px "Plus Jakarta Sans", sans-serif, Arial';
    ctx.fillText('LADDU AUCTION WINNER RECEIPT', centerX, 111);
  } else {
    drawRoundedRect(centerX - 95, 98, 190, 20, 10, '#ecfdf5', '#a7f3d0', 1);
    ctx.fillStyle = '#047857';
    ctx.font = 'bold 9.5px "Plus Jakarta Sans", sans-serif, Arial';
    ctx.fillText('OFFICIAL DONATION RECEIPT', centerX, 111);
  }

  // 4. Dashed Divider 1
  ctx.beginPath();
  ctx.setLineDash([4, 4]);
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  ctx.moveTo(24, 126);
  ctx.lineTo(baseWidth - 24, 126);
  ctx.stroke();
  ctx.setLineDash([]);

  if (isLaddu) {
    // =========================================================================
    // DEDICATED LADDU AUCTION WINNER RECEIPT CANVAS (With 'garu' honorific)
    // =========================================================================
    const avatarSrc = gender === 'Female' ? '/Female.png' : '/Male.png';
    const avatarImg = await drawImageAsync(avatarSrc);

    // Radiance Glow Circle behind avatar
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, 230, 85, 0, Math.PI * 2);
    ctx.fillStyle = gender === 'Female' ? '#f0fdf4' : '#fff7ed';
    ctx.fill();
    ctx.restore();

    // Draw Character Avatar preserving natural aspect ratio (1.5:1 landscape container)
    if (avatarImg) {
      const naturalAspect = (avatarImg.naturalWidth && avatarImg.naturalHeight)
        ? avatarImg.naturalWidth / avatarImg.naturalHeight
        : 1.5;
      
      const targetHeight = 195;
      const targetWidth = targetHeight * naturalAspect;
      const drawX = centerX - targetWidth / 2;
      const drawY = 135;

      ctx.drawImage(avatarImg, drawX, drawY, targetWidth, targetHeight);
    }

    // Congratulations
    ctx.textAlign = 'center';
    ctx.fillStyle = '#0f172a';
    ctx.font = '900 17px "Plus Jakarta Sans", sans-serif, Arial';
    ctx.fillText('✨ Congratulations! ✨', centerX, 355);

    // Devotee Name (Mr: / Miss: + Name (orange) + garu (dark))
    ctx.font = 'bold 15px "Plus Jakarta Sans", sans-serif, Arial';
    const prefixWidth = ctx.measureText(titlePrefix).width;
    ctx.font = '900 18px "Plus Jakarta Sans", sans-serif, Arial';
    const nameWidth = ctx.measureText(donorName).width;
    ctx.font = 'bold 15px "Plus Jakarta Sans", sans-serif, Arial';
    const garuWidth = ctx.measureText(' garu').width;
    const totalNameWidth = prefixWidth + nameWidth + garuWidth;

    let startNameX = centerX - totalNameWidth / 2;
    ctx.textAlign = 'left';
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 15px "Plus Jakarta Sans", sans-serif, Arial';
    ctx.fillText(titlePrefix, startNameX, 384);

    ctx.fillStyle = '#ea580c';
    ctx.font = '900 18px "Plus Jakarta Sans", sans-serif, Arial';
    ctx.fillText(donorName, startNameX + prefixWidth, 384);

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 15px "Plus Jakarta Sans", sans-serif, Arial';
    ctx.fillText(' garu', startNameX + prefixWidth + nameWidth, 384);

    // Subtext: is the proud winner of the
    ctx.textAlign = 'center';
    ctx.fillStyle = '#475569';
    ctx.font = '500 12.5px "Plus Jakarta Sans", sans-serif, Arial';
    ctx.fillText('is the proud winner of the', centerX, 408);

    // Ganesh Laddu Auction!
    ctx.fillStyle = '#047857';
    ctx.font = '900 17.5px "Plus Jakarta Sans", sans-serif, Arial';
    ctx.fillText('✨ Ganesh Laddu Auction! ✨', centerX, 434);

    // Winner Amount Pill (Dynamically centered)
    const ladduLabel = 'WINNER AMOUNT: ';
    const ladduAmt = `₹${amount.toLocaleString('en-IN')}`;
    ctx.font = '900 10.5px "Plus Jakarta Sans", sans-serif, Arial';
    const ladduLabelW = ctx.measureText(ladduLabel).width;
    ctx.font = '900 17.5px "Plus Jakarta Sans", sans-serif, Arial';
    const ladduAmtW = ctx.measureText(ladduAmt).width;
    const ladduPillW = ladduLabelW + ladduAmtW + 36;
    const ladduPillH = 40;
    const ladduPillX = centerX - ladduPillW / 2;
    const ladduPillY = 455;
    drawRoundedRect(ladduPillX, ladduPillY, ladduPillW, ladduPillH, 20, '#ecfdf5', '#a7f3d0', 1.5);

    let ladduTextX = ladduPillX + 18;
    ctx.textAlign = 'left';
    ctx.fillStyle = '#047857';
    ctx.font = '900 10.5px "Plus Jakarta Sans", sans-serif, Arial';
    ctx.fillText(ladduLabel, ladduTextX, ladduPillY + 25);

    ladduTextX += ladduLabelW;
    ctx.fillStyle = '#065f46';
    ctx.font = '900 17.5px "Plus Jakarta Sans", sans-serif, Arial';
    ctx.fillText(ladduAmt, ladduTextX, ladduPillY + 25);

    // Thanking Note
    ctx.textAlign = 'center';
    ctx.fillStyle = '#0f52ba';
    ctx.font = 'bold 13px "Plus Jakarta Sans", sans-serif, Arial';
    ctx.fillText('Thanking you for being a part of our celebration.', centerX, 528);

    // Official Footer Verification
    ctx.fillStyle = '#64748b';
    ctx.font = '600 9.5px "Plus Jakarta Sans", sans-serif, Arial';
    ctx.fillText('Penumuli Youth Committee · Authorized Digital Receipt', centerX, 560);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '500 8.5px "Plus Jakarta Sans", sans-serif, Arial';
    ctx.fillText('May Lord Ganesha shower blessings upon you and your family.', centerX, 578);

  } else {
    // =========================================================================
    // STANDARD CHANDA DONATION RECEIPT CANVAS (Perfect Alignment & Zero Dead Space)
    // =========================================================================
    // Subtle Metadata Line on Top of Content (Date • Time • Mode)
    ctx.textAlign = 'center';
    ctx.fillStyle = '#64748b';
    ctx.font = '600 10.5px "Plus Jakarta Sans", sans-serif, Arial';
    ctx.fillText(`${dateFormatted}   •   ${timeFormatted}   •   ${paymentMethod}`, centerX, 144);

    const lines = [
      [
        { text: 'Mr/Miss: ', font: 'bold 14.5px "Plus Jakarta Sans", sans-serif, Arial', color: '#0f172a' },
        { text: donorName, font: '900 16.5px "Plus Jakarta Sans", sans-serif, Arial', color: '#ea580c' },
        { text: ' garu', font: 'bold 14.5px "Plus Jakarta Sans", sans-serif, Arial', color: '#0f172a' },
      ],
      [
        { text: 'has generously contributed an amount of', font: '500 13.5px "Plus Jakarta Sans", sans-serif, Arial', color: '#334155' },
      ],
      [
        { text: `₹${amount.toLocaleString('en-IN')}`, font: 'bold 15.5px "Plus Jakarta Sans", sans-serif, Arial', color: '#047857' },
        { text: ' towards the ', font: '500 13.5px "Plus Jakarta Sans", sans-serif, Arial', color: '#334155' },
        { text: 'Vinayaka festival /', font: 'bold 14px "Plus Jakarta Sans", sans-serif, Arial', color: '#0f172a' },
      ],
      [
        { text: 'Puja', font: 'bold 14px "Plus Jakarta Sans", sans-serif, Arial', color: '#0f172a' },
        { text: ', and the amount has been received', font: '500 13.5px "Plus Jakarta Sans", sans-serif, Arial', color: '#334155' },
      ],
      [
        { text: 'with heartfelt thanks.', font: '500 13.5px "Plus Jakarta Sans", sans-serif, Arial', color: '#334155' },
      ],
    ];

    const statementStartY = 172; // Balanced top breathing space
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

    const statementEndY = statementStartY + (lines.length - 1) * lineHeight;

    // Amount Received Pill (Dynamically sized and 100% centered with zero dead space)
    const labelText = 'AMOUNT RECEIVED: ';
    const amountText = `₹${amount.toLocaleString('en-IN')}`;

    ctx.font = 'bold 10px "Plus Jakarta Sans", sans-serif, Arial';
    const labelW = ctx.measureText(labelText).width;

    ctx.font = '900 16.5px "Plus Jakarta Sans", sans-serif, Arial';
    const amountW = ctx.measureText(amountText).width;

    const totalContentW = labelW + amountW;
    const pillPaddingX = 18;
    const pillWidth = totalContentW + pillPaddingX * 2;
    const pillHeight = 36;
    const pillX = centerX - pillWidth / 2;
    const pillY = statementEndY + 22; // Balanced bottom breathing space

    drawRoundedRect(pillX, pillY, pillWidth, pillHeight, pillHeight / 2, '#ecfdf5', '#a7f3d0', 1.5);

    let drawTextX = pillX + pillPaddingX;
    ctx.textAlign = 'left';

    ctx.fillStyle = '#047857';
    ctx.font = 'bold 10px "Plus Jakarta Sans", sans-serif, Arial';
    ctx.fillText(labelText, drawTextX, pillY + 23);

    drawTextX += labelW;
    ctx.fillStyle = '#065f46';
    ctx.font = '900 16.5px "Plus Jakarta Sans", sans-serif, Arial';
    ctx.fillText(amountText, drawTextX, pillY + 23);

    const thankYouY = pillY + pillHeight + 22;
    ctx.textAlign = 'center';
    ctx.fillStyle = '#0f52ba';
    ctx.font = 'bold 12.5px "Plus Jakarta Sans", sans-serif, Arial';
    ctx.fillText('Thanking you for your contribution.', centerX, thankYouY);

    const footerY = thankYouY + 20;
    ctx.fillStyle = '#64748b';
    ctx.font = '600 9px "Plus Jakarta Sans", sans-serif, Arial';
    ctx.fillText('Penumuli Youth Committee · Authorized Digital Receipt', centerX, footerY);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '500 8px "Plus Jakarta Sans", sans-serif, Arial';
    ctx.fillText('May Lord Ganesha shower blessings upon you and your family.', centerX, footerY + 14);
  }

  return canvas;
}
