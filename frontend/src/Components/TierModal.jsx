import React from "react";
import { Modal, Button, Card, Row, Col, Typography } from "antd";
import { UserOutlined, CrownOutlined, RocketOutlined } from "@ant-design/icons";
import "../Assets/CSS/TierModal.css";

const { Title } = Typography;

const plans = [
  {
    title: "Guest",
    icon: <UserOutlined style={{ fontSize: "30px", color: "#1890ff", margin: "0 auto" }} />,
    description: "Analyze 10 emails free",
    price: "Free",
    emails: 10,
    color: "#1890ff",
  },
  {
    title: "Premium",
    icon: <CrownOutlined style={{ fontSize: "30px", color: "#faad14", margin: "0 auto" }} />,
    description: "Analyze 500 emails for 5€",
    price: "5€",
    emails: 500,
    color: "#faad14",
  },
  {
    title: "Ultimate",
    icon: <RocketOutlined style={{ fontSize: "30px", color: "#f5222d", margin: "0 auto" }} />,
    description: "Analyze 1500 emails for 10€",
    price: "10€",
    emails: 1500,
    color: "#f5222d",
  },
];

const TierModal = ({ visible, onCancel, onUpgrade }) => {
  return (
    <Modal
      title="Choose Your Plan"
      open={visible}
      onCancel={onCancel}
      footer={null}
      className="tier-modal"
    >
      <Row gutter={[16, 16]} justify="center">
        {plans.map((plan) => (
          <Col span={8} key={plan.title}>
            <Card
              hoverable
              bordered={false}
              className="plan-card"
              style={{ borderTop: `4px solid ${plan.color}` }}
            >
              {plan.icon}
              <Title level={3} className="plan-title">
                {plan.title}
              </Title>
              <p className="plan-description">{plan.description}</p>
              <Button
                type="primary"
                className="plan-button"
                style={{ backgroundColor: plan.color, borderColor: plan.color }}
                onClick={() => onUpgrade(plan.title)}
              >
                {plan.price === "Free" ? "Stay" : `Buy for ${plan.price}`}
              </Button>
            </Card>
          </Col>
        ))}
      </Row>
    </Modal>
  );
};

export default TierModal;
