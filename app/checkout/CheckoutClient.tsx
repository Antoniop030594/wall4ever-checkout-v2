"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  CrossmintProvider,
  CrossmintCheckoutProvider,
  CrossmintEmbeddedCheckout,
  useCrossmintCheckout,
} from "@crossmint/client-sdk-react-ui";

const env = process.env.NEXT_PUBLIC_CROSSMINT_ENVIRONMENT ?? "staging";
const clientApiKey = process.env.NEXT_PUBLIC_CROSSMINT_CLIENT_API_KEY || "";

function pickLangTag(locale?: string) {
  const l = (locale || "en").toLowerCase();
  if (l.startsWith("it")) return "it";
  if (l.startsWith("es")) return "es";
  if (l.startsWith("fr")) return "fr";
  if (l.startsWith("pt")) return "pt";
  if (l.startsWith("ja")) return "ja";
  return "en";
}

const I18N: Record<string, Record<string, string>> = {
  it: {
    title: "Checkout Wall4Ever",
    subtitle: "Completa il pagamento per coniare il tuo NFT.",
    env: "Ambiente",
    orderId: "Order ID",
    detailsTitle: "Dettagli NFT",
    priceLabel: "Prezzo opera:",
    gasNote: "(+ gas di rete)",
    royaltyLabel: "Royalties creatore:",
    totalLocal: "Totale stimato (valuta locale):",
    loading: "Caricamento checkout…",
    cfgErrTitle: "Errore configurazione checkout",
    cfgErrDesc: "Mancano API key, orderId o clientSecret.",
    disclaimer: "L'importo esatto e i metodi di pagamento disponibili vengono determinati da Crossmint in base all'ordine creato da Wall4Ever.",
    thankYou: "Grazie per il tuo ordine",
    purchasedItems: "Articoli acquistati",
    orderDetails: "Dettagli ordine",
    itemCount: "Numero articoli",
    gasFees: "Gas fees",
    total: "Totale",
    deliveryPayment: "Consegna e pagamento",
    paymentMethod: "Metodo di pagamento",
    deliveredTo: "Consegnato a",
    receiptSentTo: "Ricevuta inviata a",
    successBtn: "Torna a Wall4Ever",
    redirecting: "Reindirizzamento in corso…",
  },
  en: {
    title: "Wall4Ever Checkout",
    subtitle: "Complete payment to mint your NFT.",
    env: "Environment",
    orderId: "Order ID",
    detailsTitle: "NFT Details",
    priceLabel: "Artwork price:",
    gasNote: "(+ network gas)",
    royaltyLabel: "Creator royalties:",
    totalLocal: "Estimated total (local currency):",
    loading: "Loading checkout…",
    cfgErrTitle: "Checkout configuration error",
    cfgErrDesc: "Missing API key, orderId or clientSecret.",
    disclaimer: "The exact amount and available payment methods are determined by Crossmint based on the order created by Wall4Ever.",
    thankYou: "Thank you for your order",
    purchasedItems: "Purchased items",
    orderDetails: "Order details",
    itemCount: "Item count",
    gasFees: "Gas fees",
    total: "Total",
    deliveryPayment: "Delivery & Payment",
    paymentMethod: "Payment method",
    deliveredTo: "Delivered to",
    receiptSentTo: "Receipt sent to",
    successBtn: "Back to Wall4Ever",
    redirecting: "Redirecting…",
  },
  es: {
    title: "Checkout Wall4Ever",
    subtitle: "Completa el pago para acuñar tu NFT.",
    env: "Entorno",
    orderId: "Order ID",
    detailsTitle: "Detalles del NFT",
    priceLabel: "Precio de la obra:",
    gasNote: "(+ gas de red)",
    royaltyLabel: "Regalías del creador:",
    totalLocal: "Total estimado (moneda local):",
    loading: "Cargando checkout…",
    cfgErrTitle: "Error de configuración",
    cfgErrDesc: "Falta API key, orderId o clientSecret.",
    disclaimer: "El importe exacto y los métodos disponibles los determina Crossmint según el pedido creado por Wall4Ever.",
    thankYou: "Gracias por tu pedido",
    purchasedItems: "Artículos comprados",
    orderDetails: "Detalles del pedido",
    itemCount: "Cantidad de artículos",
    gasFees: "Tarifas de gas",
    total: "Total",
    deliveryPayment: "Entrega y pago",
    paymentMethod: "Método de pago",
    deliveredTo: "Entregado a",
    receiptSentTo: "Recibo enviado a",
    successBtn: "Volver a Wall4Ever",
    redirecting: "Redirigiendo…",
  },
  fr: {
    title: "Paiement Wall4Ever",
    subtitle: "Finalisez le paiement pour minter votre NFT.",
    env: "Environnement",
    orderId: "Order ID",
    detailsTitle: "Détails du NFT",
    priceLabel: "Prix de l'œuvre :",
    gasNote: "(+ frais réseau)",
    royaltyLabel: "Royalties créateur :",
    totalLocal: "Total estimé (devise locale) :",
    loading: "Chargement du checkout…",
    cfgErrTitle: "Erreur de configuration",
    cfgErrDesc: "API key, orderId ou clientSecret manquants.",
    disclaimer: "Le montant exact et les moyens de paiement sont déterminés par Crossmint selon la commande créée par Wall4Ever.",
    thankYou: "Merci pour votre commande",
    purchasedItems: "Articles achetés",
    orderDetails: "Détails de la commande",
    itemCount: "Nombre d'articles",
    gasFees: "Frais de gaz",
    total: "Total",
    deliveryPayment: "Livraison et paiement",
    paymentMethod: "Méthode de paiement",
    deliveredTo: "Livré à",
    receiptSentTo: "Reçu envoyé à",
    successBtn: "Retour à Wall4Ever",
    redirecting: "Redirection en cours…",
  },
  pt: {
    title: "Checkout Wall4Ever",
    subtitle: "Conclua o pagamento para mintar seu NFT.",
    env: "Ambiente",
    orderId: "Order ID",
    detailsTitle: "Detalhes do NFT",
    priceLabel: "Preço da obra:",
    gasNote: "(+ gás de rede)",
    royaltyLabel: "Royalties do criador:",
    totalLocal: "Total estimado (moeda local):",
    loading: "Carregando checkout…",
    cfgErrTitle: "Erro de configuração",
    cfgErrDesc: "Faltando API key, orderId ou clientSecret.",
    disclaimer: "O valor exato e os métodos disponíveis são determinados pela Crossmint com base no pedido criado pela Wall4Ever.",
    thankYou: "Obrigado pelo seu pedido",
    purchasedItems: "Itens comprados",
    orderDetails: "Detalhes do pedido",
    itemCount: "Quantidade de itens",
    gasFees: "Taxas de gás",
    total: "Total",
    deliveryPayment: "Entrega e pagamento",
    paymentMethod: "Método de pagamento",
    deliveredTo: "Entregue a",
    receiptSentTo: "Recibo enviado para",
    successBtn: "Voltar ao Wall4Ever",
    redirecting: "Redirecionando…",
  },
  ja: {
    title: "Wall4Ever チェックアウト",
    subtitle: "NFTをミントするために支払いを完了してください。",
    env: "環境",
    orderId: "注文ID",
    detailsTitle: "NFTの詳細",
    priceLabel: "作品価格:",
    gasNote: "（+ ネットワークガス代）",
    royaltyLabel: "クリエイターロイヤリティ:",
    totalLocal: "推定合計（現地通貨）:",
    loading: "チェックアウトを読み込み中…",
    cfgErrTitle: "チェックアウト設定エラー",
    cfgErrDesc: "APIキー、orderId、またはclientSecretが不足しています。",
    disclaimer: "正確な金額と利用可能な支払い方法は、Wall4Everが作成した注文に基づいてCrossmintが決定します。",
    thankYou: "ご注文ありがとうございます",
    purchasedItems: "購入アイテム",
    orderDetails: "注文詳細",
    itemCount: "アイテム数",
    gasFees: "ガス代",
    total: "合計",
    deliveryPayment: "配送・お支払い",
    paymentMethod: "お支払い方法",
    deliveredTo: "配送先",
    receiptSentTo: "領収書送付先",
    successBtn: "Wall4Everに戻る",
    redirecting: "リダイレクト中…",
  },
};

// ─────────────────────────────────────────────
// Riquadro dettagli NFT (visibile durante checkout)
// ─────────────────────────────────────────────
function CheckoutDetailsBox({ langTag }: { langTag: string }) {
  const { order } = useCrossmintCheckout();
  const t = (k: string) => (I18N[langTag] || I18N.en)[k] || k;

  const li = (order?.lineItems?.[0] as any) ?? null;

  let displayEth = "n/d";
  let displayFiat = "";
  let displayRoyalty = "n/d";

  const totalPriceEthStr: string | undefined = li?.callData?.totalPrice;
  if (totalPriceEthStr) displayEth = `${totalPriceEthStr} ETH (Sepolia)`;

  const royaltyBps: number | undefined = li?.callData?.royaltyBps;
  if (typeof royaltyBps === "number") displayRoyalty = `${(royaltyBps / 100).toFixed(2)}%`;

  const userLocale =
    typeof navigator !== "undefined" && navigator.language ? navigator.language : "en-US";

  const maybeFiat =
    (li?.quote?.totalPriceFiat || (order as any)?.quote?.totalPriceFiat) ?? null;
  if (maybeFiat?.amount && maybeFiat?.currency) {
    const n = Number(maybeFiat.amount);
    if (!Number.isNaN(n)) {
      displayFiat = new Intl.NumberFormat(userLocale, {
        style: "currency",
        currency: String(maybeFiat.currency).toUpperCase(),
      }).format(n);
    }
  }

  return (
    <div className="text-xs bg-black/30 border border-slate-700 rounded-lg p-3 mb-4">
      <h2 className="text-sm font-semibold mb-1">{t("detailsTitle")}</h2>
      <p className="mt-1">
        <span className="text-slate-400">{t("priceLabel")}</span>{" "}
        <span className="text-slate-100">
          {displayEth} <span className="text-slate-400 text-[11px]">{t("gasNote")}</span>
        </span>
      </p>
      {displayFiat ? (
        <p className="mt-1 text-[11px] text-slate-400">
          {t("totalLocal")} <span className="text-slate-200">{displayFiat}</span>
        </p>
      ) : null}
      <p className="mt-1">
        <span className="text-slate-400">{t("royaltyLabel")}</span>{" "}
        <span className="text-slate-100">{displayRoyalty}</span>
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────
// Wrapper stabile per evitare re-render del form
// ─────────────────────────────────────────────
type EmbeddedProps = { orderId: string; clientSecret: string; payment: any };

const StableEmbeddedCheckout = React.memo(
  function StableEmbeddedCheckout({ orderId, clientSecret, payment }: EmbeddedProps) {
    return <CrossmintEmbeddedCheckout orderId={orderId} clientSecret={clientSecret} payment={payment} />;
  },
  (prev, next) => prev.orderId === next.orderId && prev.clientSecret === next.clientSecret
);

// ─────────────────────────────────────────────
// Checkout principale + success page
// ─────────────────────────────────────────────
function CheckoutInner({
  orderId,
  clientSecret,
  langTag,
  successUrl,
}: {
  orderId: string;
  clientSecret: string;
  langTag: string;
  successUrl: string;
}) {
  const { order } = useCrossmintCheckout();
  const t = (k: string) => (I18N[langTag] || I18N.en)[k] || k;
  const [redirecting, setRedirecting] = useState(false);

  // ─── 🔧 TEST: imposta true per vedere la success page senza pagare ───
  // ─── Rimuovi questa riga (e de-commenta quella sotto) prima del deploy ───
    const isCompleted = (order as any)?.phase === "completed";
  // ─────────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!isCompleted || !successUrl) return;
    setRedirecting(true);
    const timer = setTimeout(() => {
      window.location.href = successUrl;
    }, 8000); // 8 secondi
    return () => clearTimeout(timer);
  }, [isCompleted, successUrl]);

  const paymentConfig = useMemo(
    () => ({
      crypto: { enabled: true, defaultChain: "ethereum", defaultCurrency: "eth" },
      fiat: { enabled: true, defaultCurrency: "eur" },
    }),
    []
  );

  // ─────────────── SUCCESS PAGE ───────────────
  if (isCompleted) {
    const o = order as any;
    const li0 = o?.lineItems?.[0] ?? null;

    // Immagine: prima quella che passi tu dal backend, poi fallback Crossmint
    const imgUrl: string =
      li0?.metadata?.imageUrl ||
      li0?.metadata?.image ||
      "";

    const artName: string = li0?.metadata?.name || "NFT";

    const userLocale =
      typeof navigator !== "undefined" && navigator.language ? navigator.language : "en-US";

    const fmtCurrency = (amount: any, currency: any) => {
      const n = Number(amount);
      if (Number.isNaN(n) || !currency) return null;
      try {
        return new Intl.NumberFormat(userLocale, {
          style: "currency",
          currency: String(currency).toUpperCase(),
        }).format(n);
      } catch {
        return `${currency} ${n}`;
      }
    };

    const totalFiat = fmtCurrency(
      o?.quote?.totalPrice?.amount ?? li0?.quote?.totalPrice?.amount,
      o?.quote?.totalPrice?.currency ?? li0?.quote?.totalPrice?.currency
    );

    const gasFiat = fmtCurrency(
      li0?.quote?.charges?.gas?.amount,
      li0?.quote?.charges?.gas?.currency
    );

    const itemFiat = fmtCurrency(
      li0?.quote?.charges?.unit?.amount,
      li0?.quote?.charges?.unit?.currency
    );

    const walletRaw: string =
      li0?.delivery?.recipient?.walletAddress ||
      o?.payment?.recipient?.walletAddress ||
      "";
    const walletShort = walletRaw
      ? `${walletRaw.slice(0, 6)}...${walletRaw.slice(-6)}`
      : null;

    const receiptEmail: string =
      o?.payment?.receiptEmail ||
      li0?.delivery?.recipient?.email ||
      "";

    const payMethod: string = o?.payment?.method || "";

    return (
      <div className="flex flex-col gap-5">

        {/* ✅ Checkmark + titolo + totale */}
        <div className="flex flex-col items-center gap-2 pt-2">
          <div className="w-16 h-16 rounded-full border-2 border-emerald-400 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-emerald-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white text-center">{t("thankYou")}</h2>
          {totalFiat && (
            <p className="text-2xl font-bold text-emerald-400">{totalFiat}</p>
          )}
        </div>

        {/* 🖼 Purchased items */}
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            {t("purchasedItems")}
          </p>
          <div className="flex items-center gap-3 bg-black/30 border border-slate-700/60 rounded-xl p-3">
            {imgUrl ? (
              <img
                src={imgUrl}
                alt={artName}
                className="w-14 h-14 rounded-lg object-cover flex-shrink-0 border border-slate-600"
              />
            ) : (
              <div className="w-14 h-14 rounded-lg bg-slate-700 flex-shrink-0 flex items-center justify-center text-slate-500 text-xs">
                NFT
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{artName}</p>
            </div>
            {itemFiat && (
              <p className="text-sm font-semibold text-white flex-shrink-0">{itemFiat}</p>
            )}
          </div>
        </div>

        {/* 📋 Order details */}
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            {t("orderDetails")}
          </p>
          <div className="bg-black/30 border border-slate-700/60 rounded-xl p-3 flex flex-col gap-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">{t("itemCount")}</span>
              <span className="text-white">1</span>
            </div>
            {gasFiat && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">{t("gasFees")}</span>
                <span className="text-white">{gasFiat}</span>
              </div>
            )}
            {totalFiat && (
              <div className="flex justify-between text-sm font-semibold border-t border-slate-700/60 pt-2 mt-1">
                <span className="text-slate-300">{t("total")}</span>
                <span className="text-white">{totalFiat}</span>
              </div>
            )}
          </div>
        </div>

        {/* 📦 Delivery & Payment */}
        {(payMethod || walletShort || receiptEmail) && (
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              {t("deliveryPayment")}
            </p>
            <div className="bg-black/30 border border-slate-700/60 rounded-xl p-3 flex flex-col gap-2">
              {payMethod && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">{t("paymentMethod")}</span>
                  <span className="text-white">{payMethod}</span>
                </div>
              )}
              {walletShort && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">{t("deliveredTo")}</span>
                  <span className="text-slate-300 font-mono text-xs">{walletShort}</span>
                </div>
              )}
              {receiptEmail && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">{t("receiptSentTo")}</span>
                  <span className="text-slate-300 text-xs truncate max-w-[180px]">{receiptEmail}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 🔁 Redirect automatico */}
        {redirecting && (
          <p className="text-xs text-slate-500 animate-pulse text-center">{t("redirecting")}</p>
        )}

        {/* Bottone manuale */}
        {successUrl && (
          <a
            href={successUrl}
            className="w-full text-center bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-colors"
          >
            {t("successBtn")}
          </a>
        )}
      </div>
    );
  }

  // ─────────────── CHECKOUT NORMALE ───────────────
  return (
    <>
      <CheckoutDetailsBox langTag={langTag} />
      <StableEmbeddedCheckout
        orderId={orderId}
        clientSecret={clientSecret}
        payment={paymentConfig}
      />
    </>
  );
}

// ─────────────────────────────────────────────
// Pagina principale
// ─────────────────────────────────────────────
export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const [isClient, setIsClient] = useState(false);

  const userLocale =
    typeof navigator !== "undefined" && navigator.language ? navigator.language : "en-US";
  const langTag = pickLangTag(userLocale);
  const t = (k: string) => (I18N[langTag] || I18N.en)[k] || k;

  useEffect(() => {
    setIsClient(true);
    document.documentElement.lang = langTag;
  }, [langTag]);

  const orderId = searchParams.get("orderId") || "";
  const clientSecret = searchParams.get("clientSecret") || "";
  const successUrl =
    searchParams.get("successUrl") ||
    "https://wall4-ever-65.flutterflow.app/?payment=success";

  if (!isClient) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
        <div className="animate-pulse">{t("loading")}</div>
      </main>
    );
  }

  if (!clientApiKey || !orderId || !clientSecret) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-950 text-red-400 px-4 text-center">
        <div>
          <p className="font-semibold mb-1">{t("cfgErrTitle")}</p>
          <p className="text-sm opacity-80">{t("cfgErrDesc")}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-4 flex items-start justify-center pt-8 pb-12">
      <div className="w-full max-w-xl rounded-2xl border border-slate-700/60 bg-slate-900 p-6 shadow-2xl">

        <h1 className="text-2xl font-semibold text-center mb-1">{t("title")}</h1>
        <p className="text-sm text-center text-slate-300 mb-4">{t("subtitle")}</p>

        <div className="text-xs font-mono bg-black/40 border border-slate-700 rounded-lg p-3 mb-3">
          <div>
            <span className="text-slate-400">{t("env")}:</span>{" "}
            <span className="text-emerald-400">{env}</span>
          </div>
          <div className="mt-1">
            <span className="text-slate-400">{t("orderId")}:</span>{" "}
            <span className="text-slate-200 break-all">{orderId}</span>
          </div>
        </div>

        <CrossmintProvider apiKey={clientApiKey}>
          <CrossmintCheckoutProvider>
            <CheckoutInner
              orderId={orderId}
              clientSecret={clientSecret}
              langTag={langTag}
              successUrl={successUrl}
            />
          </CrossmintCheckoutProvider>
        </CrossmintProvider>

        <p className="mt-4 text-[11px] text-slate-400 text-center">{t("disclaimer")}</p>
      </div>
    </main>
  );
}
