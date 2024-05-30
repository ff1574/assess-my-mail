import React, { useState, useEffect } from "react";
import { Layout, Typography, message } from "antd";
import LoginForm from "./Components/LoginForm";
import EmailFetcher from "./Components/EmailFetcher";
import ScanWithAI from "./Components/ScanWithAI";
import "./Assets/CSS/main.css";

const { Header, Content, Footer } = Layout;
const { Title } = Typography;

const App = () => {
  const [formData, setFormData] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [emails, setEmails] = useState([]);
  const [view, setView] = useState("fetcher");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("access_token");
    if (token) {
      setAccessToken(token);
    }
  }, []);

  const handleFormSubmit = (data) => {
    setFormData(data);
    message.success("Login successful!");
  };

  const handleEmailsFetched = (emails) => {
    setEmails(emails);
    setView("fetcher");
  };

  const handleScanWithAI = () => {
    setView("scanner");
  };

  return (
    <Layout className="layout">
      <Header className="header">
        <Title className="logo">AssessMyMail</Title>
      </Header>
      <Content className="content">
        <div className="site-layout-content">
          {!formData && !accessToken ? (
            <LoginForm onSubmit={handleFormSubmit} />
          ) : view === "fetcher" ? (
            <EmailFetcher
              email={formData?.email}
              password={formData?.password}
              host={formData?.host}
              accessToken={accessToken}
              onEmailsFetched={handleEmailsFetched}
              onScanWithAI={handleScanWithAI}
            />
          ) : (
            <ScanWithAI emails={emails} onBack={() => setView("fetcher")} />
          )}
        </div>
      </Content>
      <Footer style={{ textAlign: "center" }}>
        AssessMyMail ©{new Date().getFullYear()}
      </Footer>
    </Layout>
  );
};

export default App;
