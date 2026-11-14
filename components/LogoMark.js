// The whisk-bracket logo, drawn as SVG right in the page (the same shapes as
// public/brand/logo-mark.svg).
//
// stroke="currentColor" means "use whatever the text colour is here", so the
// mark changes with the theme without needing a second image file.
export default function LogoMark({ className = "" }) {
  return (
    // aria-hidden: the site name is always written next to the mark, so
    // screen readers don't need the picture as well.
    <svg viewBox="0 0 512 512" className={className} aria-hidden="true">
      <g
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* < and > */}
        <polyline points="150,172 68,256 150,340" strokeWidth="34" />
        <polyline points="362,172 444,256 362,340" strokeWidth="34" />
        {/* the slash between them is a whisk */}
        <g transform="translate(256 256) rotate(22)">
          <ellipse cx="0" cy="-58" rx="50" ry="88" strokeWidth="18" />
          <ellipse cx="0" cy="-58" rx="17" ry="88" strokeWidth="14" />
          <line x1="0" y1="34" x2="0" y2="140" strokeWidth="34" />
        </g>
      </g>
    </svg>
  );
}
