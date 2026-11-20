// Configuration publique (aucun secret ici). Modifiez uniquement DODO_PRODUCT_ID et SITE_URL.
window.J999_CONFIG = {
  GOOGLE_CLIENT_ID: "502413181474-7ei3mhnqmk9uhcrm0v6b816csfbe5i5v.apps.googleusercontent.com",
  ADSENSE_CLIENT: "ca-pub-3266873353292561",
  // Créez un produit "abonnement mensuel 5 $" dans Dodo Payments puis collez son ID ici (pdt_...)
  DODO_PRODUCT_ID: "pdt_REMPLACER_PAR_VOTRE_ID",
  PRICE_USD: 5,
  FREE_LIMIT: 15,
  SITE_URL: "https://journal-999.vercel.app"
};

// Retourne le lien de paiement Dodo, ou "" tant que l'ID produit n'est pas configuré
window.j999Checkout = function (email) {
  const c = window.J999_CONFIG;
  if (!c.DODO_PRODUCT_ID || c.DODO_PRODUCT_ID.includes("REMPLACER")) return "";
  const u = new URL(`https://checkout.dodopayments.com/buy/${c.DODO_PRODUCT_ID}`);
  u.searchParams.set("quantity", "1");
  u.searchParams.set("redirect_url", `${c.SITE_URL}/pricing`);
  if (email) u.searchParams.set("prefilled_email", email);
  return u.toString();
};
