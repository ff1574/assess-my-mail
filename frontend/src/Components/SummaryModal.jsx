import React, { useState } from "react";
import { Modal, Button, Row, Col, List } from "antd";
import {
  InfoCircleOutlined,
  TagOutlined,
  ThunderboltOutlined,
  SmileOutlined,
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
  { key: "SOCIAL", icon: <SmileOutlined />, color: "green", label: "Social" },
  {
    key: "IMPORTANT",
    icon: <ThunderboltOutlined />,
    color: "gold",
    label: "Important",
  },
];

const SummaryModal = ({ visible, onClose, categoriesCount, sendersCount }) => {
  const [selectedCategory, setSelectedCategory] = useState(null);

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
  };

  const handleBackClick = () => {
    setSelectedCategory(null);
  };

  return (
    <Modal
      title={
        selectedCategory
          ? `${selectedCategory.label} Senders`
          : "Email Categories"
      }
      open={visible}
      onCancel={onClose}
      footer={[
        selectedCategory ? (
          <Button key="back" onClick={handleBackClick}>
            Back
          </Button>
        ) : (
          <Button key="close" onClick={onClose}>
            Close
          </Button>
        ),
      ]}
    >
      {selectedCategory ? (
        <List
          dataSource={Object.entries(sendersCount[selectedCategory.key] || {})}
          renderItem={([sender, count]) => (
            <List.Item>
              {sender}: {count / 2} emails
            </List.Item>
          )}
        />
      ) : (
        <Row gutter={[16, 16]}>
          {categories.map((category) => (
            <Col span={12} key={category.key}>
              <div
                className="category-card"
                style={{ borderColor: category.color }}
                onClick={() => handleCategoryClick(category)}
              >
                <div
                  className="category-icon"
                  style={{ color: category.color }}
                >
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
      )}
    </Modal>
  );
};

export default SummaryModal;
