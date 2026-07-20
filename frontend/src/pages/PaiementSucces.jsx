import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';

export default function PaiementSucces() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [statut, setStatut] = useState('verification');
  const [erreur, setErreur] = useState('');

  useEffect(() => {
    const verifier = async () => {
      try {
        const res = await api.get(`/paiement-en-ligne/verifier/${sessionId}`);
        setStatut(res.data.statut);
      } catch (err) {
        setErreur('Erreur lors de la vérification du paiement.');
        setStatut('erreur');
      }
    };
    if (sessionId) verifier();
  }, [sessionId]);

  return (
    <div className="erp-page">
      <div className="erp-container erp-container-md" style={{ textAlign: 'center', paddingTop: '4rem' }}>
        {statut === 'verification' && <p>Vérification du paiement en cours...</p>}

        {statut === 'reussi' && (
          <>
            <div className="erp-alert erp-alert-success">
              Paiement confirmé avec succès ! La commande a été mise à jour.
            </div>
            <Link to="/commandes" className="erp-btn erp-btn-accent" style={{ marginTop: '1rem', display: 'inline-block' }}>
              Retour aux commandes
            </Link>
          </>
        )}

        {(statut === 'echoue' || statut === 'erreur') && (
          <>
            <div className="erp-alert erp-alert-error">
              {erreur || 'Le paiement n\'a pas pu être confirmé.'}
            </div>
            <Link to="/commandes" className="erp-btn erp-btn-accent" style={{ marginTop: '1rem', display: 'inline-block' }}>
              Retour aux commandes
            </Link>
          </>
        )}
      </div>
    </div>
  );
}