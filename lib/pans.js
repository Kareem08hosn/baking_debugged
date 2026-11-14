// The pans a recipe can be written for or scaled to. They live in
// data/pans.json so the website and the Python scripts share one list.
//
// Shape of one pan (sizes in centimetres):
//   { id, label, shape: "round", diameter }
//   { id, label, shape: "rectangle", length, width }   (squares and loaf tins too)
//
// A recipe points at its pan by id: "pan": "loaf-23x13". Recipes baked
// without a pan (cookies on a tray, a free-form loaf) have "pan": null.
import pans from "@/data/pans.json";

export { pans };

// Finds one pan by its id, or returns undefined if there isn't one.
export function getPanById(id) {
  return pans.find((pan) => pan.id === id);
}
