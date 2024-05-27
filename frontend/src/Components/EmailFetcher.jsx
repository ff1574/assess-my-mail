import React, { useState } from "react";
import { Button, Input, message, Card, Typography, Spin } from "antd";
import axios from "axios";

const { Title } = Typography;

const EmailFetcher = () => {
  const [loading, setLoading] = useState(false);
  const [emails, setEmails] = useState([]);
  const [accessToken, setAccessToken] = useState("");

  const handleAuth = () => {
    window.location.href = "http://localhost:5000/auth";
  };

  const handleFetchEmails = async () => {
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:5000/fetch-emails", {
        access_token: accessToken,
      });
      setEmails(response.data.emails);
      setLoading(false);
      message.success("Emails fetched successfully!");
    } catch (error) {
      console.error("Error fetching emails:", error);
      setLoading(false);
      message.error("Failed to fetch emails");
    }
  };

  return (
    <Card className="email-fetcher-card" bordered={false}>
      <Title level={3} className="fetcher-title">
        Fetched Emails
      </Title>
      <Button type="primary" onClick={handleAuth}>
        Authenticate with Google
      </Button>
      <Input
        placeholder="Paste your access token here"
        value={accessToken}
        onChange={(e) => setAccessToken(e.target.value)}
      />
      <Button type="primary" onClick={handleFetchEmails}>
        Fetch Emails
      </Button>
      {loading ? (
        <Spin size="large" className="loading-spinner" />
      ) : (
        <div className="emails-list">
          {emails.map((email, index) => (
            <Card key={index} className="email-card">
              <Title level={4}>{email.snippet}</Title>
            </Card>
          ))}
        </div>
      )}
    </Card>
  );
};

export default EmailFetcher;
