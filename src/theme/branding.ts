/** Legal Notion logo palette: growth green, momentum orange, balance silver */

export const LN = {
  green: {
    light: '#9CCC65',
    main: '#43A047',
    mid: '#388E3C',
    dark: '#2E7D32',
  },
  orange: {
    light: '#F9A825',
    main: '#EF6C00',
    mid: '#F57C00',
    dark: '#E65100',
  },
  silver: {
    light: '#ECEFF1',
    main: '#90A4AE',
    dark: '#546E7A',
    deep: '#37474F',
  },
} as const;

export const gradients = {
  /** Logo tile when image is missing */
  logoMark: `linear-gradient(135deg, ${LN.orange.light} 0%, ${LN.orange.main} 30%, ${LN.green.light} 62%, ${LN.green.dark} 100%)`,
  /** Dashboard / page heroes — opaque tints (no alpha “fog”) for strong text contrast */
  heroWelcome:
    'linear-gradient(135deg, #ffffff 0%, #f0faf2 42%, #fff8f0 100%)',
  /** Full-page backdrops (login, etc.) */
  pageBackdrop: 'linear-gradient(180deg, #e8eeeb 0%, #f5f7f6 50%, #f0ebe6 100%)',
  /** Primary buttons */
  ctaPrimary: `linear-gradient(135deg, #66BB6A 0%, ${LN.green.main} 42%, ${LN.green.dark} 100%)`,
  ctaPrimaryHover: `linear-gradient(135deg, #81C784 0%, #4CAF50 45%, ${LN.green.mid} 100%)`,
  /** Secondary / accent buttons */
  ctaSecondary: `linear-gradient(135deg, #FFCA28 0%, ${LN.orange.mid} 45%, ${LN.orange.dark} 100%)`,
  /** Progress bars, editor accents (orange → green) */
  mixBar: `linear-gradient(90deg, ${LN.orange.main}, ${LN.green.main})`,
  /** Rich headers */
  mixDiagonal: `linear-gradient(135deg, #1B5E20 0%, ${LN.green.main} 42%, ${LN.orange.main} 100%)`,
  ctaSecondaryHover: `linear-gradient(135deg, ${LN.orange.light} 0%, #FB8C00 50%, ${LN.orange.main} 100%)`,
  /** Sidebar background (silver → charcoal) */
  sidebar: `linear-gradient(180deg, ${LN.silver.deep}ee 0%, #263238 42%, #1b2329 100%)`,
} as const;

export const LOGO_PUBLIC_PATH = '/legal-notion-logo.png';
