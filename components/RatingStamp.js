// The round rubber stamp on a recipe. A recipe counts as untested when
// tested is false (or when it has no rating at all). An untested recipe that
// was adapted from a site shows that site's rating with an UNTESTED caption;
// once the owner has baked it (tested: true), the stamp says TESTED instead.
//
// className lets the page decide where the stamp sits; the stamp itself only
// knows what it looks like.
export default function RatingStamp({ rating, tested, className = "" }) {
  // == null is true for both null and undefined
  const hasRating = rating != null;
  if (tested === false || !hasRating) {
    return (
      <>
        {/* aria-hidden hides the decorative stamp from screen readers, which
            get the plain sentence below instead. sr-only text is invisible
            on screen but read out. */}
        <span className={`stamp stamp-untested ${className}`} aria-hidden="true">
          <b>{hasRating ? `★ ${rating}` : "?"}</b>
          UNTESTED
        </span>
        <span className="sr-only">
          Not test-baked yet.
          {hasRating && ` Rated ${rating} out of 5 on the original site.`}
        </span>
      </>
    );
  }

  return (
    <>
      <span className={`stamp ${className}`} aria-hidden="true">
        <b>★ {rating}</b>
        TESTED
      </span>
      <span className="sr-only">Rated {rating} out of 5.</span>
    </>
  );
}
