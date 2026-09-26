import { Modal } from "./ui";

export default function ShortcutsModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Modal open={open} onClose={onClose} title="Keyboard shortuts">
      <p>
        <kbd>?</kbd> : Open shortcuts modal
      </p>
      <p>
        <kbd>Esc</kbd> : Close any open modal / dropdown
      </p>
      <p>
        <kbd>G</kbd> + <kbd>D</kbd> : Go to Dashboard
      </p>
      <p>
        <kbd>G</kbd> + <kbd>N</kbd> : Create New Project
      </p>
    </Modal>
  );
}
