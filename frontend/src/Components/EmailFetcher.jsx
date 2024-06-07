import React, { useState, useEffect } from "react";
import { Button, Input, message, Card, Typography, Spin, Form } from "antd";
import {
  GoogleOutlined,
  MailOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import axios from "axios";
import queryString from "query-string";
import EmailModal from "./EmailModal";
import "../Assets/CSS/EmailFetcher.css";

const { Title } = Typography;

const EmailFetcher = ({
  accessToken: initialAccessToken,
  onEmailsFetched,
  onScanWithAI,
}) => {
  const [loading, setLoading] = useState(false);
  const [emails, setEmails] = useState([]);
  const [accessToken, setAccessToken] = useState(initialAccessToken);
  const [refreshToken, setRefreshToken] = useState("");
  const [expiryDate, setExpiryDate] = useState(null);
  const [maxResults, setMaxResults] = useState(10);
  const [selectedEmail, setSelectedEmail] = useState(null);

  useEffect(() => {
    const params = queryString.parse(window.location.search);
    if (params.access_token) {
      setAccessToken(params.access_token);
      setRefreshToken(params.refresh_token);
      setExpiryDate(params.expiry_date);
      localStorage.setItem("accessToken", params.access_token);
      localStorage.setItem("refreshToken", params.refresh_token);
      localStorage.setItem("expiryDate", params.expiry_date);
      window.history.replaceState({}, document.title, "/"); // Reset the URL
    } else {
      const storedToken = localStorage.getItem("accessToken");
      const storedRefreshToken = localStorage.getItem("refreshToken");
      const storedExpiryDate = localStorage.getItem("expiryDate");
      if (storedToken && storedRefreshToken && storedExpiryDate) {
        setAccessToken(storedToken);
        setRefreshToken(storedRefreshToken);
        setExpiryDate(storedExpiryDate);
      }
    }
  }, []);

  const handleAuth = () => {
    window.location.href = "http://localhost:5000/auth";
  };

  const handleFetchEmails = async () => {
    setLoading(true);
    try {
      message.loading("Fetching emails...");
      const response = await axios.post("http://localhost:5000/fetch-emails", {
        access_token: accessToken,
        refresh_token: refreshToken,
        expiry_date: expiryDate,
        maxResults: maxResults,
      });

      if (response.data.newAccessToken) {
        setAccessToken(response.data.newAccessToken);
        localStorage.setItem("accessToken", response.data.newAccessToken);
        message.success("Access token refreshed");
      }

      setEmails(response.data.emails || []);
      onEmailsFetched(response.data.emails || []);
      setLoading(false);
      message.success("Emails fetched successfully!");
    } catch (error) {
      console.error("Error fetching emails:", error);
      setLoading(false);
      message.error("Failed to fetch emails");
    }
  };

  const handleEmailClick = (email) => {
    setSelectedEmail(email);
  };

  const handleModalClose = () => {
    setSelectedEmail(null);
  };

  const handleRevokeTokens = async () => {
    try {
      const storedAccessToken = localStorage.getItem("accessToken");
      const storedRefreshToken = localStorage.getItem("refreshToken");
      const response = await axios.post("http://localhost:5000/revoke-token", {
        access_token: storedAccessToken,
        refresh_token: storedRefreshToken,
      });

      if (response.status === 200) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("expiryDate");
        setAccessToken("");
        setRefreshToken("");
        setExpiryDate(null);
        message.success("Tokens revoked successfully. Please re-authenticate.");
      } else {
        throw new Error("Failed to revoke tokens");
      }
    } catch (error) {
      console.error("Error revoking token:", error);
      message.error("Failed to revoke tokens.");
    }
  };

  return (
    <Card className="email-fetcher-card" bordered={false}>
      <Title level={2} className="fetcher-title">
        Fetched Emails
      </Title>
      <div className="auth-buttons-container">
        <Button type="primary" className="auth-button" onClick={handleAuth}>
          <GoogleOutlined style={{ fontSize: "16px" }} />
          Authenticate with Google
        </Button>
        <Button
          type="primary"
          danger="true"
          className="revoke-button"
          onClick={handleRevokeTokens}
        >
          <ReloadOutlined style={{ fontSize: "16px" }} />
          Revoke Tokens
        </Button>
      </div>
      <Input
        className="access-token-input"
        placeholder="Access token"
        value={accessToken}
        onChange={(e) => setAccessToken(e.target.value)}
      />
      <Form
        className="email-number-fetch-container"
        layout="inline"
        style={{ marginBottom: 16 }}
      >
        <Form.Item
          label={<span style={{ fontSize: "18px" }}>Number of Emails</span>}
        >
          <Input
            type="number"
            value={maxResults}
            onChange={(e) => setMaxResults(Number(e.target.value))}
            min={1}
            max={1000}
          />
        </Form.Item>
        <Form.Item>
          <Button
            type="primary"
            size="large"
            className="fetch-button"
            onClick={handleFetchEmails}
          >
            <MailOutlined />
            Fetch Emails
          </Button>
        </Form.Item>
      </Form>

      {emails.length > 0 && (
        <button className="ai-button" onClick={onScanWithAI}>
          <svg
            height="24"
            width="24"
            fill="#FFFFFF"
            viewBox="0 0 24 24"
            data-name="Layer 1"
            id="Layer_1"
            className="sparkle"
          >
            <path d="M10,21.236,6.755,14.745.264,11.5,6.755,8.255,10,1.764l3.245,6.491L19.736,11.5l-6.491,3.245ZM18,21l1.5,3L21,21l3-1.5L21,18l-1.5-3L18,18l-3,1.5ZM19.333,4.667,20.5,7l1.167-2.333L24,3.5,21.667,2.333,20.5,0,19.333,2.333,17,3.5Z"></path>
          </svg>
          <span className="text">AI Analysis</span>
        </button>
      )}

      {loading ? (
        <Spin size="large" className="loading-spinner" />
      ) : (
        <>
          <div className="emails-list">
            {emails.map((email, index) => (
              <Card
                key={index}
                className="email-card"
                onClick={() => handleEmailClick(email)}
              >
                <Title level={4}>{email.subject}</Title>
              </Card>
            ))}
          </div>
        </>
      )}
      {selectedEmail && (
        <EmailModal
          email={selectedEmail}
          visible={!!selectedEmail}
          onClose={handleModalClose}
        />
      )}
    </Card>
  );
};

export default EmailFetcher;
