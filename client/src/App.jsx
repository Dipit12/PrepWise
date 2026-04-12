import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useParams,
} from "react-router-dom";
import Register from "./features/auth/pages/Register";
import Login from "./features/auth/pages/Login";
import Protected from "./features/auth/components/Protected";
import { AuthProvider } from "./features/auth/authProvider";
import { useAuth } from "./features/auth/hooks/useAuth";
import { InterviewProvider } from "./features/interview/interviewProvider";
import Home from "./features/interview/pages/Home";
import Interview from "./features/interview/pages/Interview";
import Landing from "./features/marketing/pages/Landing";
import AppNavbar from "./components/AppNavbar";

const LandingLayout = () => {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (user) return <Navigate to="/workspace" replace />;

  return (
    <>
      <AppNavbar />
      <Landing />
    </>
  );
};

const WorkspaceLayout = ({ children }) => (
  <Protected>
    <>
      <AppNavbar />
      {children}
    </>
  </Protected>
);

const LegacyInterviewReportRedirect = () => {
  const { interviewID } = useParams();
  return <Navigate to={`/workspace/interview-report/${interviewID}`} replace />;
};

function App() {
  return (
    <AuthProvider>
      <InterviewProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingLayout />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route
              path="/workspace"
              element={
                <WorkspaceLayout>
                  <Home />
                </WorkspaceLayout>
              }
            />
            <Route
              path="/workspace/interview-report"
              element={
                <WorkspaceLayout>
                  <Interview />
                </WorkspaceLayout>
              }
            />
            <Route
              path="/workspace/interview-report/:interviewID"
              element={
                <WorkspaceLayout>
                  <Interview />
                </WorkspaceLayout>
              }
            />

            <Route
              path="/interviewReport"
              element={<Navigate to="/workspace/interview-report" replace />}
            />
            <Route
              path="/interviewReport/:interviewID"
              element={<LegacyInterviewReportRedirect />}
            />
          </Routes>
        </BrowserRouter>
      </InterviewProvider>
    </AuthProvider>
  );
}

export default App;
