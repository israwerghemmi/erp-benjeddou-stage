const { estDateValide, estDateFuture } = require('../utils/dateUtils');
const { validerDate } = require('../utils/validerDate');
const { validerChampsRequis } = require('../utils/validerFormulaire');
const { journaliserAction } = require('../utils/journaliser');

exports.creer = async (req, res) => {
  try {
    const { numero, client_id, produits, date_livraison_souhaitee } = req.body;
    // produits attendu : [{ produit_id, quantite, prix_unitaire }, ...]

    const manquants = validerChampsRequis(req.body, ['numero', 'client_id', 'produits']);
    if (manquants.length > 0) {
      return res.status(400).json({ message: `Champs requis manquants : ${manquants.join(', ')}` });
    }
    if (!Array.isArray(produits) || produits.length === 0) {
      return res.status(400).json({ message: 'Au moins un produit est requis.' });
    }
    if (date_livraison_souhaitee && !estDateValide(date_livraison_souhaitee)) {
      return res.status(400).json({ message: 'Date de livraison souhaitée invalide.' });
    }
    if (date_livraison_souhaitee && !estDateFuture(date_livraison_souhaitee)) {
      return res.status(400).json({ message: 'Date de livraison souhaitée doit être une date future.' });
    }

    const montant_total = produits.reduce((sum, p) => sum + (p.quantite * p.prix_unitaire), 0);

    const devis = await req.tenantModels.Devis.create({ numero, client_id, montant_total, date_livraison_souhaitee });

    // Associer les produits via la table de liaison
    for (const p of produits) {
      await devis.addProduit(p.produit_id, {
        through: { quantite: p.quantite, prix_unitaire: p.prix_unitaire },
      });
    }

    const devisComplet = await req.tenantModels.Devis.findByPk(devis.id, {
      include: [req.tenantModels.Produit, req.tenantModels.ClientCommercial],
    });

    await journaliserAction(req, 'creation_devis', { devis_id: devis.id, numero: devis.numero });

    res.status(201).json(devisComplet);
  } catch (error) {
    console.error('Erreur création devis :', error);
    res.status(500).json({ message: 'Erreur lors de la création du devis.', error: error.message });
  }
};

exports.listerTous = async (req, res) => {
  try {
    const devis = await req.tenantModels.Devis.findAll({
      include: [req.tenantModels.Produit, req.tenantModels.ClientCommercial],
    });
    res.json(devis);
  } catch (error) {
    console.error('Erreur listage devis :', error);
    res.status(500).json({ message: 'Erreur.', error: error.message });
  }
};

exports.obtenirUn = async (req, res) => {
  try {
    const devis = await req.tenantModels.Devis.findByPk(req.params.id, {
      include: [req.tenantModels.Produit, req.tenantModels.ClientCommercial],
    });
    if (!devis) return res.status(404).json({ message: 'Devis introuvable.' });
    res.json(devis);
  } catch (error) {
    console.error('Erreur lecture devis :', error);
    res.status(500).json({ message: 'Erreur.', error: error.message });
  }
};

exports.modifierStatut = async (req, res) => {
  try {
    const devis = await req.tenantModels.Devis.findByPk(req.params.id);
    if (!devis) return res.status(404).json({ message: 'Devis introuvable.' });

    devis.statut = req.body.statut; // en_attente | accepte | refuse
    await devis.save();

    await journaliserAction(req, 'modification_statut_devis', { devis_id: devis.id, nouveau_statut: devis.statut });

    res.json(devis);
  } catch (error) {
    console.error('Erreur modification statut devis :', error);
    res.status(500).json({ message: 'Erreur lors de la modification.', error: error.message });
  }
};

exports.supprimer = async (req, res) => {
  try {
    const devis = await req.tenantModels.Devis.findByPk(req.params.id);
    if (!devis) return res.status(404).json({ message: 'Devis introuvable.' });

    await devis.destroy();
    await journaliserAction(req, 'suppression_devis', { devis_id: req.params.id });

    res.json({ message: 'Devis supprimé.' });
  } catch (error) {
    console.error('Erreur suppression devis :', error);
    res.status(500).json({ message: 'Erreur lors de la suppression.', error: error.message });
  }
};

exports.convertirEnCommande = async (req, res) => {
  try {
    const { Devis, Commande, Produit } = req.tenantModels;

    const devis = await Devis.findByPk(req.params.id, { include: [Produit] });
    if (!devis) return res.status(404).json({ message: 'Devis introuvable.' });

    if (devis.statut !== 'accepte') {
      return res.status(400).json({ message: 'Seul un devis accepté peut être converti en commande.' });
    }

    const numeroCommande = `CMD-${Date.now()}`;
    const commande = await Commande.create({
      numero: numeroCommande,
      client_id: devis.client_id,
      montant_total: devis.montant_total,
      statut: 'en_cours',
    });

    for (const produit of devis.Produits) {
      await commande.addProduit(produit.id, {
        through: {
          quantite: produit.devis_produit.quantite,
          prix_unitaire: produit.devis_produit.prix_unitaire,
        },
      });
    }

    await journaliserAction(req, 'conversion_devis_commande', { devis_id: devis.id, commande_id: commande.id });

    res.status(201).json({ message: 'Devis converti en commande avec succès.', commande });
  } catch (error) {
    console.error('Erreur conversion devis → commande :', error);
    res.status(500).json({ message: 'Erreur lors de la conversion.', error: error.message });
  }
};