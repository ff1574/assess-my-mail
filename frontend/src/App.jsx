import React, { useState, useEffect } from "react";
import { Layout, Typography, message } from "antd";
import LoginForm from "./Components/LoginForm";
import EmailFetcher from "./Components/EmailFetcher";
import "./Assets/CSS/main.css";

const { Header, Content, Footer } = Layout;
const { Title } = Typography;

const App = () => {
  const [formData, setFormData] = useState(null);
  const [accessToken, setAccessToken] = useState(null);

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

  return (
    <Layout className="layout">
      <Header className="header">
        <Title className="logo">AssessMyMail</Title>
      </Header>
      <Content className="content">
        <div className="site-layout-content">
          {!formData && !accessToken ? (
            <LoginForm onSubmit={handleFormSubmit} />
          ) : (
            <EmailFetcher
              email={formData?.email}
              password={formData?.password}
              host={formData?.host}
              accessToken={accessToken}
            />
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
