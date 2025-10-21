// utils/receiptGenerator.js

import pdfMake from 'pdfmake/build/pdfmake';

// ✅ Don't import fonts at top level - load them inside the function
let fontsLoaded = false;

const loadFonts = async () => {
    if (fontsLoaded) return;

    try {
        // Dynamic import of fonts
        const pdfFontsModule = await import('pdfmake/build/vfs_fonts');

        // Handle different module structures
        if (pdfFontsModule.default && pdfFontsModule.default.pdfMake) {
            pdfMake.vfs = pdfFontsModule.default.pdfMake.vfs;
        } else if (pdfFontsModule.pdfMake) {
            pdfMake.vfs = pdfFontsModule.pdfMake.vfs;
        } else if (pdfFontsModule.default) {
            pdfMake.vfs = pdfFontsModule.default;
        } else {
            pdfMake.vfs = pdfFontsModule;
        }

        fontsLoaded = true;
    } catch (error) {
        console.warn('Could not load pdfmake fonts:', error);
    }
};

/**
 * Generate Fee Receipt PDF
 */
export const generateFeeReceipt = async (receiptData, schoolData, action = 'download') => {
    // Load fonts first
    await loadFonts();

    const {
        receiptNumber,
        studentName,
        studentRoll,
        class: studentClass,
        section,
        fatherName,
        phone,
        paymentDate,
        feeName,
        feeType,
        totalAmount,
        paidAmount,
        previousPaid,
        balance,
        paymentMode,
        transactionId,
        chequeNumber,
        bankName,
        remarks,
        collectedBy,
        academicYear,
        installmentInfo,
        allFees,
        totalFeeAmount,
        totalPaidOverall,
        totalBalanceOverall,
        totalDiscount,
        totalLateFee,
        installments,
        currentInstallmentIdd
    } = receiptData;

    const {
        schoolName,
        schoolAddress,
        schoolPhone,
        schoolEmail,
        schoolLogo,
        companyWebsite
    } = schoolData;

    // Format date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    // Format currency
    const formatCurrency = (amount) => {
        return `₹${parseFloat(amount || 0).toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
    };

    // Convert number to words (Indian format)
    const numberToWords = (num) => {
        const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
        const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
        const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

        const convertLessThanThousand = (n) => {
            if (n === 0) return '';
            if (n < 10) return ones[n];
            if (n < 20) return teens[n - 10];
            if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
            return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + convertLessThanThousand(n % 100) : '');
        };

        if (num === 0) return 'Zero';

        const crore = Math.floor(num / 10000000);
        const lakh = Math.floor((num % 10000000) / 100000);
        const thousand = Math.floor((num % 100000) / 1000);
        const remainder = num % 1000;

        let result = '';
        if (crore) result += convertLessThanThousand(crore) + ' Crore ';
        if (lakh) result += convertLessThanThousand(lakh) + ' Lakh ';
        if (thousand) result += convertLessThanThousand(thousand) + ' Thousand ';
        if (remainder) result += convertLessThanThousand(remainder);

        return result.trim();
    };

    const amountInWords = numberToWords(Math.floor(paidAmount));
    const paise = Math.round((paidAmount - Math.floor(paidAmount)) * 100);
    const fullAmountInWords = `${amountInWords} Rupees${paise > 0 ? ` and ${numberToWords(paise)} Paise` : ''} Only`;

    // Define PDF document
    const docDefinition = {
        pageSize: 'A5',
        pageOrientation: 'portrait',
        pageMargins: [20, 20, 20, 40],

        header: function (currentPage, pageCount) {
            return {
                margin: [20, 10],
                columns: [
                    { text: '', width: '*' },
                    {
                        text: `Page ${currentPage} of ${pageCount}`,
                        alignment: 'right',
                        fontSize: 8,
                        color: '#888888'
                    }
                ]
            };
        },

        footer: function (currentPage, pageCount) {
            return {
                margin: [20, 0],
                stack: [
                    { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 395, y2: 0, lineWidth: 1, lineColor: '#e0e0e0' }] },
                    {
                        margin: [0, 5, 0, 0],
                        columns: [
                            {
                                text: 'This is a computer-generated receipt',
                                fontSize: 8,
                                color: '#888888',
                                italics: true
                            },
                            {
                                text: companyWebsite || '',
                                fontSize: 8,
                                color: '#888888',
                                alignment: 'right'
                            }
                        ]
                    }
                ]
            };
        },

        content: [
            // School Header
            {
                columns: [
                    schoolLogo ? {
                        image: schoolLogo,
                        width: 50,
                        height: 50
                    } : { text: '', width: 50 },
                    {
                        stack: [
                            {
                                text: schoolName?.toUpperCase() || 'SCHOOL NAME',
                                style: 'schoolName',
                                alignment: 'center'
                            },
                            {
                                text: schoolAddress || 'School Address',
                                style: 'schoolAddress',
                                alignment: 'center'
                            },
                            {
                                text: `Phone: ${schoolPhone || 'N/A'} | Email: ${schoolEmail || 'N/A'}`,
                                style: 'schoolContact',
                                alignment: 'center'
                            }
                        ],
                        width: '*'
                    },
                    { text: '', width: 50 }
                ],
                margin: [0, 0, 0, 10]
            },

            // Receipt Title
            {
                canvas: [
                    { type: 'line', x1: 0, y1: 0, x2: 395, y2: 0, lineWidth: 2, lineColor: '#667eea' }
                ]
            },
            {
                text: 'FEE RECEIPT',
                style: 'receiptTitle',
                margin: [0, 10, 0, 5]
            },
            {
                columns: [
                    { text: `Receipt No: ${receiptNumber}`, style: 'receiptInfo', width: '*' },
                    { text: `Date: ${formatDate(paymentDate)}`, style: 'receiptInfo', alignment: 'right' }
                ],
                margin: [0, 0, 0, 15]
            },

            // Student Information
            {
                style: 'section',
                table: {
                    widths: [100, '*', 100, '*'],
                    body: [
                        [
                            { text: 'Student Name:', style: 'label' },
                            { text: studentName || 'N/A', style: 'value', bold: true },
                            { text: 'Roll No:', style: 'label' },
                            { text: studentRoll || 'N/A', style: 'value' }
                        ],
                        [
                            { text: 'Class:', style: 'label' },
                            { text: `${studentClass} - ${section}`, style: 'value' },
                            { text: 'Academic Year:', style: 'label' },
                            { text: academicYear, style: 'value' }
                        ],
                        [
                            { text: 'Father\'s Name:', style: 'label' },
                            { text: fatherName || 'N/A', style: 'value' },
                            { text: 'Contact:', style: 'label' },
                            { text: phone || 'N/A', style: 'value' }
                        ]
                    ]
                },
                layout: {
                    hLineWidth: () => 0.5,
                    vLineWidth: () => 0.5,
                    hLineColor: () => '#e0e0e0',
                    vLineColor: () => '#e0e0e0'
                }
            },

            // Fee Details
            {
                text: 'FEE DETAILS',
                style: 'sectionTitle',
                margin: [0, 15, 0, 10]
            },
            {
                style: 'section',
                table: {
                    widths: ['*', 100],
                    body: [
                        [
                            { text: 'Particulars', style: 'tableHeader', fillColor: '#f5f5f5' },
                            { text: 'Amount', style: 'tableHeader', alignment: 'right', fillColor: '#f5f5f5' }
                        ],
                        [
                            {
                                stack: [
                                    { text: feeName || 'Fee', bold: true },
                                    { text: feeType || '', fontSize: 9, color: '#666666' },
                                    ...(installmentInfo ? [{
                                        text: `Installment ${installmentInfo.installmentNumber} of ${installmentInfo.totalInstallments} - ${installmentInfo.installmentName}`,
                                        fontSize: 8,
                                        color: '#667eea',
                                        margin: [0, 3, 0, 0]
                                    }] : [])
                                ]
                            },
                            { text: formatCurrency(totalAmount), style: 'amount' }
                        ],
                        [
                            { text: 'Previous Payment', style: 'label' },
                            { text: formatCurrency(previousPaid), style: 'amount', color: '#4caf50' }
                        ],
                        [
                            { text: 'Current Payment', style: 'label', bold: true },
                            { text: formatCurrency(paidAmount), style: 'amount', bold: true, fontSize: 12 }
                        ],
                        [
                            { text: 'Balance Due', style: 'label' },
                            { text: formatCurrency(balance), style: 'amount', color: balance > 0 ? '#f44336' : '#4caf50' }
                        ]
                    ]
                },
                layout: {
                    hLineWidth: (i) => i === 0 || i === 1 ? 1 : 0.5,
                    vLineWidth: () => 0.5,
                    hLineColor: (i) => i === 0 || i === 1 ? '#667eea' : '#e0e0e0',
                    vLineColor: () => '#e0e0e0'
                }
            },

            // Amount in Words
            {
                text: [
                    { text: 'Amount in Words: ', style: 'label' },
                    { text: fullAmountInWords, style: 'value', bold: true }
                ],
                margin: [0, 10, 0, 0]
            },

            // Payment Details
            {
                text: 'PAYMENT DETAILS',
                style: 'sectionTitle',
                margin: [0, 15, 0, 10]
            },
            {
                style: 'section',
                table: {
                    widths: [100, '*'],
                    body: [
                        [
                            { text: 'Payment Mode:', style: 'label' },
                            { text: paymentMode || 'CASH', style: 'value', bold: true }
                        ],
                        ...(transactionId ? [[
                            { text: 'Transaction ID:', style: 'label' },
                            { text: transactionId, style: 'value' }
                        ]] : []),
                        ...(chequeNumber ? [[
                            { text: 'Cheque No:', style: 'label' },
                            { text: chequeNumber, style: 'value' }
                        ]] : []),
                        ...(bankName ? [[
                            { text: 'Bank Name:', style: 'label' },
                            { text: bankName, style: 'value' }
                        ]] : []),
                        ...(remarks ? [[
                            { text: 'Remarks:', style: 'label' },
                            { text: remarks, style: 'value', italics: true }
                        ]] : [])
                    ]
                },
                layout: 'noBorders'
            },

            // Overall Fee Summary
            {
                text: 'FEE SUMMARY',
                style: 'sectionTitle',
                margin: [0, 15, 0, 10]
            },
            {
                style: 'section',
                table: {
                    widths: ['*', 80, 80, 80],
                    body: [
                        [
                            { text: 'Fee Type', style: 'tableHeader', fillColor: '#f5f5f5' },
                            { text: 'Total', style: 'tableHeader', alignment: 'right', fillColor: '#f5f5f5' },
                            { text: 'Paid', style: 'tableHeader', alignment: 'right', fillColor: '#f5f5f5' },
                            { text: 'Balance', style: 'tableHeader', alignment: 'right', fillColor: '#f5f5f5' }
                        ],
                        // Map through all fees
                        ...(allFees || []).map(fee => [
                            {
                                stack: [
                                    { text: fee.fee_structure.fee_name, bold: true },
                                    { text: fee.fee_structure.fee_type, fontSize: 8, color: '#666666' }
                                ]
                            },
                            { text: formatCurrency(fee.total_amount), style: 'amount' },
                            { text: formatCurrency(fee.paid_amount), style: 'amount', color: '#4caf50' },
                            { text: formatCurrency(fee.balance_amount), style: 'amount', color: fee.balance_amount > 0 ? '#f44336' : '#4caf50' }
                        ]),
                        // Totals row
                        [
                            { text: 'TOTAL', bold: true, fontSize: 11 },
                            { text: formatCurrency(totalFeeAmount), bold: true, fontSize: 11, alignment: 'right' },
                            { text: formatCurrency(totalPaidOverall), bold: true, fontSize: 11, alignment: 'right', color: '#4caf50' },
                            { text: formatCurrency(totalBalanceOverall), bold: true, fontSize: 11, alignment: 'right', color: totalBalanceOverall > 0 ? '#f44336' : '#4caf50' }
                        ]
                    ]
                },
                layout: {
                    hLineWidth: (i, node) => (i === 0 || i === 1 || i === node.table.body.length - 1) ? 1 : 0.5,
                    vLineWidth: () => 0.5,
                    hLineColor: (i, node) => (i === 0 || i === 1 || i === node.table.body.length - 1) ? '#667eea' : '#e0e0e0',
                    vLineColor: () => '#e0e0e0',
                    fillColor: (i, node) => (i === node.table.body.length - 1) ? '#f0f0f0' : null
                }
            },

            // Installment Details (conditional)
            ...(installments && installments.length > 0 ? [
                {
                    text: 'INSTALLMENT DETAILS',
                    style: 'sectionTitle',
                    margin: [0, 15, 0, 10],
                    pageBreak: 'before' // Add page break if receipt is getting too long
                },
                {
                    style: 'section',
                    table: {
                        widths: [30, '*', 80, 70, 70, 70],
                        body: [
                            [
                                { text: '#', style: 'tableHeader', fillColor: '#f5f5f5' },
                                { text: 'Term', style: 'tableHeader', fillColor: '#f5f5f5' },
                                { text: 'Due Date', style: 'tableHeader', alignment: 'center', fillColor: '#f5f5f5' },
                                { text: 'Amount', style: 'tableHeader', alignment: 'right', fillColor: '#f5f5f5' },
                                { text: 'Paid', style: 'tableHeader', alignment: 'right', fillColor: '#f5f5f5' },
                                { text: 'Balance', style: 'tableHeader', alignment: 'right', fillColor: '#f5f5f5' }
                            ],
                            ...installments.map((inst, index) => [
                                {
                                    text: inst.installment_number,
                                    alignment: 'center',
                                    fillColor: inst.id === currentInstallmentId ? '#e3f2fd' : null
                                },
                                {
                                    stack: [
                                        { text: inst.installment_name, bold: true },
                                        {
                                            text: inst.status,
                                            fontSize: 8,
                                            color: inst.status === 'PAID' ? '#4caf50' : inst.status === 'PARTIAL' ? '#ff9800' : '#666666',
                                            bold: inst.id === currentInstallmentId
                                        }
                                    ],
                                    fillColor: inst.id === currentInstallmentId ? '#e3f2fd' : null
                                },
                                {
                                    text: formatDate(inst.due_date),
                                    fontSize: 9,
                                    alignment: 'center',
                                    fillColor: inst.id === currentInstallmentId ? '#e3f2fd' : null
                                },
                                {
                                    text: formatCurrency(inst.amount),
                                    style: 'amount',
                                    fillColor: inst.id === currentInstallmentId ? '#e3f2fd' : null
                                },
                                {
                                    text: formatCurrency(inst.paid_amount),
                                    style: 'amount',
                                    color: '#4caf50',
                                    fillColor: inst.id === currentInstallmentId ? '#e3f2fd' : null
                                },
                                {
                                    text: formatCurrency(inst.balance_amount),
                                    style: 'amount',
                                    color: inst.balance_amount > 0 ? '#f44336' : '#4caf50',
                                    fillColor: inst.id === currentInstallmentId ? '#e3f2fd' : null
                                }
                            ])
                        ]
                    },
                    layout: {
                        hLineWidth: (i) => i === 0 || i === 1 ? 1 : 0.5,
                        vLineWidth: () => 0.5,
                        hLineColor: (i) => i === 0 || i === 1 ? '#667eea' : '#e0e0e0',
                        vLineColor: () => '#e0e0e0'
                    }
                },
                {
                    text: '✓ Highlighted row indicates current payment',
                    fontSize: 8,
                    color: '#666666',
                    italics: true,
                    margin: [0, 5, 0, 0]
                }
            ] : []),


            // Signature Section
            {
                columns: [
                    {
                        stack: [
                            { text: '_____________________', margin: [0, 30, 0, 5] },
                            { text: 'Parent Signature', fontSize: 9, color: '#666666' }
                        ],
                        width: '*'
                    },
                    {
                        stack: [
                            { text: '_____________________', margin: [0, 30, 0, 5], alignment: 'right' },
                            { text: `Collected By: ${collectedBy || 'Staff'}`, fontSize: 9, color: '#666666', alignment: 'right' },
                            { text: 'Authorized Signature', fontSize: 9, color: '#666666', alignment: 'right', margin: [0, 3, 0, 0] }
                        ],
                        width: '*'
                    }
                ],
                margin: [0, 30, 0, 0]
            },

            // Thank You Note
            {
                text: 'Thank you for your payment!',
                style: 'thankYou',
                margin: [0, 20, 0, 0]
            }
        ],

        styles: {
            schoolName: {
                fontSize: 18,
                bold: true,
                color: '#667eea'
            },
            schoolAddress: {
                fontSize: 10,
                color: '#666666',
                margin: [0, 3, 0, 0]
            },
            schoolContact: {
                fontSize: 9,
                color: '#888888',
                margin: [0, 2, 0, 0]
            },
            receiptTitle: {
                fontSize: 16,
                bold: true,
                alignment: 'center',
                color: '#667eea'
            },
            receiptInfo: {
                fontSize: 10,
                color: '#666666'
            },
            sectionTitle: {
                fontSize: 12,
                bold: true,
                color: '#667eea',
                decoration: 'underline'
            },
            section: {
                fontSize: 10
            },
            label: {
                fontSize: 10,
                color: '#666666'
            },
            value: {
                fontSize: 10,
                color: '#000000'
            },
            tableHeader: {
                fontSize: 10,
                bold: true,
                color: '#000000'
            },
            amount: {
                fontSize: 11,
                alignment: 'right'
            },
            thankYou: {
                fontSize: 11,
                italics: true,
                alignment: 'center',
                color: '#4caf50'
            }
        }
    };

    // Execute action
    if (action === 'download') {
        pdfMake.createPdf(docDefinition).download(`Receipt_${receiptNumber}.pdf`);
    } else if (action === 'print') {
        pdfMake.createPdf(docDefinition).print();
    } else if (action === 'open') {
        pdfMake.createPdf(docDefinition).open();
    }
};

/**
 * Helper function to generate receipt from payment response
 */
export const generateReceiptFromPayment = async (
    paymentData,
    studentData,
    schoolData,
    feesSummary,    // Add this parameter
    installments,   // Add this parameter
    action = 'download'
) => {
    const receiptData = {
        // Existing fields
        receiptNumber: paymentData.receipt_number,
        studentName: studentData.name,
        studentRoll: studentData.roll_no,
        class: studentData.class,
        section: studentData.section,
        fatherName: studentData.father_name,
        phone: studentData.phone,
        paymentDate: paymentData.created_at,
        feeName: paymentData.fee_name,
        feeType: paymentData.fee_type,
        totalAmount: paymentData.total_amount,
        paidAmount: paymentData.paid_amount,
        previousPaid: paymentData.previous_paid,
        balance: paymentData.balance,
        paymentMode: paymentData.payment_mode,
        transactionId: paymentData.transaction_id,
        chequeNumber: paymentData.cheque_number,
        bankName: paymentData.bank_name,
        remarks: paymentData.remarks,
        collectedBy: paymentData.collected_by_name,
        academicYear: paymentData.academic_year,
        installmentInfo: paymentData.installment_info,

        // New comprehensive fields
        allFees: feesSummary?.fees || [],
        totalFeeAmount: feesSummary?.total_amount || 0,
        totalPaidOverall: feesSummary?.total_paid || 0,
        totalBalanceOverall: feesSummary?.balance || 0,
        totalDiscount: feesSummary?.total_discount || 0,
        totalLateFee: feesSummary?.total_late_fee || 0,
        installments: installments || [],
        currentInstallmentId: paymentData.installment_id
    };

    await generateFeeReceipt(receiptData, schoolData, action);
};
