import Modal from "./Modal";
import Spinner from "./Spinner";
import { TriangleAlert } from "lucide-react";

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = "Are you sure?",
  description,
  confirmLabel = "Delete",
  loading = false,
  danger = true,
}) {
  return (
    <Modal open={open} onClose={onClose} title={title} maxWidth="max-w-sm">
      <div className="flex gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-ink ${
            danger ? "bg-camppink" : "bg-campyellow"
          }`}
        >
          <TriangleAlert size={18} />
        </div>
        <p className="text-sm text-ink/70 leading-relaxed">{description}</p>
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <button className="btn-ghost" onClick={onClose} disabled={loading}>
          Cancel
        </button>
        <button
          className={danger ? "btn-danger" : "btn-primary"}
          onClick={onConfirm}
          disabled={loading}
        >
          {loading && <Spinner size={15} />}
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
