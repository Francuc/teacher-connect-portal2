import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import Landing from "./pages/Landing";
import TeacherProfileForm from "./components/TeacherProfileForm";
import { TeachersList } from "./components/TeachersList";
import Teachers2 from "./pages/Teachers2";
import AuthPage from "./pages/Auth";
import { LanguageProvider } from "./contexts/LanguageContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <Router>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<Landing />} />
              <Route path="auth" element={<AuthPage />} />
              <Route path="profile/new" element={<TeacherProfileForm />} />
              <Route path="profile/:userId" element={<TeacherProfileForm />} />
              <Route path="profile/edit/:userId" element={<TeacherProfileForm />} />
              <Route path="teachers" element={<TeachersList />} />
              <Route path="teachers2" element={<Teachers2 />} />
            </Route>
          </Routes>
        </Router>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;