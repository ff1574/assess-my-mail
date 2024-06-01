import React, { useState, useEffect } from "react";
import {
  Button,
  Card,
  Typography,
  Spin,
  List,
  Progress,
  message,
  Flex,
} from "antd";
import axios from "axios";
import SummaryModal from "./SummaryModal";
import "../Assets/CSS/ScanWithAI.css";

const { Title } = Typography;

const ScanWithAI = ({ emails, onBack }) => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [analysisResults, setAnalysisResults] = useState([]);
  const [categoriesCount, setCategoriesCount] = useState({
    INFORMATION: 0,
    "ADS & SPAM": 0,
    SOCIAL: 0,
    IMPORTANT: 0,
  });
  const [sendersCount, setSendersCount] = useState({});
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const eventSource = new EventSource("http://localhost:5000/events");
    eventSource.onmessage = (event) => {
      const { email, progress } = JSON.parse(event.data);
      if (email) {
        setAnalysisResults((prevResults) => [...prevResults, email]);
        setCategoriesCount((prevCount) => ({
          ...prevCount,
          [email.category]: prevCount[email.category] + 1,
        }));

        setSendersCount((prevSenders) => {
          const sender = email.from;
          const category = email.category;
          if (!prevSenders[category]) {
            prevSenders[category] = {};
          }
          if (!prevSenders[category][sender]) {
            prevSenders[category][sender] = 0;
          }
          prevSenders[category][sender] += 1;
          return { ...prevSenders };
        });
      }
      setProgress(progress);
      if (progress === 100) {
        setLoading(false);
        setShowModal(true);
        message.success({
          content: "Emails analyzed successfully!",
          key: "scan",
        });
      }
    };

    return () => {
      eventSource.close();
    };
  }, []);

  const handleScan = async () => {
    setLoading(true);
    try {
      message.loading({ content: "Analyzing emails...", key: "scan" });
      await axios.post("http://localhost:5000/analyze-emails", { emails });
    } catch (error) {
      message.error({ content: "Error analyzing emails.", key: "scan" });
      console.error("Error analyzing emails:", error);
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  const handleReopenModal = () => {
    setShowModal(true);
  };

  return (
    <Card className="scan-ai-card">
      <Title level={2} className="scan-ai-title">
        Scan Emails with AI
      </Title>
      <Flex className="scan-ai-button-container">
        <Button className="back-button" onClick={onBack}>
          Back
        </Button>
        <Button
          type="primary"
          className="scan-button"
          onClick={handleScan}
          disabled={loading}
        >
          Scan with AI
        </Button>
        {!showModal && (
          <Button type="primary" onClick={handleReopenModal}>
            Reopen Summary
          </Button>
        )}
      </Flex>
      {loading && <Spin size="large" className="loading-spinner" />}
      <Progress percent={progress} />
      <List
        className="analysis-results"
        dataSource={analysisResults}
        renderItem={(result) => (
          <List.Item>
            <Card title={result.subject}>
              <p>
                <strong>Category:</strong> {result.category}
              </p>
              <p>
                <strong>Details:</strong> {result.analysis}
              </p>
            </Card>
          </List.Item>
        )}
      />
      <SummaryModal
        visible={showModal}
        onClose={handleModalClose}
        categoriesCount={categoriesCount}
        sendersCount={sendersCount}
      />
    </Card>
  );
};

export default ScanWithAI;
