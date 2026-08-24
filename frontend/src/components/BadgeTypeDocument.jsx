const LIBELLES = {
    devis: 'Devis',
    facture: 'Facture',
    bon_livraison: 'Bon de livraison',
    bon_reception: 'Bon de réception',
    contrat: 'Contrat',
    autre: 'Autre',
  };
  
const COULEURS = {
    devis: 'erp-badge erp-badge-warning',
    facture: 'erp-badge erp-badge-success',
    bon_livraison: 'erp-badge erp-badge-neutral',
    bon_reception: 'erp-badge erp-badge-neutral',
    contrat: 'erp-badge erp-badge-danger',
    autre: 'erp-badge erp-badge-neutral',
};
  
export default function BadgeTypeDocument({ type }) {
    return <span className={COULEURS[type] || COULEURS.autre}>{LIBELLES[type] || type}</span>;
}
