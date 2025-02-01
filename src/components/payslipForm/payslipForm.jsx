import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './payslipForm.css';

const PayslipForm = () => {
    const [employeeName, setEmployeeName] = useState('');
    const [employeeId, setEmployeeId] = useState('');
    const [basicPay, setBasicPay] = useState('');
    const [allowances, setAllowances] = useState('');
    const [overtime, setOvertime] = useState('');
    const [bonuses, setBonuses] = useState('');
    const [payslipNumber, setPayslipNumber] = useState(1);
    const [email, setEmail] = useState('');
    const [phoneNo, setPhoneNo] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        
        const lastPayslipNumber = localStorage.getItem('lastPayslipNumber');
        if (lastPayslipNumber) {
            setPayslipNumber(parseInt(lastPayslipNumber)); 
        } else {
            fetchPayslipNumber();
        }
    }, []);

    const fetchPayslipNumber = async () => {
        try {
            const response = await fetch('http://localhost:5000/next-payslip-number');
            const data = await response.json();
            setPayslipNumber(data.payslipNumber);
            localStorage.setItem('lastPayslipNumber', data.payslipNumber); 
        } catch (error) {
            console.error('Error fetching payslip number:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

       
        const payslipData = {
            employeeId,
            employeeName,
            email,
            phoneNo,
            basicPay,
            allowances,
            overtime,
            bonuses,
            payslipNumber,
        };

       
        navigate('/payslip', { state: { payslipData } });

    
        const newPayslipNumber = payslipNumber + 1;

        setPayslipNumber(newPayslipNumber); 
        localStorage.setItem('lastPayslipNumber', newPayslipNumber); 
    };

    const resetForm = () => {
        setEmployeeId('');
        setEmployeeName('');
        setEmail('');
        setBasicPay('');
        setAllowances('');
        setOvertime('');
        setBonuses('');
    };

    const ViewPayslip = () => {
        navigate('./viewPayslip');
    };

    return (
        <div className='container'>
            <h1>Payslip Generator</h1>
            <form onSubmit={handleSubmit}>
                <div className="form-row">
                    <div className="form-group">
                        <label>Employee Name <span className="required">*</span></label>
                        <input
                            type="text"
                            value={employeeName}
                            onChange={(e) => setEmployeeName(e.target.value)}
                            placeholder="Enter your name"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Employee ID <span className="required">*</span></label>
                        <input
                            type="text"
                            value={employeeId}
                            onChange={(e) => setEmployeeId(e.target.value)}
                            placeholder="Enter your id"
                            required
                        />
                    </div>
                </div>
                <div className="form-row">
                    <div className="form-group">
                        <label>Email <span className="required">*</span></label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Phone No <span className="required">*</span></label>
                        <input
                            type="tel"
                            value={phoneNo}
                            onChange={(e) => setPhoneNo(e.target.value)}
                            placeholder="Enter your phone number"
                            required
                        />
                    </div>
                </div>
                <div className="form-row">
                    <div className="form-group">
                        <label>Allowances <span className="required">*</span></label>
                        <input
                            type="number"
                            value={allowances}
                            onChange={(e) => setAllowances(e.target.value)}
                            placeholder="e.g., 5000"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Basic Pay <span className="required">*</span></label>
                        <input
                            type="number"
                            value={basicPay}
                            onChange={(e) => setBasicPay(e.target.value)}
                            placeholder="e.g., 30000"
                            required
                        />
                    </div>
                </div>
                <div className="form-row">
                    <div className="form-group">
                        <label>Overtime <span className="required">*</span></label>
                        <input
                            type="number"
                            value={overtime}
                            onChange={(e) => setOvertime(e.target.value)}
                            placeholder="e.g., 2000"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Bonuses <span className="required">*</span></label>
                        <input
                            type="number"
                            value={bonuses}
                            onChange={(e) => setBonuses(e.target.value)}
                            placeholder="e.g., 1000"
                            required
                        />
                    </div>
                </div>
                <div className="buttons">
                    <button type="submit" className="button">Submit</button>
                    <button type="button" className="button" onClick={resetForm}>Reset</button>
                    <button type='button' onClick={ViewPayslip}>View Your Payslip</button>
                </div>
            </form>
        </div>
    );
};

export default PayslipForm;
