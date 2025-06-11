import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { ErrorBoundary } from "react-error-boundary";
import { motion, AnimatePresence } from "framer-motion";

// Pages and Components
import Navbar from "./components/Navbar";
import PublicNavbar from "./components/PublicNavbar";
import ProtectedRoute from "./components/ProtectedRoute";
import ErrorFallback from "./components/ErrorFallback";
import Login from "./components/login";
import Dashboard from "./pages/Dashboard";
import List from "./pages/List";
import Add from "./pages/Add";
import Update from "./pages/Update";
import Appointments from "./pages/Appointments";
import BookedProperties from "./pages/BookedProperties";

// Config
export const backendurl = import.meta.env.VITE_BACKEND_URL;

// Page transition variants
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const App = () => {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => window.location.reload()}
    >
      <div className="min-h-screen bg-gray-50">
        <AnimatePresence mode="wait">
          {" "}
          <Routes>
            {/* Public Routes */}
            <Route
              path="/login"
              element={
                <>
                  <PublicNavbar />
                  <Login />
                </>
              }
            />
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route
                path="/*"
                element={
                  <>
                    <Navbar />
                    <motion.div
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      variants={pageVariants}
                      transition={{ duration: 0.3 }}
                    >
                      <Routes>
                        {" "}
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/list" element={<List />} />
                        <Route path="/add" element={<Add />} />
                        <Route path="/update/:id" element={<Update />} />
                        <Route
                          path="/appointments"
                          element={<Appointments />}
                        />
                        <Route
                          path="/booked-properties"
                          element={<BookedProperties />}
                        />
                        {/* Redirect to dashboard for any unmatched routes within protected area */}
                        <Route
                          path="*"
                          element={<Navigate to="/dashboard" replace />}
                        />
                      </Routes>
                    </motion.div>
                  </>
                }
              />
            </Route>
          </Routes>
        </AnimatePresence>

        {/* Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: "#333",
              color: "#fff",
            },
          }}
        />
      </div>
    </ErrorBoundary>
  );
};

export default App;
