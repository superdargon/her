import { useEffect, useState } from 'react'

export default function TitleBar() {
  const [maximized, setMaximized] = useState(false)
  const api = window.electronAPI

  useEffect(() => {
    if (!api) return
    api.isMaximized().then(setMaximized)
    api.onMaximizeChange(setMaximized)
  }, [])

  const btn = (onClick: () => void, label: string, children: React.ReactNode, cls = '') => (
    <button className={`titlebar-btn ${cls}`} onClick={onClick} aria-label={label} tabIndex={-1}>{children}</button>
  )

  return (
    <div className="custom-titlebar" style={{ display:'flex',alignItems:'center',justifyContent:'space-between',height:38,padding:'0 8px 0 16px',background:'linear-gradient(135deg, rgba(255,245,250,0.96), rgba(252,240,255,0.94))',backdropFilter:'blur(20px)',borderBottom:'1px solid rgba(232,210,220,0.65)',WebkitAppRegion:'drag',userSelect:'none',flexShrink:0 } as React.CSSProperties}>
      <div style={{ display:'flex',alignItems:'center',gap:10,WebkitAppRegion:'drag' } as React.CSSProperties}>
        <span style={{ fontSize:13,fontWeight:700,color:'#b9758a',letterSpacing:'-0.01em' }}>妳</span>
      </div>
      <div style={{ display:'flex',gap:2,WebkitAppRegion:'no-drag' } as React.CSSProperties}>
        {btn(() => api?.minimizeWindow(), 'Minimize', <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>)}
        {btn(() => api?.maximizeWindow(), maximized ? 'Restore' : 'Maximize',
          maximized ? <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="2.5" y="0.5" width="10" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><rect x="0.5" y="2.5" width="10" height="10" rx="1.5" fill="rgba(255,245,250,0.96)" stroke="currentColor" strokeWidth="1.3"/></svg>
          : <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="1" y="1" width="11" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.3"/></svg>
        )}
        {btn(() => api?.closeWindow(), 'Close', <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3.5 3.5l7 7M10.5 3.5l-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>, 'titlebar-btn-close')}
      </div>
    </div>
  )
}
