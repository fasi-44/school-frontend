import React, { useState, useEffect } from "react";
import {
    Box,
    Button,
    Typography,
    Paper,
    Grid,
    Stack,
    Alert,
    LinearProgress,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Stepper,
    Step,
    StepLabel,
    Card,
    CardContent,
    Divider
} from "@mui/material";
import {
    CloudUpload,
    Download,
    CheckCircle,
    Error,
    Info,
    Close,
    FileUpload,
    Preview,
    Send
} from "@mui/icons-material";
import { useDropzone } from "react-dropzone";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import customAxios from "../../../utils/axiosConfig";
import { STUDENTS_API_BASE_URL } from "../../../ApiConstants";
import Loader from "../../../ui-component/Loader";

const steps = ['Upload File', 'Preview Data', 'Import Students'];

const requiredFields = [
    { key: 'first_name', label: 'First Name', required: true },
    { key: 'last_name', label: 'Last Name', required: true },
    { key: 'email', label: 'Email', required: true },
    { key: 'phone', label: 'Phone', required: true },
    { key: 'gender', label: 'Gender', required: true },
    { key: 'class_name', label: 'Class Name', required: true },
    { key: 'section_name', label: 'Section Name', required: true },
    { key: 'date_of_birth', label: 'Date of Birth', required: false },
    { key: 'admission_date', label: 'Admission Date', required: false },
    { key: 'student_id', label: 'Roll Number', required: false },
    { key: 'address', label: 'Address', required: false },
    { key: 'parent_name', label: 'Parent Name', required: false },
    { key: 'parent_phone', label: 'Parent Phone', required: false },
    { key: 'parent_email', label: 'Parent Email', required: false }
];

export default function BulkStudentCreate({ navigate }) {
    const { loggedUser } = useSelector((state) => state.globalState || {});
    const [activeStep, setActiveStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [uploadedFile, setUploadedFile] = useState(null);
    const [studentsData, setStudentsData] = useState([]);
    const [validationErrors, setValidationErrors] = useState([]);
    const [importResults, setImportResults] = useState(null);
    const [previewDialog, setPreviewDialog] = useState(false);

    const onDrop = (acceptedFiles) => {
        const file = acceptedFiles[0];
        if (file) {
            setUploadedFile(file);
            processFile(file);
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
            'application/vnd.ms-excel': ['.xls'],
            'text/csv': ['.csv']
        },
        multiple: false
    });

    const processFile = async (file) => {
        setLoading(true);
        try {
            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data);
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);

            if (jsonData.length === 0) {
                throw new Error('The uploaded file is empty');
            }

            setStudentsData(jsonData);
            validateData(jsonData);
            setActiveStep(1);
            toast.success(`File processed successfully! Found ${jsonData.length} records.`);
        } catch (error) {
            console.error('Error processing file:', error);
            toast.error('Error processing file: ' + error.message);
            setUploadedFile(null);
        } finally {
            setLoading(false);
        }
    };

    const validateData = (data) => {
        const errors = [];
        const requiredFieldKeys = requiredFields.filter(f => f.required).map(f => f.key);

        data.forEach((row, index) => {
            const rowErrors = [];

            // Check required fields
            requiredFieldKeys.forEach(field => {
                if (!row[field] || row[field].toString().trim() === '') {
                    rowErrors.push(`Missing ${requiredFields.find(f => f.key === field)?.label}`);
                }
            });

            // Validate email format
            if (row.email && !/\S+@\S+\.\S+/.test(row.email)) {
                rowErrors.push('Invalid email format');
            }

            // Validate phone format
            if (row.phone && !/^\d{10}$/.test(row.phone.toString().replace(/\D/g, ''))) {
                rowErrors.push('Phone number must be 10 digits');
            }

            // Validate gender
            if (row.gender && !['Male', 'Female', 'Other'].includes(row.gender)) {
                rowErrors.push('Gender must be Male, Female, or Other');
            }

            if (rowErrors.length > 0) {
                errors.push({
                    row: index + 1,
                    errors: rowErrors,
                    data: row
                });
            }
        });

        setValidationErrors(errors);
    };

    const downloadTemplate = () => {
        const templateData = [{
            first_name: "John",
            last_name: "Doe",
            email: "john.doe@example.com",
            phone: "1234567890",
            gender: "Male",
            class_name: "Grade 1",
            section_name: "Section A",
            date_of_birth: "2010-01-15",
            admission_date: "2024-04-01",
            student_id: "STU001",
            address: "123 Main Street, City",
            parent_name: "Jane Doe",
            parent_phone: "0987654321",
            parent_email: "jane.doe@example.com"
        }];

        const worksheet = XLSX.utils.json_to_sheet(templateData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Students Template");
        XLSX.writeFile(workbook, "students_import_template.xlsx");
        toast.success("Template downloaded successfully!");
    };

    const handleImport = async () => {
        if (validationErrors.length > 0) {
            toast.error("Please fix validation errors before importing");
            return;
        }

        setLoading(true);
        try {
            const response = await customAxios.post(
                `${STUDENTS_API_BASE_URL}/bulk-create/${loggedUser?.skid}`,
                {
                    students: studentsData,
                    default_password: "Admin@123"
                }
            );

            if (response.data.code === 200) {
                setImportResults(response.data.data);
                setActiveStep(2);
                toast.success("Bulk import completed successfully!");
            } else {
                throw new Error(response.data.message || "Import failed");
            }
        } catch (error) {
            console.error("Import error:", error);
            toast.error("Import failed: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const resetProcess = () => {
        setActiveStep(0);
        setUploadedFile(null);
        setStudentsData([]);
        setValidationErrors([]);
        setImportResults(null);
    };

    const getStepContent = (stepIndex) => {
        switch (stepIndex) {
            case 0:
                return (
                    <Stack spacing={3}>
                        {/* Instructions */}
                        <Alert severity="info" sx={{ borderRadius: 2 }}>
                            <Typography variant="h5" gutterBottom>
                                Instructions for Bulk Student Import
                            </Typography>
                            <Typography variant="body2" paragraph>
                                To import students in bulk, please follow these guidelines:
                            </Typography>
                            <Box component="ul" sx={{ pl: 2, m: 0 }}>
                                <li>Use Excel (.xlsx, .xls) or CSV (.csv) format</li>
                                <li>The first row should contain column headers</li>
                                <li>Required fields must be filled for all students</li>
                                <li>Email addresses must be unique</li>
                                <li>Phone numbers should be 10 digits</li>
                                <li>Dates should be in YYYY-MM-DD format</li>
                            </Box>
                        </Alert>

                        {/* Required Fields */}
                        <Card sx={{ borderRadius: 2 }}>
                            <CardContent>
                                <Typography variant="h5" gutterBottom color="primary">
                                    Required Fields
                                </Typography>
                                <Grid container spacing={1}>
                                    {requiredFields.map((field) => (
                                        <Grid item key={field.key}>
                                            <Chip
                                                label={field.label}
                                                color={field.required ? "error" : "default"}
                                                variant={field.required ? "filled" : "outlined"}
                                                size="small"
                                            />
                                        </Grid>
                                    ))}
                                </Grid>
                                <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                                    Red chips are required fields, gray chips are optional
                                </Typography>
                            </CardContent>
                        </Card>

                        {/* Download Template */}
                        <Box sx={{ textAlign: 'center' }}>
                            <Button
                                variant="outlined"
                                startIcon={<Download />}
                                onClick={downloadTemplate}
                                size="large"
                                sx={{ mb: 3 }}
                            >
                                Download Sample Template
                            </Button>
                        </Box>

                        {/* File Upload */}
                        <Paper
                            {...getRootProps()}
                            sx={{
                                p: 4,
                                textAlign: 'center',
                                border: '2px dashed',
                                borderColor: isDragActive ? 'primary.main' : 'grey.300',
                                backgroundColor: isDragActive ? 'primary.50' : 'grey.50',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                borderRadius: 2,
                                '&:hover': {
                                    borderColor: 'primary.main',
                                    backgroundColor: 'primary.50'
                                }
                            }}
                        >
                            <input {...getInputProps()} />
                            <CloudUpload sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
                            <Typography variant="h6" gutterBottom>
                                {isDragActive ? 'Drop the file here' : 'Drag & drop file here, or click to select'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Supports Excel (.xlsx, .xls) and CSV (.csv) files
                            </Typography>
                            {uploadedFile && (
                                <Chip
                                    label={uploadedFile.name}
                                    color="success"
                                    sx={{ mt: 2 }}
                                />
                            )}
                        </Paper>
                    </Stack>
                );

            case 1:
                return (
                    <Stack spacing={3}>
                        {/* Summary */}
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={4}>
                                <Card sx={{ textAlign: 'center', borderRadius: 2 }}>
                                    <CardContent>
                                        <Typography variant="h4" color="primary">
                                            {studentsData.length}
                                        </Typography>
                                        <Typography variant="body2">Total Records</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <Card sx={{ textAlign: 'center', borderRadius: 2 }}>
                                    <CardContent>
                                        <Typography variant="h4" color="success.main">
                                            {studentsData.length - validationErrors.length}
                                        </Typography>
                                        <Typography variant="body2">Valid Records</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <Card sx={{ textAlign: 2, borderRadius: 2 }}>
                                    <CardContent>
                                        <Typography variant="h4" color="error.main">
                                            {validationErrors.length}
                                        </Typography>
                                        <Typography variant="body2">Errors Found</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>

                        {/* Validation Errors */}
                        {validationErrors.length > 0 && (
                            <Alert severity="error" sx={{ borderRadius: 2 }}>
                                <Typography variant="h6" gutterBottom>
                                    Validation Errors Found
                                </Typography>
                                <Typography variant="body2" paragraph>
                                    Please fix the following errors before proceeding:
                                </Typography>
                                <TableContainer component={Paper} sx={{ maxHeight: 300 }}>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Row</TableCell>
                                                <TableCell>Student Name</TableCell>
                                                <TableCell>Errors</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {validationErrors.map((error, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>{error.row}</TableCell>
                                                    <TableCell>
                                                        {error.data.first_name} {error.data.last_name}
                                                    </TableCell>
                                                    <TableCell>
                                                        {error.errors.map((err, i) => (
                                                            <Chip
                                                                key={i}
                                                                label={err}
                                                                color="error"
                                                                size="small"
                                                                sx={{ mr: 0.5, mb: 0.5 }}
                                                            />
                                                        ))}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Alert>
                        )}

                        {/* Data Preview */}
                        <Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6">Data Preview</Typography>
                                <Button
                                    variant="outlined"
                                    startIcon={<Preview />}
                                    onClick={() => setPreviewDialog(true)}
                                >
                                    View All Data
                                </Button>
                            </Box>

                            <TableContainer component={Paper} sx={{ maxHeight: 400, borderRadius: 2 }}>
                                <Table stickyHeader size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Name</TableCell>
                                            <TableCell>Email</TableCell>
                                            <TableCell>Phone</TableCell>
                                            <TableCell>Class</TableCell>
                                            <TableCell>Section</TableCell>
                                            <TableCell>Status</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {studentsData.slice(0, 5).map((student, index) => {
                                            const hasError = validationErrors.some(err => err.row === index + 1);
                                            return (
                                                <TableRow key={index} sx={{ backgroundColor: hasError ? 'error.50' : 'inherit' }}>
                                                    <TableCell>
                                                        {student.first_name} {student.last_name}
                                                    </TableCell>
                                                    <TableCell>{student.email}</TableCell>
                                                    <TableCell>{student.phone}</TableCell>
                                                    <TableCell>{student.class_name}</TableCell>
                                                    <TableCell>{student.section_name}</TableCell>
                                                    <TableCell>
                                                        {hasError ? (
                                                            <Chip label="Error" color="error" size="small" />
                                                        ) : (
                                                            <Chip label="Valid" color="success" size="small" />
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            {studentsData.length > 5 && (
                                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                    Showing first 5 records. Click "View All Data" to see complete list.
                                </Typography>
                            )}
                        </Box>
                    </Stack>
                );

            case 2:
                return (
                    <Stack spacing={3} alignItems="center">
                        <CheckCircle sx={{ fontSize: 80, color: 'success.main' }} />
                        <Typography variant="h4" color="success.main">
                            Import Completed!
                        </Typography>

                        {importResults && (
                            <Grid container spacing={2} sx={{ maxWidth: 600 }}>
                                <Grid item xs={4}>
                                    <Card sx={{ textAlign: 'center', borderRadius: 2 }}>
                                        <CardContent>
                                            <Typography variant="h3" color="success.main">
                                                {importResults.successful}
                                            </Typography>
                                            <Typography variant="body2">Successful</Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid item xs={4}>
                                    <Card sx={{ textAlign: 'center', borderRadius: 2 }}>
                                        <CardContent>
                                            <Typography variant="h3" color="error.main">
                                                {importResults.failed}
                                            </Typography>
                                            <Typography variant="body2">Failed</Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid item xs={4}>
                                    <Card sx={{ textAlign: 'center', borderRadius: 2 }}>
                                        <CardContent>
                                            <Typography variant="h3" color="primary.main">
                                                {importResults.total}
                                            </Typography>
                                            <Typography variant="body2">Total</Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            </Grid>
                        )}

                        <Stack direction="row" spacing={2}>
                            <Button
                                variant="contained"
                                onClick={() => navigate('/users/list')}
                                size="large"
                            >
                                View Students List
                            </Button>
                            <Button
                                variant="outlined"
                                onClick={resetProcess}
                                size="large"
                            >
                                Import More Students
                            </Button>
                        </Stack>
                    </Stack>
                );

            default:
                return null;
        }
    };

    return (
        <>
            <Loader loading={loading} />

            {/* Stepper */}
            <Stepper activeStep={activeStep} sx={{ mb: 4, mt: -1 }}>
                {steps.map((label) => (
                    <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                    </Step>
                ))}
            </Stepper>

            {/* Step Content */}
            <Box sx={{ minHeight: 400 }}>
                {getStepContent(activeStep)}
            </Box>

            {/* Navigation Buttons */}
            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                pt: 3,
                borderTop: 1,
                borderColor: 'divider',
                mt: 4
            }}>
                <Button
                    disabled={activeStep === 0}
                    onClick={() => setActiveStep(prev => prev - 1)}
                    variant="outlined"
                >
                    Back
                </Button>

                <Box>
                    {activeStep === 0 && uploadedFile && (
                        <Button
                            variant="contained"
                            onClick={() => setActiveStep(1)}
                            startIcon={<FileUpload />}
                        >
                            Continue
                        </Button>
                    )}

                    {activeStep === 1 && (
                        <Button
                            variant="contained"
                            onClick={handleImport}
                            disabled={validationErrors.length > 0}
                            startIcon={<Send />}
                        >
                            Import Students
                        </Button>
                    )}
                </Box>
            </Box>

            {/* Preview Dialog */}
            <Dialog
                open={previewDialog}
                onClose={() => setPreviewDialog(false)}
                maxWidth="lg"
                fullWidth
            >
                <DialogTitle>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        Complete Data Preview
                        <IconButton onClick={() => setPreviewDialog(false)}>
                            <Close />
                        </IconButton>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <TableContainer sx={{ maxHeight: 500 }}>
                        <Table stickyHeader size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Row</TableCell>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Email</TableCell>
                                    <TableCell>Phone</TableCell>
                                    <TableCell>Gender</TableCell>
                                    <TableCell>Class</TableCell>
                                    <TableCell>Section</TableCell>
                                    <TableCell>Status</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {studentsData.map((student, index) => {
                                    const hasError = validationErrors.some(err => err.row === index + 1);
                                    return (
                                        <TableRow key={index} sx={{ backgroundColor: hasError ? 'error.50' : 'inherit' }}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>
                                                {student.first_name} {student.last_name}
                                            </TableCell>
                                            <TableCell>{student.email}</TableCell>
                                            <TableCell>{student.phone}</TableCell>
                                            <TableCell>{student.gender}</TableCell>
                                            <TableCell>{student.class_name}</TableCell>
                                            <TableCell>{student.section_name}</TableCell>
                                            <TableCell>
                                                {hasError ? (
                                                    <Chip label="Error" color="error" size="small" />
                                                ) : (
                                                    <Chip label="Valid" color="success" size="small" />
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPreviewDialog(false)}>Close</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}