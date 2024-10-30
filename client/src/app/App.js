import React from 'react';
import { Navigate } from 'react-router-dom';

import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import CourtHomePage from '../components/CourtHomePage';
import BasketballCreatePlayerPage from '../components/Basketball/BasketballCreatePlayerPage';
import FootballCreatePlayerPage from '../components/Football/FootballCreatePlayerPage';
import PlayerSuccessCreationPage from '../components/PlayerSuccessCreationPage';
import EditPlayerPage from '../components/Basketball/BasketballEditPlayerPage';
import FootballEditPlayerPage from '../components/Football/FootballEditPlayerPage';
import PlayerSuccessEditPage from '../components/PlayerSuccessEditPage';
import TeamsPage from '../components/TeamsPage';
import CourtsPage from '../components/CourtsPage';
import CreateCourtPage from '../components/CreateCourtPage';
import AuthForm from '../components/AuthForm';
import ScheduledGamesPage from '../components/ScheduledGamesPage';
import GamePage from '../components/GamePage';
import StatisticsPage from '../components/StatisticsPage';






const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/" />;
};

// Usage in Routes:
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthForm />} />
        <Route path="/courts_page/:userId" element={<ProtectedRoute><CourtsPage /></ProtectedRoute>} />
        <Route path="/court_home_page/:courtId" element={<CourtHomePage />} />
        <Route path="/new-player/:courtId" element={<BasketballCreatePlayerPage />} />
        <Route path="/new-player-football/:courtId" element={<FootballCreatePlayerPage />} />
        <Route path="/creation-success/:courtId" element={<PlayerSuccessCreationPage />} />
        <Route path="/edit-success/:courtId" element={<PlayerSuccessEditPage />} />
        <Route path="/player/:id/:courtId" element={<EditPlayerPage />} />
        <Route path="/player-football/:id/:courtId" element={<FootballEditPlayerPage />} />
        <Route path="/teams/:gameId/:courtId" element={<TeamsPage />} />
        <Route path="/new-court/:userId" element={<CreateCourtPage />} />
        <Route path="/scheduled-games/:courtId" element={<ScheduledGamesPage />} />
        <Route path="/game/:gameId/:courtId" element={<GamePage />} />
        <Route path="/statistics/:courtId" element={<StatisticsPage />} />



      </Routes>
    </Router>
  );
}

export default App;