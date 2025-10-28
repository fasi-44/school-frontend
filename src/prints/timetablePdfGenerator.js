import pdfMake from 'pdfmake/build/pdfmake';
import {
    getReportHeader,
    getReportFooter,
    getSignatureSection,
    commonPdfStyles,
    formatDate,
    loadPdfFonts
} from './HeaderAndFooterComponent';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const generateTimetablePdf = async (timetableData, schoolData, action = 'download') => {
    await loadPdfFonts();

    const {
        class_name,
        section_name,
        academic_year,
        semester,
        configuration,
        time_slots,
        entries,
        is_draft
    } = timetableData;

    // Build the timetable title and subtitle
    const title = is_draft ? 'CLASS TIMETABLE (DRAFT)' : 'CLASS TIMETABLE';
    const subtitle = `Class: ${class_name} - ${section_name} | Academic Year: ${academic_year} | Semester: ${semester}`;

    // Build timetable info section
    const infoSection = {
        style: 'section',
        table: {
            widths: ['*', '*', '*', '*'],
            body: [
                [
                    { text: 'Configuration Details', style: 'sectionTitle', colSpan: 4, alignment: 'left' },
                    {},
                    {},
                    {}
                ],
                [
                    { text: 'Period Duration', bold: true, fillColor: '#f5f5f5' },
                    { text: `${configuration.period_duration} minutes` },
                    { text: 'Total Periods', bold: true, fillColor: '#f5f5f5' },
                    { text: configuration.total_periods }
                ],
                [
                    { text: 'School Start Time', bold: true, fillColor: '#f5f5f5' },
                    { text: configuration.school_start_time },
                    { text: 'Lunch Start Time', bold: true, fillColor: '#f5f5f5' },
                    { text: configuration.lunch_start_time }
                ],
                [
                    { text: 'Lunch Duration', bold: true, fillColor: '#f5f5f5' },
                    { text: `${configuration.lunch_duration} minutes`, colSpan: 3 },
                    {},
                    {}
                ]
            ]
        },
        layout: {
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
            hLineColor: () => '#e0e0e0',
            vLineColor: () => '#e0e0e0'
        },
        margin: [0, 0, 0, 15]
    };

    // Build timetable grid header
    const tableHeader = [
        {
            text: 'Time / Day',
            style: 'tableHeader',
            alignment: 'center',
            fillColor: '#667eea',
            color: '#ffffff',
            bold: true
        }
    ];

    daysOfWeek.forEach(day => {
        tableHeader.push({
            text: day,
            style: 'tableHeader',
            alignment: 'center',
            fillColor: '#667eea',
            color: '#ffffff',
            bold: true
        });
    });

    // Build timetable grid rows
    const tableBody = [tableHeader];

    time_slots.forEach(slot => {
        const row = [
            {
                stack: [
                    { text: slot.label, fontSize: 10, bold: true },
                    { text: slot.time_display, fontSize: 8, color: '#666666', margin: [0, 2, 0, 0] }
                ],
                fillColor: '#f5f5f5',
                margin: [5, 5, 5, 5]
            }
        ];

        daysOfWeek.forEach(day => {
            if (slot.is_lunch) {
                row.push({
                    text: 'LUNCH BREAK',
                    alignment: 'center',
                    fontSize: 10,
                    bold: true,
                    color: '#1976d2',
                    fillColor: '#e3f2fd',
                    margin: [5, 15, 5, 15]
                });
            } else {
                const key = `${day}-${slot.time_display}`;
                const entry = entries[key];

                if (entry) {
                    row.push({
                        stack: [
                            {
                                text: [
                                    {
                                        text: entry.subject.subject_name,
                                        fontSize: 10,
                                        bold: true,
                                        color: '#667eea'
                                    },
                                    {
                                        text: ` (${entry.subject.subject_code})`,
                                        fontSize: 8,
                                        color: '#666666'
                                    }
                                ],
                                margin: [0, 0, 0, 3]
                            },
                            {
                                text: [
                                    {
                                        text: `${entry.teacher.first_name} ${entry.teacher.last_name}`,
                                        fontSize: 9
                                    },
                                    entry.room ? {
                                        text: ` • Room: ${entry.room}`,
                                        fontSize: 7,
                                        color: '#666666',
                                        italics: true
                                    } : {}
                                ],
                                margin: [0, 0, 0, 0]
                            }
                        ],
                        margin: [3, 3, 3, 3],
                        alignment: 'left'
                    });
                } else {
                    row.push({
                        text: '-',
                        alignment: 'center',
                        color: '#cccccc',
                        fontSize: 10,
                        margin: [5, 15, 5, 15]
                    });
                }
            }
        });

        tableBody.push(row);
    });

    // Build the timetable table
    const timetableTable = {
        style: 'section',
        table: {
            headerRows: 1,
            widths: [70, ...Array(daysOfWeek.length).fill('*')],
            body: tableBody
        },
        layout: {
            hLineWidth: (i, node) => (i === 0 || i === 1 || i === node.table.body.length) ? 1 : 0.5,
            vLineWidth: () => 0.5,
            hLineColor: (i) => (i === 0 || i === 1) ? '#667eea' : '#e0e0e0',
            vLineColor: () => '#e0e0e0'
        },
        margin: [0, 0, 0, 15]
    };

    // Notes section
    const notesSection = {
        text: [
            { text: 'Note: ', bold: true, fontSize: 9 },
            { text: 'This timetable is subject to change. Students are requested to check for updates regularly.', fontSize: 8, italics: true, color: '#666666' }
        ],
        margin: [0, 10, 0, 0]
    };

    // Build complete content
    const content = [
        infoSection,
        timetableTable,
        notesSection,
        getSignatureSection([
            { label: 'Class Teacher', position: 'left' },
            { label: 'Academic Coordinator', position: 'center' },
            { label: 'Principal', position: 'right' }
        ])
    ];

    // Document definition
    const docDefinition = {
        pageSize: 'A4',
        pageOrientation: 'landscape',
        pageMargins: [30, 140, 30, 50],
        header: (currentPage, pageCount) => {
            if (currentPage === 1) {
                return getReportHeader(schoolData, title, subtitle, 'landscape');
            }
            return {
                stack: [
                    {
                        text: title,
                        alignment: 'center',
                        fontSize: 11,
                        bold: true,
                        color: '#667eea',
                        margin: [0, 15, 0, 2]
                    },
                    {
                        text: subtitle,
                        alignment: 'center',
                        fontSize: 9,
                        color: '#666666',
                        margin: [0, 0, 0, 10]
                    }
                ]
            };
        },
        footer: (currentPage, pageCount) => {
            return getReportFooter(currentPage, pageCount, schoolData?.generatedBy);
        },
        content: content,
        styles: {
            ...commonPdfStyles,
            // Add any timetable-specific styles here
        },
        defaultStyle: {
            fontSize: 10,
            color: '#333333'
        }
    };

    // Generate PDF based on action
    if (action === 'print') {
        pdfMake.createPdf(docDefinition).print();
    } else if (action === 'download') {
        const filename = `Timetable_${class_name}_${section_name}_${academic_year}_Sem${semester}.pdf`;
        pdfMake.createPdf(docDefinition).download(filename);
    } else {
        pdfMake.createPdf(docDefinition).open();
    }
};
