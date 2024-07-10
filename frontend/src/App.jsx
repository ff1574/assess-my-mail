import React, { useContext, useState } from "react";
import { Layout } from "antd";
import LoginForm from "./Components/LoginForm";
import EmailFetcher from "./Components/EmailFetcher";
import ScanWithAI from "./Components/ScanWithAI";
import TierModal from "./Components/TierModal";
import AppHeader from "./Components/Header";
import AppFooter from "./Components/Footer";
import AuthContext, { AuthProvider } from "./Util/authContext";
import setupAxiosInterceptors from "./Util/setupAxiosInterceptors";
import "./Assets/CSS/main.css";

const { Content } = Layout;

setupAxiosInterceptors();

const App = () => {
  const [tierModalVisible, setTierModalVisible] = useState(false);

  const handleOpenTierModal = () => {
    setTierModalVisible(true);
  };

  const handleCloseTierModal = () => {
    setTierModalVisible(false);
  };

  return (
    <AuthProvider>
      <Layout className="layout">
        <AppHeader onOpenTierModal={handleOpenTierModal} />
        <Content className="content">
          <div className="site-layout-content">
            <AppContent />
          </div>
        </Content>
        <TierModal visible={tierModalVisible} onCancel={handleCloseTierModal} />
        <AppFooter />
      </Layout>
    </AuthProvider>
  );
};

const AppContent = () => {
  const { currentUser } = useContext(AuthContext);
  const [emails, setEmails] = useState([]);
  const [view, setView] = useState("fetcher");

  const handleEmailsFetched = (emails) => {
    setEmails(emails);
  };

  const handleScanWithAI = () => {
    setView("scanner");
  };

  return (
    <>
      {!currentUser ? (
        <LoginForm />
      ) : view === "fetcher" ? (
        <EmailFetcher
          emails={emails}
          onEmailsFetched={handleEmailsFetched}
          onScanWithAI={handleScanWithAI}
        />
      ) : (
        <ScanWithAI emails={emails} onBack={() => setView("fetcher")} />
      )}
    </>
  );
};

export default App;
