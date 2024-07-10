import React, { useContext, useState } from "react";
import { Layout, Typography, Button, Popover } from "antd";
import { MenuOutlined, LogoutOutlined, StarOutlined } from "@ant-design/icons";
import AuthContext from "../Util/authContext";
import TierModal from "./TierModal";
import "../Assets/CSS/Header.css";

const { Header } = Layout;
const { Title } = Typography;

const AppHeader = ({ onOpenTierModal }) => {
  const { logout } = useContext(AuthContext);

  const menuContent = (
    <div className="menu-content">
      <Button
        className="tier-button"
        type="text"
        icon={<StarOutlined />}
        onClick={onOpenTierModal}
      >
        Choose Plan
      </Button>
      <Button
        className="logout-button"
        type="text"
        // danger="true"
        icon={<LogoutOutlined />}
        onClick={logout}
      >
        Logout
      </Button>
    </div>
  );

  return (
    <Header className="header">
      <div className="logo-title-container">
        <img className="app-logo" src="favicon.ico" alt="App Icon" />
        <Title level={2} style={{ color: "white", margin: 0 }}>
          AssessMyMail
        </Title>
      </div>
      <Popover
        content={menuContent}
        trigger="click"
        placement="bottomRight"
        overlayClassName="menu-popover"
      >
        <Button
          className="menu-button"
          type="primary"
          shape="circle"
          size="large"
          icon={<MenuOutlined />}
        />
      </Popover>
    </Header>
  );
};

export default AppHeader;
