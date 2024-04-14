import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import BasketballCourtPage from '../components/Basketball/BasketballCourtPage';
import FootballCourtPage from '../components/Football/FootballCourtPage';
import NewGamePage from '../components/Basketball/NewGamePage';
import FootballNewGamePage from '../components/Football/FootballNewGamePage';
import BasketballCreatePlayerPage from '../components/Basketball/BasketballCreatePlayerPage';
import FootballCreatePlayerPage from '../components/Football/FootballCreatePlayerPage';
import PlayerSuccessCreationPage from '../components/Basketball/PlayerSuccessCreationPage';
import FootballPlayerSuccessCreationPage from '../components/Football/FootballPlayerSuccessCreationPage';
import EditPlayerPage from '../components/Basketball/EditPlayerPage';
import FootballEditPlayerPage from '../components/Football/FootballEditPlayerPage';
import PlayerSuccessEditPage from '../components/Basketball/PlayerSuccessEditPage';
import FootballPlayerSuccessEditPage from '../components/Football/FootballPlayerSuccessEditPage';
import TeamsPage from '../components/Basketball/TeamsPage';
import FootballTeamsPage from '../components/Football/FootballTeamsPage';
import CourtsPage from '../components/CourtsPage';
import CreateCourtPage from '../components/CreateCourtPage';
import AuthForm from '../components/AuthForm';




function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthForm />} /> 
        <Route path="/courts_page/:userId" element={<CourtsPage />} />
        <Route path="/court_home_page/:courtId" element={<BasketballCourtPage />} />
        <Route path="/court_home_page_football/:courtId" element={<FootballCourtPage />} />
        <Route path="/new-game/:courtId" element={<NewGamePage />} />
        <Route path="/new-game-football/:courtId" element={<FootballNewGamePage />} />
        <Route path="/new-player/:courtId" element={<BasketballCreatePlayerPage />} />
        <Route path="/new-player-football/:courtId" element={<FootballCreatePlayerPage />} />
        <Route path="/creation_success/:courtId" element={<PlayerSuccessCreationPage />} />
        <Route path="/edit_success/:courtId" element={<PlayerSuccessEditPage />} />
        <Route path="/creation_success_football/:courtId" element={<FootballPlayerSuccessCreationPage />} />
        <Route path="/edit_success_football/:courtId" element={<FootballPlayerSuccessEditPage />} />
        <Route path="/player/:id/:courtId" element={<EditPlayerPage />} />
        <Route path="/player-football/:id/:courtId" element={<FootballEditPlayerPage />} />
        <Route path="/teams/:courtId" element={<TeamsPage />} />
        <Route path="/teams-football/:courtId" element={<FootballTeamsPage />} />
        <Route path="/new-court" element={<CreateCourtPage />} />
      </Routes>
    </Router>
  );
}

export default App;