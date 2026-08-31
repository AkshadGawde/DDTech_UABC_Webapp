import React from 'react';

/**
 * Logo Component - Uses PNG asset
 */
export const Logo = ({ className = "h-8" }: { className?: string }) => (
  <img 
    src="/UABC Logo.png"
    alt="Universal Actuaries and Consultants LLP"
    className={`${className} object-contain select-none`}
    style={{ aspectRatio: 'auto', maxHeight: '100%' }}
  />
);
