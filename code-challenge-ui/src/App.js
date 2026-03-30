import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AddBuyer from './components/AddBuyer';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<AddBuyer />} />
          <Route path="/add-buyer" element={<AddBuyer />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
