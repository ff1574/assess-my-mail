import React, { useState, useEffect } from "react";
import { Button, Card, Typography, Spin, List, Progress, Modal } from "antd";
import axios from "axios";
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
      }
      setProgress(progress);
      if (progress === 100) {
        setShowModal(true);
      }
    };

    return () => {
      eventSource.close();
    };
  }, []);

  const handleScan = async () => {
    setLoading(true);
    try {
      await axios.post("http://localhost:5000/analyze-emails", { emails });
    } catch (error) {
      console.error("Error analyzing emails:", error);
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  return (
    <Card className="scan-ai-card">
      <Title level={2} className="scan-ai-title">
        Scan Emails with AI
      </Title>
      <Button
        type="primary"
        className="scan-button"
        onClick={handleScan}
        disabled={loading}
      >
        Scan with AI
      </Button>
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
      <Button className="back-button" onClick={onBack}>
        Back
      </Button>
      <Modal
        title="Email Categories"
        open={showModal}
        onCancel={handleModalClose}
        footer={[
          <Button key="close" onClick={handleModalClose}>
            Close
          </Button>,
        ]}
      >
        <p>INFORMATION: {categoriesCount.INFORMATION}</p>
        <p>ADS & SPAM: {categoriesCount["ADS & SPAM"]}</p>
        <p>SOCIAL: {categoriesCount.SOCIAL}</p>
        <p>IMPORTANT: {categoriesCount.IMPORTANT}</p>
      </Modal>
    </Card>
  );
};

export default ScanWithAI;
