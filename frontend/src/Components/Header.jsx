import React from "react";
import { Layout, Menu, Typography } from "antd";
import "../Assets/CSS/Header.css";

const { Header } = Layout;
const { Title } = Typography;

const AppHeader = () => (
  <Header className="header">
    <div className="logo-title-container">
      <img className="app-logo" src="favicon.ico" alt="App Icon" />
      <Title level={2} style={{ color: "white", margin: 0, }}>
        AssessMyMail
      </Title>
    </div>
  </Header>
);

export default AppHeader;
