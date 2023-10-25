import React from "react";
import "./App.css";
import { Counter } from "./features/counter/Counter";
import PatientsList from "./features/patients/PatientsList";

function App() {
  return (
    <div className="App">
      <Counter />
      <PatientsList />
    </div>
  );
}

export default App;
