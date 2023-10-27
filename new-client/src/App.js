import React from "react";
import "./App.css";
import { Counter } from "./features/counter/Counter";
import PatientsPage from "./features/patients/PatientsPage";

function App() {
  return (
    <div className="App">
      <Counter />
      <PatientsPage />
    </div>
  );
}

export default App;
