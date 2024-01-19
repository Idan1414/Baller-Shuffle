import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './components/HomePage';
import NewGamePage from './components/NewGamePage';
import CreatePlayerPage from './components/CreatePlayerPage';
import PlayerSuccessCreationPage from './components/PlayerSuccessCreationPage';
import PlayerPage from './components/PlayerPage';
import PlayerSuccessEditPage from './components/PlayerSuccessEditPage';
import TeamsPage from './components/TeamsPage';
import CourtsPage from './components/CourtsPage';
import CreateCourtPage from './components/CreateCourtPage';



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CourtsPage />} />
        <Route path="/court_home_page/:courtId" element={<HomePage />} />
        <Route path="/new-game/:courtId" element={<NewGamePage />} />
        <Route path="/new-player/:courtId" element={<CreatePlayerPage />} />
        <Route path="/creation_success/:courtId" element={<PlayerSuccessCreationPage />} />
        <Route path="/edit_success/:courtId" element={<PlayerSuccessEditPage />} />
        <Route path="/player/:id/:courtId" element={<PlayerPage />} />
        <Route path="/teams/:courtId" element={<TeamsPage />} />
        <Route path="/new-court" element={<CreateCourtPage />} />
      </Routes>
    </Router>
  );
}

export default App;