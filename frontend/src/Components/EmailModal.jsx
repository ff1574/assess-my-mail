import React from "react";
import { Modal, Typography } from "antd";

const { Title, Paragraph } = Typography;

const EmailModal = ({ email, visible, onClose }) => {
  return (
    <Modal
      title={email.subject}
      visible={visible}
      onCancel={onClose}
      footer={null}
      width={800}
    >
      <Title level={4}>{email.subject}</Title>
      <Paragraph>{email.body}</Paragraph>
    </Modal>
  );
};

export default EmailModal;
