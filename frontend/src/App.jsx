import React, { useState } from "react";
import { Layout, Typography, message } from "antd";
import EmailForm from "./Components/EmailForm";
import EmailFetcher from "./Components/EmailFetcher";
import "./Assets/CSS/main.css";

const { Header, Content, Footer } = Layout;
const { Title } = Typography;

const App = () => {
  const [formData, setFormData] = useState(null);

  const handleFormSubmit = (data) => {
    setFormData(data);
    message.success("Fetching emails...");
  };

  return (
    <Layout className="layout">
      <Header className="header">
        <Title className="logo">AssessMyMail</Title>
      </Header>
      <Content className="content">
        <div className="site-layout-content">
          {!formData ? (
            <EmailForm onSubmit={handleFormSubmit} />
          ) : (
            <EmailFetcher
              email={formData.email}
              password={formData.password}
              host={formData.host}
            />
          )}
        </div>
      </Content>
      <Footer style={{ textAlign: "center" }}>AssessMyMail ©2023</Footer>
    </Layout>
  );
};

export default App;
