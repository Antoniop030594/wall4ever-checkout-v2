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

  // ✅ fallback per qualsiasi lingua non supportata
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
    disclaimer:
      "L'importo esatto e i metodi di pagamento disponibili vengono determinati da Crossmint in base all'ordine creato da Wall4Ever.",
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
    disclaimer:
      "The exact amount and available payment methods are determined by Crossmint based on the order created by Wall4Ever.",
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
    disclaimer:
      "El importe exacto y los métodos disponibles los determina Crossmint según el pedido creado por Wall4Ever.",
  },
  fr: {
    title: "Paiement Wall4Ever",
    subtitle: "Finalisez le paiement pour minter votre NFT.",
    env: "Environnement",
    orderId: "Order ID",
    detailsTitle: "Détails du NFT",
    priceLabel: "Prix de l’œuvre :",
    gasNote: "(+ frais réseau)",
    royaltyLabel: "Royalties créateur :",
    totalLocal: "Total estimé (devise locale) :",
    loading: "Chargement du checkout…",
    cfgErrTitle: "Erreur de configuration",
    cfgErrDesc: "API key, orderId ou clientSecret manquants.",
    disclaimer:
      "Le montant exact et les moyens de paiement sont déterminés par Crossmint selon la commande créée par Wall4Ever.",
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
    disclaimer:
      "O valor exato e os métodos disponíveis são determinados pela Crossmint com base no pedido criado pela Wall4Ever.",
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
       disclaimer:
         "正確な金額と利用可能な支払い方法は、Wall4Everが作成した注文に基づいてCrossmintが決定します。",
     },
};

function CheckoutDetailsBox({ langTag }: { langTag: string }) {
  const { order } = useCrossmintCheckout();
  const t = (k: string) => (I18N[langTag] || I18N.en)[k] || k;

  let displayEth = "n/d";
  let displayFiat = "";
  let displayRoyalty = "n/d";

  const li = (order?.lineItems?.[0] as any) ?? null;

  // prezzo opera (ETH) = quello che passi tu in callData.totalPrice
  const totalPriceEthStr: string | undefined = li?.callData?.totalPrice;
  if (totalPriceEthStr) displayEth = `${totalPriceEthStr} ETH (Sepolia)`;

  // royalties
  const royaltyBps: number | undefined = li?.callData?.royaltyBps;
  if (typeof royaltyBps === "number") displayRoyalty = `${(royaltyBps / 100).toFixed(2)}%`;

  // se Crossmint espone una fiat quote, la formattiamo nella valuta *che Crossmint decide* (EUR/USD/GBP…)
  const userLocale =
    typeof navigator !== "undefined" && navigator.language ? navigator.language : "en-US";

    const maybeFiat =
      ((li as any)?.quote?.totalPriceFiat || (order as any)?.quote?.totalPriceFiat) ?? null;
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

type EmbeddedProps = {
  orderId: string;
  clientSecret: string;
  payment: any;
};

const StableEmbeddedCheckout = React.memo(
  function StableEmbeddedCheckout({ orderId, clientSecret, payment }: EmbeddedProps) {
    return <CrossmintEmbeddedCheckout orderId={orderId} clientSecret={clientSecret} payment={payment} />;
  },
  (prev, next) => prev.orderId === next.orderId && prev.clientSecret === next.clientSecret
);

function CheckoutInner({ orderId, clientSecret, langTag }: { orderId: string; clientSecret: string; langTag: string }) {
  const paymentConfig = useMemo(
    () => ({
      crypto: { enabled: true, defaultChain: "ethereum", defaultCurrency: "eth" },
      fiat: { enabled: true, defaultCurrency: "eur" }, // puoi lasciarlo, ma sotto Crossmint mostra comunque la valuta locale se la gestisce
    }),
    []
  );

  return (
    <>
      <CheckoutDetailsBox langTag={langTag} />
      <StableEmbeddedCheckout orderId={orderId} clientSecret={clientSecret} payment={paymentConfig} />
    </>
  );
}

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const [isClient, setIsClient] = useState(false);

  const userLocale =
    typeof navigator !== "undefined" && navigator.language ? navigator.language : "en-US";
  const langTag = pickLangTag(userLocale);
  const t = (k: string) => (I18N[langTag] || I18N.en)[k] || k;

  useEffect(() => {
    setIsClient(true);
    document.documentElement.lang = langTag; // aiuta coerenza UI
  }, [langTag]);

  const orderId = searchParams.get("orderId") || "";
  const clientSecret = searchParams.get("clientSecret") || "";

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
    <main className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 p-4">
      <div className="w-full max-w-xl rounded-2xl border border-slate-700/60 bg-slate-900/70 p-6 shadow-2xl backdrop-blur">
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
            <CheckoutInner orderId={orderId} clientSecret={clientSecret} langTag={langTag} />
          </CrossmintCheckoutProvider>
        </CrossmintProvider>

        <p className="mt-4 text-[11px] text-slate-400 text-center">{t("disclaimer")}</p>
      </div>
    </main>
  );
}
