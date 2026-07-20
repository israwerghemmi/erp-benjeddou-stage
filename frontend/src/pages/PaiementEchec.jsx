import { Link } from 'react-router-dom';

export default function PaiementEchec() {
  return (
    <div className="erp-page">
      <div className="erp-container erp-container-md" style={{ textAlign: 'center', paddingTop: '4rem' }}>
        <div className="erp-alert erp-alert-error">
          Le paiement a été annulé ou n'a pas abouti.
        </div>
        <Link to="/commandes" className="erp-btn erp-btn-accent" style={{ marginTop: '1rem', display: 'inline-block' }}>
          Retour aux commandes
        </Link>
      </div>
    </div>
  );
}