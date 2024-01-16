import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './components/HomePage';
import NewGamePage from './components/NewGamePage';
import NewPlayerPage from './components/CreatePlayerPage';
import PlayerSuccessCreationPage from './components/PlayerSuccessCreationPage';
import PlayerPage from './components/PlayerPage';
import PlayerSuccessEditPage from './components/PlayerSuccessEditPage';
import TeamsPage from './components/TeamsPage';



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/new-game" element={<NewGamePage />} />
        <Route path="/new-player" element={<NewPlayerPage />} />
        <Route path="/creation_success" element={<PlayerSuccessCreationPage />} />
        <Route path="/edit_success" element={<PlayerSuccessEditPage />} />
        <Route path="/player/:id" element={<PlayerPage />} />
        <Route path="/teams" element={<TeamsPage />} />
      </Routes>
    </Router>
  );
}

export default App;