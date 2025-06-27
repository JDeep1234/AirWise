import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Forecast from './pages/Forecast';
import Historical from './pages/Historical';
import Alerts from './pages/Alerts';
import About from './pages/About';
import MicroZonePrediction from './pages/MicroZonePrediction';
import InfrastructureControl from './pages/InfrastructureControl';
import PollutionSourceAttribution from './pages/PollutionSourceAttribution';
import PollutionPassport from './pages/PollutionPassport';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/forecast" element={<Forecast />} />
            <Route path="/historical" element={<Historical />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/about" element={<About />} />
            <Route path="/micro-zone-prediction" element={<MicroZonePrediction />} />
            <Route path="/infrastructure-control" element={<InfrastructureControl />} />
            <Route path="/pollution-source-attribution" element={<PollutionSourceAttribution />} />
            <Route path="/pollution-passport" element={<PollutionPassport />} />
          </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;