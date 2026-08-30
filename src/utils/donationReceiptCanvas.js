import { LOGO_BASE64 } from './logoBase64';

export async function createDonationReceiptCanvas(donation) {
  const donorName = donation.donorName || donation.name || 'Devotee';
  const amount = Number(donation.amount || 0);
  const paymentMethod = donation.paymentMethod || 'UPI / Cash';
  const isLaddu = donation.subType === 'Laddu' || String(donation.note || '').toLowerCase().includes('laddu');
  const gender = donation.gender || 'Male';

  // Dynamic prefix based on gender for Laddu or general default
  const titlePrefix = isLaddu
    ? gender === 'Female'
      ? 'Ms. '
      : 'Mr. '
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

  // Pre-calculate exact positions so canvas height is dynamically tight with ZERO dead space
  const statementStartY = 282;
  const lineHeight = 24;

  const lines = isLaddu
    ? [
        // Line 1: [Mr./Ms.] [Winner Name]
        [
          { text: titlePrefix, font: 'bold 14px "Plus Jakarta Sans", sans-serif, Arial', color: '#0f172a' },
          { text: donorName, font: '900 16px "Plus Jakarta Sans", sans-serif, Arial', color: '#b45309' },
        ],
        // Line 2: has successfully won the Holy
        [
          { text: 'has successfully won the Holy', font: '500 13px "Plus Jakarta Sans", sans-serif, Arial', color: '#334155' },
        ],
        // Line 3: Sri Vinayaka Laddu Prasadam
        [
          { text: 'Sri Vinayaka Laddu Prasadam', font: 'bold 14px "Plus Jakarta Sans", sans-serif, Arial', color: '#0f172a' },
          { text: ' at auction with', font: '500 13px "Plus Jakarta Sans", sans-serif, Arial', color: '#334155' },
        ],
        // Line 4: an auspicious winning amount of ₹[Amount],
        [
          { text: 'an auspicious winning amount of ', font: '500 13px "Plus Jakarta Sans", sans-serif, Arial', color: '#334155' },
          { text: `₹${amount.toLocaleString('en-IN')}`, font: 'bold 15px "Plus Jakarta Sans", sans-serif, Arial', color: '#047857' },
        ],
        // Line 5: received with heartfelt devotional blessings.
        [
          { text: 'received with heartfelt devotional blessings.', font: '500 13px "Plus Jakarta Sans", sans-serif, Arial', color: '#334155' },
        ],
      ]
    : [
        // Line 1: Mr/Miss: [Donor Name]
        [
          { text: titlePrefix, font: 'bold 14px "Plus Jakarta Sans", sans-serif, Arial', color: '#0f172a' },
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

  const statementEndY = statementStartY + lines.length * lineHeight;
  const pillY = statementEndY + 12;
  const pillHeight = 36;
  const thankYouY = pillY + pillHeight + 28;
  const footerY = thankYouY + 28;
  const lastLineY = footerY + 15;
  const baseHeight = lastLineY + 24; // Exact tight bottom padding, zero wasted white space!

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

  // Top Accent Bar (Amber gradient for Laddu, Royal Blue for Chanda)
  if (isLaddu) {
    const grad = ctx.createLinearGradient(0, 0, baseWidth, 0);
    grad.addColorStop(0, '#f59e0b');
    grad.addColorStop(1, '#ea580c');
    ctx.fillStyle = grad;
  } else {
    ctx.fillStyle = '#0f52ba';
  }
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

  // 1. Logo Emblem
  const logoImg = await drawImageAsync(LOGO_BASE64);
  const centerX = baseWidth / 2;

  // Outer circular glow ring
  ctx.save();
  ctx.beginPath();
  ctx.arc(centerX, 48, 25, 0, Math.PI * 2);
  ctx.fillStyle = isLaddu ? '#fffbeb' : '#eff6ff';
  ctx.fill();
  ctx.strokeStyle = isLaddu ? '#fde68a' : '#bfdbfe';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();

  if (logoImg) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, 48, 20, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(logoImg, centerX - 20, 28, 40, 40);
    ctx.restore();
  }

  // 2. Header Text
  ctx.textAlign = 'center';
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 17px "Plus Jakarta Sans", sans-serif, Arial';
  ctx.fillText('Penumuli Perantalamma Youth', centerX, 92);

  ctx.fillStyle = '#64748b';
  ctx.font = '600 10.5px "Plus Jakarta Sans", sans-serif, Arial';
  ctx.fillText('Penumuli Village, Duggirala Mandal, Guntur District', centerX, 108);

  // 3. Official Receipt Pill Badge
  if (isLaddu) {
    drawRoundedRect(centerX - 120, 118, 240, 20, 10, '#fffbeb', '#fde68a', 1);
    ctx.fillStyle = '#92400e';
    ctx.font = 'bold 9px "Plus Jakarta Sans", sans-serif, Arial';
    ctx.fillText('SRI VINAYAKA LADDU PRASADAM AUCTION RECEIPT', centerX, 131);
  } else {
    drawRoundedRect(centerX - 95, 118, 190, 20, 10, '#ecfdf5', '#a7f3d0', 1);
    ctx.fillStyle = '#047857';
    ctx.font = 'bold 9.5px "Plus Jakarta Sans", sans-serif, Arial';
    ctx.fillText('OFFICIAL DONATION RECEIPT', centerX, 131);
  }

  // 4. Dashed Divider 1
  ctx.beginPath();
  ctx.setLineDash([4, 4]);
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  ctx.moveTo(24, 150);
  ctx.lineTo(baseWidth - 24, 150);
  ctx.stroke();
  ctx.setLineDash([]);

  // 5. Metadata Box (Date, Time, Method)
  const metaBoxX = 24;
  const metaBoxY = 160;
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

  // Method Pill
  const methodPillW = ctx.measureText(paymentMethod).width + 16;
  const methodPillX = metaBoxX + metaBoxW - 14 - methodPillW;
  drawRoundedRect(methodPillX, metaBoxY + 59, methodPillW, 18, 6, '#ffffff', '#e2e8f0', 1);
  ctx.fillStyle = '#334155';
  ctx.font = '600 10.5px "Plus Jakarta Sans", sans-serif, Arial';
  ctx.textAlign = 'center';
  ctx.fillText(paymentMethod, methodPillX + methodPillW / 2, metaBoxY + 72);

  // 6. Dashed Divider 2
  ctx.beginPath();
  ctx.setLineDash([4, 4]);
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  ctx.moveTo(24, 260);
  ctx.lineTo(baseWidth - 24, 260);
  ctx.stroke();
  ctx.setLineDash([]);

  // 7. Statement Lines (Center Aligned Multi-Font Multi-Color)
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

  // 8. Amount Pill (Centered below statement)
  const pillWidth = 230;
  const pillX = centerX - pillWidth / 2;
  if (isLaddu) {
    drawRoundedRect(pillX, pillY, pillWidth, pillHeight, pillHeight / 2, '#fffbeb', '#fde68a', 1.5);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#92400e';
    ctx.font = 'bold 11px "Plus Jakarta Sans", sans-serif, Arial';
    ctx.fillText('WINNING AMOUNT:', centerX - 42, pillY + 22);

    ctx.fillStyle = '#b45309';
    ctx.font = '900 16px "Plus Jakarta Sans", sans-serif, Arial';
    ctx.fillText(`₹${amount.toLocaleString('en-IN')}`, centerX + 50, pillY + 23);
  } else {
    drawRoundedRect(pillX, pillY, pillWidth, pillHeight, pillHeight / 2, '#ecfdf5', '#6ee7b7', 1.5);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#065f46';
    ctx.font = 'bold 11px "Plus Jakarta Sans", sans-serif, Arial';
    ctx.fillText('AMOUNT RECEIVED:', centerX - 46, pillY + 22);

    ctx.fillStyle = '#047857';
    ctx.font = '900 16px "Plus Jakarta Sans", sans-serif, Arial';
    ctx.fillText(`₹${amount.toLocaleString('en-IN')}`, centerX + 46, pillY + 23);
  }

  // 9. Thank You Note
  ctx.textAlign = 'center';
  ctx.fillStyle = isLaddu ? '#b45309' : '#0f52ba';
  ctx.font = 'bold 13px "Plus Jakarta Sans", sans-serif, Arial';
  ctx.fillText(
    isLaddu ? 'Devotional blessings for your auspicious contribution.' : 'Thanking you for your contribution.',
    centerX,
    thankYouY
  );

  // 10. Official Footer
  ctx.fillStyle = '#64748b';
  ctx.font = '600 9.5px "Plus Jakarta Sans", sans-serif, Arial';
  ctx.fillText('Penumuli Youth Committee · Authorized Digital Receipt', centerX, footerY);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '500 8.5px "Plus Jakarta Sans", sans-serif, Arial';
  ctx.fillText('May Lord Ganesha shower blessings upon you and your family.', centerX, lastLineY);

  return canvas;
}
