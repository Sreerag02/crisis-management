import React from 'react';

export const Icon = ({ name, size = 16 }) => {
  const icons = {
    dashboard: '📊', alert: '🚨', volunteer: '🤝', shelter: '🏠',
    resource: '📦', family: '👨‍👩‍👧', broadcast: '📢', heatmap: '🗺️',
    sos: '🆘', settings: '⚙️', logout: '🚪', search: '🔍',
    notif: '🔔', user: '👤', plus: '➕', filter: '⚡',
    check: '✓', warning: '⚠️', info: 'ℹ️', close: '✕',
    phone: '📞', location: '📍', clock: '🕐', download: '⬇️',
    edit: '✏️', delete: '🗑️', deploy: '🚀', refresh: '🔄',
  };
  return <span style={{ fontSize: size + 'px', lineHeight: 1 }}>{icons[name] || '•'}</span>;
};
