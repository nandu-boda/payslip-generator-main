import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, WidthType, AlignmentType, TabStopType } from "docx";
import './payslip.css';
import { saveAs } from "file-saver";

const Payslip = () => {
    const location = useLocation();
    const { payslipData } = location.state || {};
    const [payslipNumber, setPayslipNumber] = useState('');

    useEffect(() => {
        const fetchPayslipNumber = async () => {
            try {
                
                const storedPayslipNumber = localStorage.getItem("payslipNumber");
    
                if (storedPayslipNumber) {
                    setPayslipNumber(storedPayslipNumber); 
                } else {
                   
                    const response = await fetch("http://localhost:5000/next-payslip-number");
                    const result = await response.json();
                    
                    setPayslipNumber(result.payslipNumber);
                    localStorage.setItem("payslipNumber", result.payslipNumber);
                }
            } catch (error) {
                console.error("Error fetching payslip number:", error);
            }
        };
    
        fetchPayslipNumber();
    }, []);
    

    if (!payslipData) {
        return <div>No payslip data available.</div>;
    }

    const generatePDF = async () => {
        if (!payslipNumber) {
            console.error('Payslip number is not available.');
            return;
        }
    
        const input = document.getElementById('payslip');
    
        try {
            const canvas = await html2canvas(input, { scale: 1.2, backgroundColor: null });
            const imgData = canvas.toDataURL('image/png');
    
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgWidth = 200;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            const position = 0;
    
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            const pdfBlob = pdf.output('blob');
            const pdfFileName = `payslip_${payslipNumber}.pdf`;
    
            const pdfFile = new File([pdfBlob], pdfFileName, { type: 'application/pdf' });
            const formData = new FormData();
            formData.append('file', pdfFile);
    
            await fetch('http://localhost:5000/upload', {
                method: 'POST',
                body: formData,
            });
    
            saveAs(pdfBlob, pdfFileName);
            localStorage.removeItem("payslipNumber"); // Clears number after save
            console.log("PDF successfully uploaded and saved:", pdfFileName);
            
        } catch (error) {
            console.error('Error generating PDF:', error);
        }
    };

    
    
        const generateWord = async () => {
            if (!payslipNumber) {
                console.error('Payslip number is not available.');
                return;
            }
        
            try {
                const doc = new Document({
                    sections: [
                        {
                        properties: {},
                        children: [
                            // Payslip Header (Now with Title & Number on Separate Lines)
                            new Paragraph({
                                alignment: AlignmentType.LEFT,
                                spacing: { after: 50 },
                                children: [new TextRun({ text: "Payslip", bold: true, size: 32, color: "424242" })],
                            }),
                            new Paragraph({
                                alignment: AlignmentType.LEFT,
                                spacing: { after: 100 },
                                children: [new TextRun({ text: `No: #${payslipNumber}`, size: 24, color: "777777" })],
                            }),

                            new Paragraph(""), // Blank line

                            // Employee Name (Left) and Date (Right)
                            new Paragraph({
                                tabStops: [{ position: 9000, type: TabStopType.RIGHT }], // Pushes Date to the Right
                                spacing: { after: 20 },
                                children: [
                                    new TextRun({ text: "Employee Name: ", bold: true , size: 24 }),
                                    new TextRun({ text: payslipData.employeeName , size: 24 }), 
                                    new TextRun({ text: "\tDate: ", bold: true,size: 24 }),
                                    new TextRun({ text: new Date().toLocaleDateString(),size: 24 }), 
                                ],
                            }),

                            // Employee ID (Below Employee Name)
                            new Paragraph({
                                alignment: AlignmentType.LEFT,
                                spacing: { after: 50 },
                                children: [ new TextRun({ text: "Employee ID: ", bold: true ,size: 24 }), // Bold label
                                new TextRun({ text: payslipData.employeeId,size: 24 }) ]// Employee ID without bold
                            }),

                            new Paragraph(""), // Blank line
                            // Salary Details Table (Improved Styling)
                            new Paragraph({
                                spacing: { after: 100 },
                                children: [new TextRun({ text: "Salary Details", bold: true, size: 24, color: "424242" })],
                            }),
                            new Table({
                                width: { size: 100, type: WidthType.PERCENTAGE }, // Full Page Width
                                rows: [
                                    new TableRow({
                                        children: [
                                            new TableCell({
                                                width: { size: 70, type: WidthType.PERCENTAGE },
                                                margins: { top: 200, bottom: 200, left: 200, right: 200 }, // Padding for Cells
                                                children: [new Paragraph({ children: [new TextRun({ text: "Description", bold: true, size: 22 })] })],
                                                shading: { fill: "f9f9f9" },
                                            }),
                                            new TableCell({
                                                width: { size: 30, type: WidthType.PERCENTAGE },
                                                margins: { top: 200, bottom: 200, left: 200, right: 200 }, // Padding for Cells
                                                children: [new Paragraph({ children: [new TextRun({ text: "Amount", bold: true, size: 22 })] })],
                                                shading: { fill: "f9f9f9" },
                                            }),
                                        ],
                                    }),
                                    new TableRow({
                                        children: [
                                            new TableCell({
                                                margins: { top: 200, bottom: 200, left: 200, right: 200 },
                                                children: [new Paragraph({ children: [new TextRun({ text: "Basic Pay", size: 20 })] })],
                                            }),
                                            new TableCell({
                                                margins: { top: 200, bottom: 200, left: 200, right: 200 },
                                                children: [new Paragraph({ children: [new TextRun({ text: payslipData.basicPay, size: 20 })] })],
                                            }),
                                        ],
                                    }),
                                    new TableRow({
                                        children: [
                                            new TableCell({
                                                margins: { top: 200, bottom: 200, left: 200, right: 200 },
                                                children: [new Paragraph({ children: [new TextRun({ text: "Allowances", size: 20 })] })],
                                            }),
                                            new TableCell({
                                                margins: { top: 200, bottom: 200, left: 200, right: 200 },
                                                children: [new Paragraph({ children: [new TextRun({ text: payslipData.allowances, size: 20 })] })],
                                            }),
                                        ],
                                    }),
                                    new TableRow({
                                        children: [
                                            new TableCell({
                                                margins: { top: 200, bottom: 200, left: 200, right: 200 },
                                                children: [new Paragraph({ children: [new TextRun({ text: "Overtime", size: 20 })] })],
                                            }),
                                            new TableCell({
                                                margins: { top: 200, bottom: 200, left: 200, right: 200 },
                                                children: [new Paragraph({ children: [new TextRun({ text: payslipData.overtime, size: 20 })] })],
                                            }),
                                        ],
                                    }),
                                    new TableRow({
                                        children: [
                                            new TableCell({
                                                margins: { top: 200, bottom: 200, left: 200, right: 200 },
                                                children: [new Paragraph({ children: [new TextRun({ text: "Bonuses", size: 20 })] })],
                                            }),
                                            new TableCell({
                                                margins: { top: 200, bottom: 200, left: 200, right: 200 },
                                                children: [new Paragraph({ children: [new TextRun({ text: payslipData.bonuses, size: 20 })] })],
                                            }),
                                        ],
                                    }),
                                    new TableRow({
                                        children: [
                                            new TableCell({
                                                margins: { top: 200, bottom: 200, left: 200, right: 200 },
                                                children: [new Paragraph({ children: [new TextRun({ text: "Total", bold: true, size: 22 })] })],
                                            }),
                                            new TableCell({
                                                margins: { top: 200, bottom: 200, left: 200, right: 200 },
                                                children: [new Paragraph({
                                                    children: [new TextRun({
                                                        text: (parseFloat(payslipData.basicPay) + parseFloat(payslipData.allowances) + parseFloat(payslipData.overtime) + parseFloat(payslipData.bonuses)).toString(),
                                                        bold: true, size: 22, color: "333333"
                                                    })]
                                                })],
                                            }),
                                        ],
                                    }),
                                ],
                            }),


                        // Company Details Header
                        new Paragraph({
                            spacing: { after: 50 },
                            children: [new TextRun({ text: "Company Details", bold: true, size: 24, color: "424242" })],
                        }),

                        // Company Info (Left-Aligned)
                        new Paragraph({
                            alignment: AlignmentType.LEFT,
                            spacing: { after: 10 },
                            children: [new TextRun({ text: "Company Name", size: 24, color: "424242" })],
                        }),
                        new Paragraph({
                            alignment: AlignmentType.LEFT,
                            spacing: { after: 10 },
                            children: [new TextRun({ text: "Address Line 1", size: 24, color: "424242" })],
                        }),
                        new Paragraph({
                            alignment: AlignmentType.LEFT,
                            spacing: { after: 10 },
                            children: [new TextRun({ text: "Address Line 2",  size: 24, color: "424242" })],
                        }),

                        // Contact Information (Under Date) with Right Alignment using tab stop
                        new Paragraph({
                            alignment: AlignmentType.RIGHT,
                            tabStops: [{ position: 9000, type: TabStopType.RIGHT }], // Pushes Contact Info to the Right
                            spacing: { before: 50 },
                            children: [new TextRun({ text: "Contact Information", bold: true, size: 24, color: "424242" })],
                        }),
                        new Paragraph({
                            alignment: AlignmentType.RIGHT,
                            tabStops: [{ position: 9000, type: TabStopType.RIGHT }],
                            spacing: { after: 10 },
                            children: [
                                new TextRun({ text: `Email: ${payslipData.email}`, size: 24, color: "424242" }),
                            ],
                        }),
                        new Paragraph({
                            alignment: AlignmentType.RIGHT,
                            tabStops: [{ position: 9000, type: TabStopType.RIGHT }],
                            spacing: { after: 10 },
                            children: [
                                new TextRun({ text: `Phone: ${payslipData.phoneNo}`, size: 24, color: "424242" }),
                            ],
                        }),

                        new Paragraph(""), // Blank line
                    ],
                },
            ],
        });
        const blob = await Packer.toBlob(doc);
        const fileName = `payslip_${payslipNumber}.docx`;

        const formData = new FormData();
        formData.append('file', blob, fileName);

        await fetch('http://localhost:5000/upload', {
            method: 'POST',
            body: formData,
        });
        saveAs(blob, fileName);
        localStorage.removeItem("payslipNumber");
        console.log("Word file successfully saved:", fileName);
        
        
    } catch (error) {
        console.error("Error generating Word file:", error);
    }
};
    

    return (
        <div id="payslip" className="container-ps" style={{ height: '1000px' }}>
            <div className='head'>
                <h2>Payslip </h2>
                <p>No:#{payslipNumber}</p>
            </div>
            <div className="invoice-header">
                <div>
                    <p><strong>Employee Name:</strong> {payslipData.employeeName}</p>
                    <p><strong>Employee ID:</strong> {payslipData.employeeId}</p>
                </div>
                <div>
                    <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
                </div>
            </div>
            <div className="invoice-details">
                <p><strong>Basic Pay:</strong> {payslipData.basicPay}</p>
                <p><strong>Allowances:</strong> {payslipData.allowances}</p>
                <p><strong>Overtime:</strong> {payslipData.overtime}</p>
                <p><strong>Bonuses:</strong> {payslipData.bonuses}</p>
            </div>
            <table className="invoice-table">
                <thead>
                    <tr>
                        <th>Description</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Basic Pay</td>
                        <td>{payslipData.basicPay}</td>
                    </tr>
                    <tr>
                        <td>Allowances</td>
                        <td>{payslipData.allowances}</td>
                    </tr>
                    <tr>
                        <td>Overtime</td>
                        <td>{payslipData.overtime}</td>
                    </tr>
                    <tr>
                        <td>Bonuses</td>
                        <td>{payslipData.bonuses}</td>
                    </tr>
                </tbody>
            </table>
            <div className="invoice-total">
                <p>Total: {parseFloat(payslipData.basicPay) + parseFloat(payslipData.allowances) + parseFloat(payslipData.overtime) + parseFloat(payslipData.bonuses)}</p>
            </div>
            <div className="invoice-footer">
                <div>
                    <p><strong>Company Name</strong></p>
                    <p>Address Line 1</p>
                    <p>Address Line 2</p>
                </div>
                <div>
                    <p><strong>Contact Information</strong></p>
                    <p>Email: {payslipData.email}</p>
                    <p>Phone:{payslipData.phoneNo} </p>
                </div>
            </div>
            <div className="btns">
                <button id="pdf-button" className="button" onClick={generatePDF} data-html2canvas-ignore>Export to PDF</button>
                <button id="word-button" className="button" onClick={generateWord} data-html2canvas-ignore>Export to Word</button>
            </div>
        </div>
    );
}

export default Payslip;
