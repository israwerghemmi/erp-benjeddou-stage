import { useState } from 'react';
import api from '../services/api';

export default function ActivationMfa() {
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [code, setCode] = useState('');
  const [erreur, setErreur] = useState('');
  const [succes, setSucces] = useState('');
  const [etape, setEtape] = useState(1);

  const genererQrCode = async () => {
    setErreur('');
    try {
      const res = await api.post('/mfa/generer');
      setQrCodeUrl(res.data.qrCodeUrl);
      setEtape(2);
    } catch (err) {
      setErreur('Erreur lors de la génération du QR Code.');
    }
  };

  const activerMfa = async (e) => {
    e.preventDefault();
    setErreur('');
    try {
      await api.post('/mfa/activer', { code });
      setSucces('Authentification à deux facteurs activée avec succès.');
      setEtape(3);
    } catch (err) {
      setErreur(err.response?.data?.message || 'Code invalide.');
    }
  };

  return (
    <div className="erp-page">
      <div className="erp-container erp-container-md">
        <header className="erp-page-header">
          <h1>Authentification à deux facteurs</h1>
          <p>Renforcez la sécurité de votre compte</p>
        </header>

        {erreur && <div className="erp-alert erp-alert-error">{erreur}</div>}
        {succes && <div className="erp-alert erp-alert-success">{succes}</div>}

        <div className="erp-card erp-card-padded">
          {etape === 1 && (
            <>
              <p style={{ marginBottom: '1rem' }}>
                Scannez le QR Code avec une application d'authentification (Google Authenticator, Microsoft Authenticator) pour activer la double vérification.
              </p>
              <button onClick={genererQrCode} className="erp-btn erp-btn-accent">
                Générer le QR Code
              </button>
            </>
          )}

          {etape === 2 && (
            <>
              <img src={qrCodeUrl} alt="QR Code MFA" style={{ display: 'block', margin: '0 auto 1rem' }} />
              <form onSubmit={activerMfa} className="erp-form-row">
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Code à 6 chiffres"
                  className="erp-input"
                  maxLength={6}
                  required
                />
                <button type="submit" className="erp-btn erp-btn-accent">Activer</button>
              </form>
            </>
          )}

          {etape === 3 && (
            <p style={{ color: '#16a34a' }}>✓ La double authentification est maintenant active sur votre compte.</p>
          )}
        </div>
      </div>
    </div>
  );
}