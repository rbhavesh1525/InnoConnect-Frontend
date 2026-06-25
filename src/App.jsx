import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import { Login, HomePage, Signup } from "./Pages/PageIndex";
import UserProfile from "./Pages/UserProfile";
import { UserChat, MyNetwork } from "./Pages/PageIndex";
import { Footer } from "./Components/CompIndex";
import { NotificationProvider } from "./context/NotificationContext";
import AdminDashboard from "./Admin/AdminDashboard";
import InvestorVerification from "./Admin/InvestorVerification";
import AdminRoute from "./Admin/AdminRoute";

function App() {
  return (
    <NotificationProvider>
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              <>
                <HomePage /> <Footer />{" "}
              </>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/userprofile" element={<UserProfile />} />
          <Route path="/chat" element={<UserChat />} />
          <Route path="/mynetwork" element={<MyNetwork />} />

          {/* Protected Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/investor-verification"
            element={
              <AdminRoute>
                <InvestorVerification />
              </AdminRoute>
            }
          />
        </Routes>
      </Router>
    </NotificationProvider>
  );
}

export default App;

