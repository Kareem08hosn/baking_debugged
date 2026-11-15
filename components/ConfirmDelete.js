// "Delete it for good?" with Yes / Keep it. Deleting can't be undone, so a
// delete button only opens this; nothing is removed until "Yes, delete".
//   busy        true while the delete is happening (disables the button)
//   onConfirm   called when the person says yes
//   onCancel    called when they change their mind
export default function ConfirmDelete({ busy = false, onConfirm, onCancel }) {
  return (
    <span className="flex flex-wrap items-center gap-3" role="group" aria-label="Confirm delete">
      <span className="font-mono text-sm font-bold">Delete it for good?</span>
      <button type="button" className="btn-quiet" disabled={busy} onClick={onConfirm}>
        {busy ? "Deleting…" : "Yes, delete"}
      </button>
      <button type="button" className="font-mono text-sm underline underline-offset-4" onClick={onCancel}>
        Keep it
      </button>
    </span>
  );
}
