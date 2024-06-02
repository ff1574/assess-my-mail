import React, { useState } from "react";
import { Modal, Button, Row, Col, List, Typography, Space, Card } from "antd";
import {
  InfoCircleOutlined,
  TagOutlined,
  ThunderboltOutlined,
  SmileOutlined,
} from "@ant-design/icons";
import "../Assets/CSS/SummaryModal.css";

const { Text, Title } = Typography;

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

const SummaryModal = ({
  visible,
  onClose,
  categoriesCount,
  sendersCount,
  analysisResults,
}) => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSender, setSelectedSender] = useState(null);
  const [selectedEmails, setSelectedEmails] = useState([]);

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
  };

  const handleBackClick = () => {
    if (selectedSender) {
      setSelectedSender(null);
      setSelectedEmails([]);
    } else {
      setSelectedCategory(null);
    }
  };

  const handleViewMails = (sender) => {
    const emails = analysisResults.filter((email) => email.from === sender);
    setSelectedEmails(emails);
    setSelectedSender(sender);
  };

  const handleBlockSender = (sender) => {
    console.log(`Blocking sender ${sender}`);
    // Implement the functionality to block the sender
  };

  return (
    <Modal
      title={
        selectedCategory
          ? selectedSender
            ? `Emails from ${selectedSender}`
            : `${selectedCategory.label} Senders`
          : "Email Categories"
      }
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="back" onClick={handleBackClick}>
          {selectedSender ? "Back to Senders" : "Back to Categories"}
        </Button>,
        !selectedSender && (
          <Button key="close" onClick={onClose}>
            Close
          </Button>
        ),
      ]}
    >
      {selectedCategory ? (
        selectedSender ? (
          <List
            dataSource={selectedEmails}
            renderItem={(email) => (
              <List.Item>
                <Card title={email.subject}>
                  <p>
                    <strong>From:</strong> {email.from}
                  </p>
                  <p>
                    <strong>Date:</strong> {email.date}
                  </p>
                  <p>
                    <strong>Body:</strong> {email.body}
                  </p>
                </Card>
              </List.Item>
            )}
          />
        ) : (
          <List
            dataSource={Object.entries(
              sendersCount[selectedCategory.key] || {}
            )}
            renderItem={([sender, count]) => (
              <List.Item>
                <Space direction="vertical" style={{ width: "100%" }}>
                  <Text>
                    {sender}: {count / 2} emails
                  </Text>
                  <Space
                    style={{ justifyContent: "space-between", width: "100%" }}
                  >
                    <Button
                      size="small"
                      type="primary"
                      onClick={() => handleViewMails(sender)}
                      style={{ marginRight: 8 }}
                    >
                      View Mails
                    </Button>
                    <Button
                      size="small"
                      type="primary"
                      danger="true"
                      onClick={() => handleBlockSender(sender)}
                    >
                      Block Sender
                    </Button>
                  </Space>
                </Space>
              </List.Item>
            )}
          />
        )
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
