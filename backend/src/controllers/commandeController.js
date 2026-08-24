const { journaliserAction } = require('../utils/journaliser');
const { estDateValide, estDateFuture } = require('../utils/dateUtils');
const { validerDate } = require('../utils/validerDate');
const { validerChampsRequis } = require('../utils/validerFormulaire');

exports.creer = async (req, res) => {
  try {
    const { numero, client_id, produits, date_livraison_souhaitee } = req.body;
    // produits attendu : [{ produit_id, quantite, prix_unitaire }, ...]

    const manquants = validerChampsRequis(req.body, ['numero', 'client_id', 'produits']);
    if (manquants.length > 0) {
      return res.status(400).json({ message: `Champs requis manquants : ${manquants.join(', ')}` });
    }
    if (date_livraison_souhaitee && !estDateValide(date_livraison_souhaitee)) {
      return res.status(400).json({ message: 'Date de livraison souhaitée invalide.' });
    }
    if (date_livraison_souhaitee && !estDateFuture(date_livraison_souhaitee)) {
      return res.status(400).json({ message: 'Date de livraison souhaitée doit être une date future.' });
    }

    const montant_total = produits.reduce((sum, p) => sum + (p.quantite * p.prix_unitaire), 0);

    const commande = await req.tenantModels.Commande.create({ numero, client_id, montant_total, date_livraison_souhaitee });

    for (const p of produits) {
      await commande.addProduit(p.produit_id, {
        through: { quantite: p.quantite, prix_unitaire: p.prix_unitaire },
      });
    }

    const commandeComplete = await req.tenantModels.Commande.findByPk(commande.id, {
      include: [req.tenantModels.Produit, req.tenantModels.ClientCommercial],
    });

    await journaliserAction(req, 'creation_commande', { commande_id: commande.id, numero: commande.numero });

    res.status(201).json(commandeComplete);
  } catch (error) {
    console.error('Erreur création commande :', error);
    res.status(500).json({ message: 'Erreur lors de la création de la commande.', error: error.message });
  }
};

exports.listerTous = async (req, res) => {
  try {
    const commandes = await req.tenantModels.Commande.findAll({
      include: [req.tenantModels.Produit, req.tenantModels.ClientCommercial],
    });
    res.json(commandes);
  } catch (error) {
    console.error('Erreur listage commandes :', error);
    res.status(500).json({ message: 'Erreur.', error: error.message });
  }
};

exports.obtenirUn = async (req, res) => {
  try {
    const commande = await req.tenantModels.Commande.findByPk(req.params.id, {
      include: [req.tenantModels.Produit, req.tenantModels.ClientCommercial],
    });
    if (!commande) return res.status(404).json({ message: 'Commande introuvable.' });
    res.json(commande);
  } catch (error) {
    console.error('Erreur lecture commande :', error);
    res.status(500).json({ message: 'Erreur.', error: error.message });
  }
};

exports.modifierStatut = async (req, res) => {
  try {
    const commande = await req.tenantModels.Commande.findByPk(req.params.id);
    if (!commande) return res.status(404).json({ message: 'Commande introuvable.' });

    commande.statut = req.body.statut; // en_cours | livree | annulee
    await commande.save();

    await journaliserAction(req, 'modification_statut_commande', { commande_id: commande.id, nouveau_statut: commande.statut });

    res.json(commande);
  } catch (error) {
    console.error('Erreur modification statut commande :', error);
    res.status(500).json({ message: 'Erreur lors de la modification.', error: error.message });
  }
};

exports.supprimer = async (req, res) => {
  try {
    const commande = await req.tenantModels.Commande.findByPk(req.params.id);
    if (!commande) return res.status(404).json({ message: 'Commande introuvable.' });

    await commande.destroy();
    await journaliserAction(req, 'suppression_commande', { commande_id: req.params.id });

    res.json({ message: 'Commande supprimée.' });
  } catch (error) {
    console.error('Erreur suppression commande :', error);
    res.status(500).json({ message: 'Erreur lors de la suppression.', error: error.message });
  }
};