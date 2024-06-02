import React from "react";
import { Layout, Space, Typography } from "antd";
import {
  FacebookOutlined,
  TwitterOutlined,
  LinkedinOutlined,
  GithubOutlined,
} from "@ant-design/icons";
import "../Assets/CSS/Footer.css";

const { Footer } = Layout;
const { Text } = Typography;

const AppFooter = () => (
  <Footer className="footer">
    <Space direction="vertical" size="middle">
      <Space size="large" className="footer-icons">
        <a
          href="https://facebook.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FacebookOutlined />
        </a>
        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
          <TwitterOutlined />
        </a>
        <a
          href="https://linkedin.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          <LinkedinOutlined />
        </a>
        <a href="https://github.com" target="_blank" rel="noopener noreferrer">
          <GithubOutlined />
        </a>
      </Space>
      <p className="footer-text">
        AssessMyMail ©{new Date().getFullYear()}
      </p>
    </Space>
  </Footer>
);

export default AppFooter;
