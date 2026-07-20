const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.creerSession = async (req, res) => {
  try {
    const { Commande, PaiementEnLigne } = req.tenantModels;
    const { commandeId } = req.params;

    const commande = await Commande.findByPk(commandeId);
    if (!commande) return res.status(404).json({ message: 'Commande introuvable.' });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: 'usd', // Stripe test ne supporte pas TND, usd pour la démo
          product_data: { name: `Commande ${commande.numero}` },
          unit_amount: Math.round(commande.montant_total * 100), // en centimes
        },
        quantity: 1,
      }],
      success_url: `http://localhost:5173/paiement/succes?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `http://localhost:5173/paiement/echec`,
    });

    await PaiementEnLigne.create({
      session_id: session.id,
      commande_id: commande.id,
      montant: commande.montant_total,
      statut: 'en_attente',
    });

    res.json({ url: session.url });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la création de la session de paiement.', error: error.message });
  }
};

exports.verifierSession = async (req, res) => {
  try {
    const { PaiementEnLigne, Commande } = req.tenantModels;
    const { sessionId } = req.params;

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const paiement = await PaiementEnLigne.findOne({ where: { session_id: sessionId } });

    if (!paiement) return res.status(404).json({ message: 'Paiement introuvable.' });

    if (session.payment_status === 'paid') {
      paiement.statut = 'reussi';
      await paiement.save();

      const commande = await Commande.findByPk(paiement.commande_id);
      if (commande) {
        commande.statut = 'livree';
        await commande.save();
      }
    } else {
      paiement.statut = 'echoue';
      await paiement.save();
    }

    res.json({ statut: paiement.statut, commande_id: paiement.commande_id });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la vérification.', error: error.message });
  }
};

exports.historique = async (req, res) => {
  try {
    const { PaiementEnLigne, Commande } = req.tenantModels;
    const paiements = await PaiementEnLigne.findAll({
      include: [Commande],
      order: [['createdAt', 'DESC']],
    });
    res.json(paiements);
  } catch (error) {
    res.status(500).json({ message: 'Erreur.', error: error.message });
  }
};