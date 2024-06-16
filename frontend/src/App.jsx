import React, { useContext, useState } from "react";
import { Layout } from "antd";
import LoginForm from "./Components/LoginForm";
import EmailFetcher from "./Components/EmailFetcher";
import ScanWithAI from "./Components/ScanWithAI";
import AppHeader from "./Components/Header";
import AppFooter from "./Components/Footer";
import AuthContext, { AuthProvider } from "./Util/authContext";
import setupAxiosInterceptors from "./Util/setupAxiosInterceptors";
import "./Assets/CSS/main.css";

const { Content } = Layout;

setupAxiosInterceptors();

const App = () => {
  return (
    <AuthProvider>
      <Layout className="layout">
        <AppHeader />
        <Content className="content">
          <div className="site-layout-content">
            <AppContent />
          </div>
        </Content>
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
    setView("fetcher");
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
