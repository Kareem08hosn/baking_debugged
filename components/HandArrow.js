// A hand-drawn arrow for margin notes. Each shape is two SVG paths: the
// curved line, then the two short strokes of the arrowhead.
//
// In a path, M means "move the pen to", C draws a curve and L a straight
// line. The numbers are x,y positions inside the viewBox.
const SHAPES = {
  // starts bottom right, curves up to the left
  upLeft: {
    viewBox: "0 0 80 60",
    line: "M72 54 C 64 30, 44 14, 12 12",
    head: "M25 3 L11 12 L23 23",
  },
  // starts top left, curves down to the right
  downRight: {
    viewBox: "0 0 70 56",
    line: "M8 8 C 30 8, 50 20, 56 46",
    head: "M43 38 L57 48 L63 32",
  },
  // starts on the left, swoops under and up to the right
  upRight: {
    viewBox: "0 0 80 50",
    line: "M6 30 C 26 44, 50 40, 70 16",
    head: "M56 14 L71 14 L71 30",
  },
};

export default function HandArrow({ shape, className = "" }) {
  const { viewBox, line, head } = SHAPES[shape];

  return (
    // The look (stroke, size, the drawing-in animation) is the "arrow" class
    // in app/globals.css. aria-hidden: it is decoration.
    <svg viewBox={viewBox} className={`arrow ${className}`} aria-hidden="true">
      <path d={line} />
      <path d={head} />
    </svg>
  );
}
