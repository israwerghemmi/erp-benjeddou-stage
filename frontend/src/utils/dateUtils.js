export function formaterDateAffichage(dateIso) {
    if (!dateIso) return '-';
    const date = new Date(dateIso);
    if (isNaN(date.getTime())) return 'Date invalide';
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
  
  export function estDateValide(dateStr) {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    return !isNaN(date.getTime());
  }
  
  export function estDateFuture(dateStr) {
    if (!estDateValide(dateStr)) return false;
    return new Date(dateStr) > new Date();
  }
  
  export function estDatePassee(dateStr) {
    if (!estDateValide(dateStr)) return false;
    return new Date(dateStr) < new Date();
  }