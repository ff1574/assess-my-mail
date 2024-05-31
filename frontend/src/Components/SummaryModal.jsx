import React from "react";
import { Modal, Button, Row, Col } from "antd";
import {
  MailOutlined,
  InfoCircleOutlined,
  TagOutlined,
  StarOutlined,
} from "@ant-design/icons";
import "../Assets/CSS/SummaryModal.css";

const categories = [
  {
    key: "INFORMATION",
    icon: <InfoCircleOutlined />,
    color: "blue",
    label: "Information",
  },
  {
    key: "ADS & SPAM",
    icon: <TagOutlined />,
    color: "red",
    label: "Ads & Spam",
  },
  {
    key: "SOCIAL",
    icon: <MailOutlined />,
    color: "green",
    label: "Social",
  },
  {
    key: "IMPORTANT",
    icon: <StarOutlined />,
    color: "gold",
    label: "Important",
  },
];

const SummaryModal = ({ visible, onClose, categoriesCount }) => {
  return (
    <Modal
      title="Email Categories"
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Close
        </Button>,
      ]}
    >
      <Row gutter={[16, 16]}>
        {categories.map((category) => (
          <Col span={12} key={category.key}>
            <div
              className="category-card"
              style={{ borderColor: category.color }}
              onClick={() => console.log(category.label)}
            >
              <div className="category-icon" style={{ color: category.color }}>
                {category.icon}
              </div>
              <div className="category-content">
                <h3>{category.label}</h3>
                <p>{categoriesCount[category.key]} emails</p>
              </div>
            </div>
          </Col>
        ))}
      </Row>
    </Modal>
  );
};

export default SummaryModal;
