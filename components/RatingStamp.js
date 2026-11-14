// The round rubber stamp on a recipe.
// - Baked and rated here (tested: true with a rating): a solid stamp with
//   the score, "★ 4.5 TESTED".
// - Anything else: a dashed "UNTESTED" stamp with no score. A recipe adapted
//   from another site never shows that site's stars as if they were ours.
//
// className lets the page decide where the stamp sits; the stamp itself only
// knows what it looks like.
export default function RatingStamp({ rating, tested, className = "" }) {
  // != null is true for anything except null and undefined
  const isRated = tested === true && rating != null;

  if (!isRated) {
    return (
      <>
        {/* aria-hidden hides the decorative stamp from screen readers, which
            get the plain sentence below instead. sr-only text is invisible
            on screen but read out. */}
        <span className={`stamp stamp-untested ${className}`} aria-hidden="true">
          <b>?</b>
          UNTESTED
        </span>
        <span className="sr-only">Not test-baked yet.</span>
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
