import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getBotQrcode, confirmBot } from '../api'

export default function ConnectPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [qrUrl, setQrUrl] = useState('')
  const [qrCode, setQrCode] = useState('')
  const [step, setStep] = useState<'init' | 'qr' | 'waiting' | 'done' | 'error'>('init')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const generateQR = async () => {
    setLoading(true); setMessage('')
    try {
      const resp = await getBotQrcode(id!)
      setQrUrl(resp.qrcode_url); setQrCode(resp.qrcode); setStep('qr')
    } catch (err: any) { setMessage(err.message); setStep('error') }
    finally { setLoading(false) }
  }

  const handleConfirm = async () => {
    setLoading(true); setMessage(''); setStep('waiting')
    try {
      const resp = await confirmBot(id!, qrCode)
      if (resp.status === 'waiting') { setMessage('用户暂未扫码，请使用微信扫描二维码'); setStep('qr') }
      else if (resp.status === 'connected') { setMessage('绑定成功！'); setStep('done'); setTimeout(() => navigate('/dashboard'), 2000) }
    } catch (err: any) { setMessage(err.message); setStep('error') }
    finally { setLoading(false) }
  }

  return (
    <div className="animate-fade-up">
      <div style={{ background: 'var(--color-surface)', textAlign: 'center', padding: '64px 20px' }}>
        <div style={{ maxWidth: 420, margin: '0 auto' }}>
          <h2 style={{ fontSize: 28, fontWeight: 600, letterSpacing: '-0.025em', marginBottom: 12, color: 'var(--color-text)' }}>绑定微信</h2>

          {step === 'init' && (
            <>
              <p style={{ fontSize: 17, marginBottom: 32, color: 'var(--color-text-secondary)' }}>生成二维码后，用微信扫码即可将角色添加到你的微信联系人</p>
              <button onClick={generateQR} disabled={loading} className="cta-primary" style={{ width: '100%' }}>{loading ? '生成中...' : '生成二维码'}</button>
            </>
          )}

          {(step === 'qr' || step === 'waiting') && (
            <>
              <div style={{ display: 'inline-flex', padding: 20, borderRadius: 20, marginBottom: 24, background: 'var(--color-surface)', boxShadow: '0 4px 24px var(--shadow-card)' }}>
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=192x192&data=${encodeURIComponent(qrUrl)}`}
                  alt="微信二维码"
                  style={{ width: 192, height: 192, borderRadius: 8 }}
                />
              </div>
              <p style={{ fontSize: 17, fontWeight: 600, marginBottom: 4, color: 'var(--color-text)' }}>打开微信扫一扫</p>
              <p style={{ fontSize: 15, marginBottom: 32, color: 'var(--color-text-secondary)' }}>扫描上方二维码绑定角色</p>
              <button onClick={handleConfirm} disabled={loading} className="cta-green" style={{ width: '100%', height: 48, fontSize: 17, fontWeight: 500 }}>{loading ? '确认中...' : '已扫码，确认绑定'}</button>
            </>
          )}

          {step === 'done' && (
            <>
              <div style={{ fontSize: 48, marginBottom: 16 }} aria-hidden="true">✅</div>
              <p style={{ fontSize: 21, fontWeight: 600, marginBottom: 4, color: 'var(--color-success)' }}>{message}</p>
              <p style={{ fontSize: 15, color: 'var(--color-text-secondary)' }}>即将返回首页...</p>
            </>
          )}

          {step === 'error' && (
            <>
              <div style={{ fontSize: 48, marginBottom: 16 }} aria-hidden="true">❌</div>
              <p style={{ fontSize: 17, marginBottom: 24, color: 'var(--color-danger)' }}>{message}</p>
              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={() => { setStep('init'); setMessage('') }} className="cta-outline" style={{ flex: 1 }}>重试</button>
                <button onClick={() => navigate('/dashboard')} className="cta-ghost" style={{ flex: 1 }}>返回首页</button>
              </div>
            </>
          )}

          {step !== 'error' && step !== 'done' && (
            <button onClick={() => navigate('/dashboard')} className="cta-ghost" style={{ marginTop: 24 }}>返回首页</button>
          )}
        </div>
      </div>
    </div>
  )
}