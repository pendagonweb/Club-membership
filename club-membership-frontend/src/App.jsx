import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import Login from "./components/Login";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Header from "./components/Header";
import BottomNav from "./components/BottomNav";

// ── Lazy-loaded routes ──
// Keeps html2canvas, jspdf, chart.js, swiper, react-easy-crop, etc. out of
// the initial bundle. Home/Login stay eager since they're the most common
// first paint.
const AdminPage = lazy(() => import("./components/AdminPage"));
const UserList = lazy(() => import("./components/UserList/UserList"));
const AdminLayout = lazy(() => import("./components/AdminLayout"));
const MemberRegister = lazy(() => import("./components/MemberRegister"));
const UploadPayment = lazy(() => import("./components/UpdatePayment"));
const AdminLogin = lazy(() => import("./components/AdminLogin"));
const MemberDashboard = lazy(() => import("./components/MembershipDashboard"));
const MembershipCard = lazy(() => import("./pages/MemberCard"));
const JuniorRegister = lazy(() => import("./pages/JuniorRegister"));
const JuniorList = lazy(() => import("./components/JuniorList"));
const PanelList = lazy(() => import("./components/PanelList"));
const VotingPage = lazy(() => import("./components/VotingPage"));
const VotingResults = lazy(() => import("./pages/VotingResults"));
const AdminActivities = lazy(() => import("./components/AdminActivities"));
const GalleryManager = lazy(() => import("./pages/GalleryManager"));
const ActivityPage = lazy(() => import("./pages/ActivityPage"));
const AdminLogoPanel = lazy(() => import("./pages/AdminLogoPanel"));
const CommitteePage = lazy(() => import("./pages/CommitteePage"));
const KingstarAboutPage = lazy(() => import("./pages/KingstarAboutPage"));
const Gallery = lazy(() => import("./pages/Gallery"));
const PlayerRegistration = lazy(() => import("./pages/Playerregistration"));
const PlayersAdmin = lazy(() => import("./pages/Playersadmin"));
const Reports = lazy(() => import("./pages/Report"));
const ActivityDetailPage = lazy(() => import("./pages/ActivityDetailPage"));
const SingleNewsPage = lazy(() => import("./pages/SingleNewsPage"));
const NriVoteUpdates = lazy(() => import("./pages/NriVoteUpdates"));

function PageLoader() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function PublicLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-grow">{children}</div>
      <BottomNav />
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Router>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* PUBLIC ROUTES */}
          <Route
            path="/"
            element={
              <PublicLayout>
                <Home />
              </PublicLayout>
            }
          />
          <Route
            path="/login"
            element={
              <PublicLayout>
                <Login />
              </PublicLayout>
            }
          />
          <Route
            path="/activities/:id"
            element={
              <PublicLayout>
                <ActivityDetailPage />
              </PublicLayout>
            }
          />
          <Route
            path="/register"
            element={
              <PublicLayout>
                <MemberRegister />
              </PublicLayout>
            }
          />
          <Route
            path="/vote"
            element={
              <PublicLayout>
                <VotingPage />
              </PublicLayout>
            }
          />
          <Route
            path="/player-list"
            element={
              <PublicLayout>
                <PlayersAdmin />
              </PublicLayout>
            }
          />
          <Route
            path="/report"
            element={
              <PublicLayout>
                <Reports />
              </PublicLayout>
            }
          />
          <Route
            path="/news/:id"
            element={
              <PublicLayout>
                <SingleNewsPage />
              </PublicLayout>
            }
          />
          <Route
            path="/player-register"
            element={
              <PublicLayout>
                <PlayerRegistration />
              </PublicLayout>
            }
          />
          <Route
            path="/upload-payment"
            element={
              <PublicLayout>
                <UploadPayment />
              </PublicLayout>
            }
          />
          <Route
            path="/admin-login"
            element={
              <PublicLayout>
                <AdminLogin />
              </PublicLayout>
            }
          />
          <Route
            path="/dashboard"
            element={
              <PublicLayout>
                <MemberDashboard />
              </PublicLayout>
            }
          />
          <Route
            path="/results"
            element={
              <PublicLayout>
                <VotingResults />
              </PublicLayout>
            }
          />
          <Route
            path="/activities"
            element={
              <PublicLayout>
                <ActivityPage />
              </PublicLayout>
            }
          />
          <Route
            path="/member"
            element={
              <PublicLayout>
                <MembershipCard />
              </PublicLayout>
            }
          />
          <Route
            path="/junior-register"
            element={
              <PublicLayout>
                <JuniorRegister />
              </PublicLayout>
            }
          />
          <Route
            path="/committee"
            element={
              <PublicLayout>
                <CommitteePage />
              </PublicLayout>
            }
          />
          <Route
            path="/about"
            element={
              <PublicLayout>
                <KingstarAboutPage />
              </PublicLayout>
            }
          />
          <Route
            path="/gallery"
            element={
              <PublicLayout>
                <Gallery />
              </PublicLayout>
            }
          />
          <Route
            path="/vote-updates"
            element={
              <PublicLayout>
                <NriVoteUpdates />
              </PublicLayout>
            }
          />

          {/* ADMIN ROUTES */}
          <Route
            path="/admin"
            element={
              <AdminLayout>
                <AdminPage />
              </AdminLayout>
            }
          />
          <Route
            path="/adminlogo"
            element={
              <AdminLayout>
                <AdminLogoPanel />
              </AdminLayout>
            }
          />
          <Route
            path="/adminactivities"
            element={
              <AdminLayout>
                <AdminActivities />
              </AdminLayout>
            }
          />
          <Route
            path="/admingallery"
            element={
              <AdminLayout>
                <GalleryManager />
              </AdminLayout>
            }
          />
          <Route
            path="/users"
            element={
              <AdminLayout>
                <UserList />
              </AdminLayout>
            }
          />
          <Route
            path="/juniors"
            element={
              <AdminLayout>
                <JuniorList />
              </AdminLayout>
            }
          />
          <Route
            path="/panels"
            element={
              <AdminLayout>
                <PanelList />
              </AdminLayout>
            }
          />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
