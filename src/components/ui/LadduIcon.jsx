import React from 'react';
import { LADDU_BASE64 } from '../../utils/ladduBase64';

// Exact 1:1 Replicative Laddu Icon from User Reference
export function LadduIcon({ className = "w-5 h-5", alt = "Laddu" }) {
  return (
    <img
      src={LADDU_BASE64 || "/laddu.png"}
      alt={alt}
      className={`inline-block object-contain select-none shrink-0 drop-shadow-xs ${className}`}
      draggable={false}
    />
  );
}
