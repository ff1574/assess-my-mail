import React, { useState } from "react";
import { Button, Card, Typography, Spin, List, Progress } from "antd";
import axios from "axios";
import "../Assets/CSS/ScanWithAI.css";

const { Title } = Typography;

const ScanWithAI = ({ emails, onBack }) => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [analysisResults, setAnalysisResults] = useState([]);

  const handleScan = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:5000/analyze-emails",
        { emails }
      );

      // Simulating progress updates
      for (let i = 1; i <= emails.length; i++) {
        setTimeout(() => {
          setProgress((i / emails.length) * 100);
        }, i * 1000);
      }

      setAnalysisResults(response.data.analysis);
      setLoading(false);
    } catch (error) {
      console.error("Error analyzing emails:", error);
      setLoading(false);
    }
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
            <Card title={result.email.subject}>{result.analysis}</Card>
          </List.Item>
        )}
      />
      <Button className="back-button" onClick={onBack}>
        Back
      </Button>
    </Card>
  );
};

export default ScanWithAI;
