import React, { useEffect } from 'react';

export default function Custom_scrollbar() {
  useEffect(() => {
    if (document.getElementById('custom-soft-scrollbar')) return;

    const style = document.createElement('style');
    style.id = 'custom-soft-scrollbar';
    style.innerHTML = `
      /* Firefox Standard Scrollbar */
      html, body, * {
        scrollbar-width: thin;
        scrollbar-color: #8b949e55 transparent;
      }

      /* WebKit Engines (Chrome, Edge, Safari, Opera) */
      ::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }
      ::-webkit-scrollbar-track {
        background: transparent;
      }
      ::-webkit-scrollbar-thumb {
        background: #8b949e55;
        border-radius: 9999px;
        transition: background 0.2s ease-in-out;
      }
      ::-webkit-scrollbar-thumb:hover {
        background: #8b949e99;
      }
      ::-webkit-scrollbar-corner {
        background: transparent;
      }
    `;

    document.head.appendChild(style);

    return () => {
      const existingStyle = document.getElementById('custom-soft-scrollbar');
      if (existingStyle) existingStyle.remove();
    };
  }, []);

  return null;
}