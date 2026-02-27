/**
 * TickerBand Component
 *
 * Horizontal scrolling ticker band displaying financial products
 * - Appears at the very top of all pages
 * - Pure CSS animation (no JavaScript)
 * - Seamless infinite loop
 */

const financialProducts = [
  {
    name: "Urbanek Real Estate Anleihe",
    url: "https://www.finanzen.net/anleihen/a3l5qu-urbanek-real-estate-anleihe",
  },
  {
    name: "CA Immobilien Anlagen Anleihe",
    url: "https://www.finanzen.net/anleihen/a2rrr9-ca-immobilien-anlagen-anleihe",
  },
  {
    name: "Agora Immobilien Anleihe 2027",
    url: "https://www.finanzen.at/anleihen/agora_immobilieneo-var_wdl-anl_201727-anleihe-2027-at0000a1x1g1",
  },
  {
    name: "Immobilien Anleihe XS2927556519",
    url: "https://www.wienerborse.at/marktdaten/anleihen/preisdaten/?ISIN=XS2927556519&ID_NOTATION=481261230&cHash=8657be1add382a811c48741e0cfccb8f",
  },
  {
    name: "Immobilien Anleihe XS2243564478",
    url: "https://www.wienerborse.at/marktdaten/anleihen/preisdaten/?ISIN=XS2243564478&ID_NOTATION=310203105&cHash=2d52050019e01ec2209c77158fff0184",
  },
  {
    name: "Immobilien Zertifikat AT0000A36UU5",
    url: "https://www.wienerborse.at/marktdaten/zertifikate/preisdaten/?ISIN=AT0000A36UU5&ID_NOTATION=431474010&cHash=80b2581b885124ddfe05dc4320cdd63d",
  },
  {
    name: "CA Immobilien Anleihe A28S0Q",
    url: "https://www.finanzen.net/anleihen/a28s0q-ca-immobilien-anlagen-anleihe",
  },
  {
    name: "Beteiligungs- und Immobilien Anleihe",
    url: "https://www.finanzen.net/anleihen/a0dxtb-beteiligungs-und-immobilien-anleihe",
  },
  {
    name: "Dautrus Cap Anleihe 2025-2030",
    url: "https://live.deutsche-boerse.com/anleihe/de000a4dfhx0-dautrus-cap-anl-25-30?mic=XFRA",
  },
  {
    name: "Arion Swiss Real Estate Debt",
    url: "https://arion.li/swiss_real_estate_debt",
  },
  {
    name: "Daneo Private Debt Fund I",
    url: "https://www.finanzen.ch/fonds/daneo-private-debt-fund-i-ia-li0379624658",
  },
  {
    name: "Leanval Private Debt Fonds",
    url: "https://www.finanzen.net/fonds/leanval-private-debt-fonds-li0435428979",
  },
];

export function TickerBand() {
  return (
    <div className="bg-gray-900 dark:bg-slate-950 text-white py-2 overflow-hidden">
      <div className="flex animate-ticker whitespace-nowrap">
        {/* Duplicate items for seamless loop */}
        {[...financialProducts, ...financialProducts].map((product, index) => (
          <a
            key={`${product.name}-${index}`}
            href={product.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center mx-6 text-xs text-gray-300 hover:text-primary transition-colors no-underline"
          >
            {product.name}
            <span className="ml-6 text-primary">•</span>
          </a>
        ))}
      </div>

      {/* Custom Animation */}
      <style>{`
        @keyframes ticker {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-ticker {
          animation: ticker 45s linear infinite;
        }
      `}</style>
    </div>
  );
}
