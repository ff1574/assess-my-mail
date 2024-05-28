import React, { useState } from "react";
import { Form, Input, Button, Select, Typography, Card } from "antd";
import { MailOutlined, LockOutlined } from "@ant-design/icons";
import "../Assets/CSS/LoginForm.css";

const { Option } = Select;
const { Title } = Typography;

const EmailForm = ({ onSubmit }) => {
  const [form] = Form.useForm();

  const handleFinish = (values) => {
    onSubmit(values);
  };

  return (
    <Card className="email-form-card" bordered={false}>
      <Title level={3} className="form-title">
        Connect Your Email
      </Title>
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item
          name="email"
          rules={[
            { required: true, message: "Please input your email address!" },
          ]}
        >
          <Input
            prefix={<MailOutlined />}
            placeholder="Email Address"
            className="form-input"
          />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[
            { required: true, message: "Please input your email password!" },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Password"
            className="form-input"
          />
        </Form.Item>
        <Form.Item
          name="host"
          rules={[
            { required: true, message: "Please select your email host!" },
          ]}
        >
          <Select placeholder="Select Email Host" className="form-select">
            <Option value="imap.gmail.com">Gmail</Option>
            <Option value="imap.mail.yahoo.com">Yahoo</Option>
            <Option value="imap-mail.outlook.com">Outlook</Option>
          </Select>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" className="form-button">
            Connect
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default EmailForm;
