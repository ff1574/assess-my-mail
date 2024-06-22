import React, { useState } from "react";
import axios from "axios";
import {
  Modal,
  Button,
  Row,
  Col,
  List,
  Typography,
  Space,
  Card,
  message,
} from "antd";
import {
  InfoCircleOutlined,
  TagOutlined,
  ThunderboltOutlined,
  SmileOutlined,
} from "@ant-design/icons";
import "../Assets/CSS/SummaryModal.css";

const { Text } = Typography;

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
  accessToken,
  refreshToken,
  expiryDate,
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

  const handleMuteSender = async (sender) => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");
      const expiryDate = localStorage.getItem("expiryDate");

      console.log(`Muting sender ${sender}`);
      const response = await axios.post("http://localhost:5000/mute-sender", {
        access_token: accessToken,
        refresh_token: refreshToken,
        expiry_date: expiryDate,
        sender: sender,
      });

      if (response.data.success) {
        message.success(`Sender ${sender} muted successfully`);
      } else {
        throw new Error("Failed to mute sender");
      }
    } catch (error) {
      console.error("Error muting sender:", error);
      message.error("Failed to mute sender");
    }
  };

  const handleAddToCalendar = async (email) => {
    try {
      const event = {
        summary: email.analysis.subject,
        description: email.body,
        start: {
          dateTime: email.analysis.date
            ? new Date(email.analysis.date).toISOString()
            : new Date().toISOString(), // Use email date if available
          timeZone: "America/Los_Angeles",
        },
        end: {
          dateTime: email.analysis.date
            ? new Date(
                new Date(email.analysis.date).getTime() + 60 * 60 * 1000
              ).toISOString()
            : new Date(Date.now() + 60 * 60 * 1000).toISOString(), // Add 1 hour to start time if no end time
          timeZone: "America/Los_Angeles",
        },
      };

      const accessToken = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");
      const expiryDate = localStorage.getItem("expiryDate");

      const response = await axios.post("http://localhost:5000/add-event", {
        access_token: accessToken,
        refresh_token: refreshToken,
        expiry_date: expiryDate,
        event,
      });

      if (response.data.success) {
        message.success("Event added to Google Calendar successfully");
      } else {
        throw new Error("Failed to add event to calendar");
      }
    } catch (error) {
      console.error("Error adding event to calendar:", error);
      message.error("Failed to add event to calendar");
    }
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
                  <p>
                    <strong>Category:</strong> {email.analysis.category}
                  </p>
                  <p>
                    <strong>Subject:</strong> {email.analysis.subject}
                  </p>
                  <p>
                    <strong>Task:</strong> {email.analysis.task}
                  </p>
                  <p>
                    <strong>Date:</strong> {email.analysis.date}
                  </p>
                  <p>
                    <strong>Time:</strong> {email.analysis.time}
                  </p>
                  <p>
                    <strong>Place:</strong> {email.analysis.place}
                  </p>
                  <p>
                    <strong>People:</strong> {email.analysis.people}
                  </p>
                  <Button
                    type="primary"
                    onClick={() => handleAddToCalendar(email)}
                  >
                    Add to Google Calendar
                  </Button>
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
                      danger
                      onClick={() => handleMuteSender(sender)}
                    >
                      Mute Sender
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
