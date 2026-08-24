export default function BadgeStock({ quantiteStock, seuilAlerte }) {
  if (quantiteStock <= 0) {
    return <span className="erp-badge erp-badge-danger">Rupture</span>;
  }
  if (quantiteStock <= seuilAlerte) {
    return <span className="erp-badge erp-badge-warning">Stock faible ({quantiteStock})</span>;
  }
  return <span className="erp-badge erp-badge-success">{quantiteStock} en stock</span>;
}