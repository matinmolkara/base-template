import { Modal as BootstrapModal, Button } from "react-bootstrap";

export default function Modal({
  show,
  onHide,
  title,
  children,
  size = "lg",
  centered = true,
  showCloseButton = true,
  footer,
  ...props
}) {
  return (
    <BootstrapModal
      show={show}
      onHide={onHide}
      size={size}
      centered={centered}
      {...props}
    >
      <BootstrapModal.Header closeButton={showCloseButton}>
        <BootstrapModal.Title>{title}</BootstrapModal.Title>
      </BootstrapModal.Header>

      <BootstrapModal.Body>{children}</BootstrapModal.Body>

      {footer && <BootstrapModal.Footer>{footer}</BootstrapModal.Footer>}
    </BootstrapModal>
  );
}
