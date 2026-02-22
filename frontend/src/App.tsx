import { Routes, Route, Navigate } from 'react-router-dom'
import { OptionalAuthLayout, HomeOrLanding } from './components/RootLayout'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ExplorePage from './pages/ExplorePage'
import TrendingPage from './pages/TrendingPage'
import SearchPage from './pages/SearchPage'
import NotificationsPage from './pages/NotificationsPage'
import ProfilePage from './pages/ProfilePage'
import PublicOrAuthPostThread from './pages/PublicOrAuthPostThread'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/p/:postId" element={<PublicOrAuthPostThread />} />
      <Route path="/" element={<OptionalAuthLayout />}>
        <Route index element={<HomeOrLanding />} />
        <Route path="explore" element={<ExplorePage />} />
        <Route path="trending" element={<TrendingPage />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="u/:username" element={<ProfilePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
