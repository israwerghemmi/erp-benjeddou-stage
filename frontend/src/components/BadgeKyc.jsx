const LIBELLES = {
    non_soumis: 'Non soumis',
    en_attente: 'En attente',
    verifie: 'Vérifié',
    rejete: 'Rejeté',
};
  
const CLASSES = {
    non_soumis: 'erp-badge erp-badge-neutral',
    en_attente: 'erp-badge erp-badge-warning',
    verifie: 'erp-badge erp-badge-success',
    rejete: 'erp-badge erp-badge-danger',
};
  
export default function BadgeKyc({ statut }) {
    return <span className={CLASSES[statut] || CLASSES.non_soumis}>{LIBELLES[statut] || statut}</span>;
}
