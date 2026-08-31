import { LOGO_BASE64 } from './logoBase64';

export async function createDonationReceiptCanvas(donation) {
  const rawDonorName = donation.donorName || donation.name || 'Devotee';
  const donorName = rawDonorName.trim();
  const donorNameWithGaru = `${donorName} garu`;
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
    month: 'long',
    year: 'numeric',
  });

  // Scale for ultra-crisp 3x Retina output
  const scale = 3;
  const baseWidth = 390;
  // Precise tight canvas height matching content bounds with ZERO wasted white space
  const baseHeight = isLaddu ? 635 : 435;

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
  ctx.arc(centerX, 38, 20, 0, Math.PI * 2);
  ctx.fillStyle = '#eff6ff';
  ctx.fill();
  ctx.strokeStyle = '#bfdbfe';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();

  if (logoImg) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, 38, 16, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(logoImg, centerX - 16, 22, 32, 32);
    ctx.restore();
  }

  // 2. Header Text
  ctx.textAlign = 'center';
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 17.5px "Plus Jakarta Sans", sans-serif, Arial';
  ctx.fillText('Penumuli Perantalamma Youth', centerX, 76);

  ctx.fillStyle = '#64748b';
  ctx.font = '600 10.5px "Plus Jakarta Sans", sans-serif, Arial';
  ctx.fillText('Penumuli Village, Duggirala Mandal, Guntur District', centerX, 92);

  // 3. Official Receipt Pill Badge
  if (isLaddu) {
    drawRoundedRect(centerX - 120, 102, 240, 20, 10, '#ecfdf5', '#a7f3d0', 1);
    ctx.fillStyle = '#047857';
    ctx.font = '900 9.5px "Plus Jakarta Sans", sans-serif, Arial';
    ctx.fillText('LADDU AUCTION WINNER RECEIPT', centerX, 115);
  } else {
    drawRoundedRect(centerX - 95, 102, 190, 20, 10, '#ecfdf5', '#a7f3d0', 1);
    ctx.fillStyle = '#047857';
    ctx.font = 'bold 9.5px "Plus Jakarta Sans", sans-serif, Arial';
    ctx.fillText('OFFICIAL DONATION RECEIPT', centerX, 115);
  }

  // 4. Dashed Divider 1
  ctx.beginPath();
  ctx.setLineDash([4, 4]);
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  ctx.moveTo(24, 132);
  ctx.lineTo(baseWidth - 24, 132);
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

    // Devotee Name (Mr: / Miss: + Name garu)
    ctx.font = 'bold 15px "Plus Jakarta Sans", sans-serif, Arial';
    const prefixWidth = ctx.measureText(titlePrefix).width;
    ctx.font = '900 18px "Plus Jakarta Sans", sans-serif, Arial';
    const nameWidth = ctx.measureText(donorNameWithGaru).width;
    const totalNameWidth = prefixWidth + nameWidth;

    let startNameX = centerX - totalNameWidth / 2;
    ctx.textAlign = 'left';
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 15px "Plus Jakarta Sans", sans-serif, Arial';
    ctx.fillText(titlePrefix, startNameX, 384);

    ctx.fillStyle = '#ea580c';
    ctx.font = '900 18px "Plus Jakarta Sans", sans-serif, Arial';
    ctx.fillText(donorNameWithGaru, startNameX + prefixWidth, 384);

    // Subtext: is the proud winner of the
    ctx.textAlign = 'center';
    ctx.fillStyle = '#475569';
    ctx.font = '500 12.5px "Plus Jakarta Sans", sans-serif, Arial';
    ctx.fillText('is the proud winner of the', centerX, 408);

    // Ganesh Laddu Auction!
    ctx.fillStyle = '#047857';
    ctx.font = '900 17.5px "Plus Jakarta Sans", sans-serif, Arial';
    ctx.fillText('✨ Ganesh Laddu Auction! ✨', centerX, 434);

    // Winner Amount Pill
    const pillW = 246;
    const pillH = 40;
    const pillX = centerX - pillW / 2;
    const pillY = 455;
    drawRoundedRect(pillX, pillY, pillW, pillH, 20, '#ecfdf5', '#a7f3d0', 1.5);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#047857';
    ctx.font = '900 10.5px "Plus Jakarta Sans", sans-serif, Arial';
    ctx.fillText('WINNER AMOUNT:', centerX - 44, pillY + 24);

    ctx.fillStyle = '#065f46';
    ctx.font = '900 17.5px "Plus Jakarta Sans", sans-serif, Arial';
    ctx.fillText(`₹${amount.toLocaleString('en-IN')}`, centerX + 50, pillY + 25);

    // Thanking Note
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
    // STANDARD CHANDA DONATION RECEIPT CANVAS (With 'garu' honorific)
    // =========================================================================
    const lines = [
      [
        { text: 'Mr/Miss: ', font: 'bold 14px "Plus Jakarta Sans", sans-serif, Arial', color: '#0f172a' },
        { text: donorNameWithGaru, font: '900 16px "Plus Jakarta Sans", sans-serif, Arial', color: '#ea580c' },
      ],
      [
        { text: 'has generously contributed an amount of', font: '500 13px "Plus Jakarta Sans", sans-serif, Arial', color: '#334155' },
      ],
      [
        { text: `₹${amount.toLocaleString('en-IN')}`, font: 'bold 15.5px "Plus Jakarta Sans", sans-serif, Arial', color: '#047857' },
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

    const statementStartY = 165;
    const lineHeight = 25;

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
