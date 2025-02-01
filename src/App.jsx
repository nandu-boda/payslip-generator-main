import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PayslipForm from './components/payslipForm/payslipForm';
import Payslip from './components/payslip/payslip';
import ViewPayslips from './components/view-payslips/viewPayslip.jsx';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PayslipForm />} />
        <Route path="/payslip" element={<Payslip />} />
        <Route path="/viewPayslip" element={<ViewPayslips />} />
      
      </Routes>
    </Router>
  );
}

export default App;