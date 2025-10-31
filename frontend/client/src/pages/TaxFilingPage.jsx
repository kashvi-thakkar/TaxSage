import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext.jsx';
import axios from 'axios'; // Import axios for Cloudinary upload
import { documentAPI, taxAPI } from '../services/apiService.js'; // Import your APIs
import { useData } from '../context/DataContext.jsx'; // Import useData

const TaxFilingPage = () => {
  const { user } = useContext(AuthContext);
  const { addTaxFiling } = useData(); // Get addTaxFiling
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [autoFillComplete, setAutoFillComplete] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Processing Form-16...');

  // This state holds all your form data
  const [filingData, setFilingData] = useState({
    personalInfo: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      pan: user?.pan || '',
      dateOfBirth: '',
      phone: '',
      email: user?.email || '',
      address: { street: '', city: '', state: '', pincode: '' }
    },
    income: {
      salary: { totalSalary: 0, allowances: 0 },
      otherSources: { interest: 0, dividend: 0, other: 0 }
    },
    deductions: {
      section80C: 0, section80D: 0, section80G: 0, section24: 0
    },
    taxPaid: {
      tds: 0
    },
    taxRegime: 'new',
  });

  const steps = [
    { number: 1, title: 'Upload', description: 'Upload Form-16' },
    { number: 2, title: 'Personal', description: 'Basic details' },
    { number: 3, title: 'Income', description: 'Salary & income' },
    { number: 4, title: 'Deductions', description: 'Tax savings' },
    { number: 5, title: 'Tax', description: 'Tax calculation' },
    { number: 6, title: 'Review', description: 'Final check' },
  ];

  // --- NEW FILE UPLOAD LOGIC ---
  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;
    
    setIsUploading(true);
    setAutoFillComplete(false);
    
    // We will process files one by one
    for (const file of files) {
      setLoadingMessage(`Uploading ${file.name}...`);
      try {
        // 1. Upload to Cloudinary
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET);

        const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/auto/upload`;
        
        const uploadResponse = await axios.post(cloudinaryUrl, formData);
        const documentUrl = uploadResponse.data.secure_url;

        // Add to our file list
        setUploadedFiles(prev => [...prev, {
            id: uploadResponse.data.public_id,
            name: file.name,
            url: documentUrl,
            size: file.size,
            status: 'uploaded'
        }]);

        // 2. Trigger Backend AI Extraction
        setLoadingMessage(`Extracting data from ${file.name}... (This may take a minute)`);
        
        const extractResponse = await documentAPI.extractForm16({ documentUrl });
        const { extractedData } = extractResponse.data;

        // 3. Merge extracted data into our main form state
        // This merges new data with any existing data from previous uploads
        setFilingData(prev => ({
          ...prev,
          personalInfo: {
            ...prev.personalInfo,
            ...extractedData.personalInfo,
            email: user?.email, // Always keep the logged-in user's email
          },
          income: {
            ...prev.income,
            salary: {
              totalSalary: (prev.income.salary.totalSalary || 0) + (extractedData.income.salary?.totalSalary || 0),
              allowances: (prev.income.salary.allowances || 0) + (extractedData.income.salary?.allowances || 0),
            },
            otherSources: {
                ...prev.income.otherSources,
                ...extractedData.income.otherSources,
            }
          },
          deductions: {
            ...prev.deductions,
            section80C: (prev.deductions.section80C || 0) + (extractedData.deductions?.section80C || 0),
            section80D: (prev.deductions.section80D || 0) + (extractedData.deductions?.section80D || 0),
            section80G: (prev.deductions.section80G || 0) + (extractedData.deductions?.section80G || 0),
            section24: (prev.deductions.section24 || 0) + (extractedData.deductions?.section24 || 0),
          },
          taxPaid: {
            ...prev.taxPaid,
            tds: (prev.taxPaid.tds || 0) + (extractedData.taxPaid?.tds || 0),
          }
        }));

      } catch (error) {
        console.error('Error during file processing:', error);
        alert(`Failed to process ${file.name}. Error: ${error.response?.data?.message || error.message}`);
      }
    }
    
    setIsUploading(false);
    setAutoFillComplete(true);
    setLoadingMessage('');

    // Show success message and move to next step
    setTimeout(() => {
      alert(`✅ Data from ${files.length} document(s) extracted successfully! Your details have been auto-filled.`);
      setCurrentStep(2);
    }, 500);
  };
  // --- END OF NEW UPLOAD LOGIC ---

  const removeFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
    // Note: This only removes from the UI. You might want to also delete from Cloudinary.
    // We also don't "un-fill" the data, as that would be too complex.
  };

  const handleInputChange = (section, field, value) => {
    setFilingData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleNestedInputChange = (section, subSection, field, value) => {
    setFilingData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subSection]: {
          ...prev[section][subSection],
          [field]: value
        }
      }
    }));
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // --- CONNECTED TO BACKEND ---
  const handleSaveAndInviteCA = async () => {
    try {
      const dataToSubmit = { ...filingData, status: 'pending_review' };
      const response = await taxAPI.startFiling(dataToSubmit);
      addTaxFiling(response.data); 
      alert('Your tax filing has been saved! A CA will review it shortly.');
      navigate('/dashboard?status=pending_review');
    } catch (error) {
      console.error("Failed to save filing:", error);
      alert('Error saving filing: ' + (error.response?.data?.message || 'Please try again.'));
    }
  };

  // --- CONNECTED TO BACKEND ---
  const handleSaveAndSubmit = async () => {
    try {
      const dataToSubmit = { ...filingData, status: 'submitted' };
      const response = await taxAPI.startFiling(dataToSubmit);
      addTaxFiling(response.data);
      alert('Your tax filing has been submitted successfully!');
      navigate('/dashboard?status=submitted');
    } catch (error) {
      console.error("Failed to submit filing:", error);
      alert('Error submitting filing: ' + (error.response?.data?.message || 'Please try again.'));
    }
  };
  
  const handleFileITR = async () => {
    // This function is called from the "Continue" button on the last step
    // We'll add a check in the UserDashboard for 'approved' status to file
    
    // For now, this just navigates
    alert('Filing will be submitted from the dashboard after approval.');
    navigate('/dashboard');
  };

  // --- CALCULATION LOGIC (REMAINS THE SAME) ---
  const calculateTotals = () => {
    const salaryTotal = filingData.income.salary.totalSalary || 0;
    const otherSourcesTotal = (filingData.income.otherSources.interest || 0) + (filingData.income.otherSources.dividend || 0) + (filingData.income.otherSources.other || 0);
    
    const totalIncome = salaryTotal + otherSourcesTotal;
    const totalDeductions = (filingData.deductions.section80C || 0) + (filingData.deductions.section80D || 0) + (filingData.deductions.section80G || 0) + (filingData.deductions.section24 || 0);
    const totalTaxPaid = filingData.taxPaid.tds || 0;
    
    const taxableIncome = Math.max(0, totalIncome - totalDeductions);
    
    return { 
      totalIncome, 
      totalDeductions, 
      totalTaxPaid,
      taxableIncome
    };
  };

  const calculateTax = () => {
    const { taxableIncome } = calculateTotals();
    let tax = 0;
    
    if (filingData.taxRegime === 'old') {
      if (taxableIncome <= 250000) tax = 0;
      else if (taxableIncome <= 500000) tax = (taxableIncome - 250000) * 0.05;
      else if (taxableIncome <= 1000000) tax = 12500 + (taxableIncome - 500000) * 0.2;
      else tax = 112500 + (taxableIncome - 1000000) * 0.3;
    } else {
      if (taxableIncome <= 300000) tax = 0;
      else if (taxableIncome <= 600000) tax = (taxableIncome - 300000) * 0.05;
      else if (taxableIncome <= 900000) tax = 15000 + (taxableIncome - 600000) * 0.1;
      else if (taxableIncome <= 1200000) tax = 45000 + (taxableIncome - 900000) * 0.15;
      else if (taxableIncome <= 1500000) tax = 90000 + (taxableIncome - 1200000) * 0.2;
      else tax = 150000 + (taxableIncome - 1500000) * 0.3;
    }
    return tax;
  };
  
  const totals = calculateTotals();
  const calculatedTax = calculateTax();
  const taxPayable = Math.max(0, calculatedTax - totals.totalTaxPaid);
  const refund = Math.max(0, totals.totalTaxPaid - calculatedTax);

  // --- RENDER FUNCTIONS (Minor updates to field names) ---

  // Step 1: Document Upload
  const renderDocumentUpload = () => (
    <div className="space-y-8">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-800 mb-4">Upload Your Form-16</h3>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Upload your Form-16 documents to automatically fill your details. You can upload multiple Form-16s if you've switched jobs.
        </p>
      </div>
      <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-[#80A1BA] transition-colors">
          <label className="bg-[#80A1BA] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#6d8da4] transition-colors cursor-pointer inline-block">
            {uploadedFiles.length > 0 ? 'Add More Files' : 'Choose Files to Upload'}
            <input
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileUpload}
              className="hidden"
              disabled={isUploading}
            />
          </label>
          <p className="text-sm text-gray-500 mt-3">Supports PDF, JPG, PNG. Max 10MB.</p>
      </div>
      {uploadedFiles.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Uploaded Documents ({uploadedFiles.length})</h4>
          <div className="space-y-3">
            {uploadedFiles.map((file) => (
              <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-800">{file.name}</p>
                <button
                  onClick={() => removeFile(file.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            ))}
          </div>
          {uploadedFiles.length > 1 && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
              We've combined the income and TDS data from all {uploadedFiles.length} Form-16 documents.
            </div>
          )}
        </div>
      )}
      {autoFillComplete && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
          <h4 className="font-semibold text-green-800">✅ Data Successfully Extracted!</h4>
          <p className="text-green-700 text-sm">Your details are auto-filled. Please click "Continue" to verify.</p>
        </div>
      )}
    </div>
  );

  // Step 2: Personal Information
  const renderPersonalInfo = () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-2xl font-bold text-gray-800 mb-4">Personal Information</h3>
        <p className="text-gray-600">Verify your auto-filled personal details.</p>
      </div>
      {autoFillComplete && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800 font-medium">
          Data auto-filled from Form-16. Please review for accuracy.
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
          <input type="text" value={filingData.personalInfo.firstName} onChange={(e) => handleInputChange('personalInfo', 'firstName', e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
          <input type="text" value={filingData.personalInfo.lastName} onChange={(e) => handleInputChange('personalInfo', 'lastName', e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">PAN Number</label>
          <input type="text" value={filingData.personalInfo.pan} onChange={(e) => handleInputChange('personalInfo', 'pan', e.target.value.toUpperCase())} className="w-full px-4 py-3 border border-gray-300 rounded-lg uppercase" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
          <input type="date" value={filingData.personalInfo.dateOfBirth} onChange={(e) => handleInputChange('personalInfo', 'dateOfBirth', e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
        </div>
      </div>
      <div className="border-t pt-6 space-y-4">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">Address Information</h4>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
          <input type="text" value={filingData.personalInfo.address.street} onChange={(e) => handleNestedInputChange('personalInfo', 'address', 'street', e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div><label>City</label><input type="text" value={filingData.personalInfo.address.city} onChange={(e) => handleNestedInputChange('personalInfo', 'address', 'city', e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg" /></div>
          <div><label>State</label><input type="text" value={filingData.personalInfo.address.state} onChange={(e) => handleNestedInputChange('personalInfo', 'address', 'state', e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg" /></div>
          <div><label>Pincode</label><input type="text" value={filingData.personalInfo.address.pincode} onChange={(e) => handleNestedInputChange('personalInfo', 'address', 'pincode', e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg" /></div>
        </div>
      </div>
    </div>
  );

  // Step 3: Income Details
  const renderIncomeDetails = () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-2xl font-bold text-gray-800 mb-4">Income Details</h3>
        <p className="text-gray-600">Verify your income from salary and other sources.</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">Salary Income</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Total Salary (as per Form 16)</label>
            <input type="number" value={filingData.income.salary.totalSalary} onChange={(e) => handleNestedInputChange('income', 'salary', 'totalSalary', parseFloat(e.target.value) || 0)} className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Allowances</label>
            <input type="number" value={filingData.income.salary.allowances} onChange={(e) => handleNestedInputChange('income', 'salary', 'allowances', parseFloat(e.target.value) || 0)} className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">Other Income Sources</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label>Interest Income</label>
            <input type="number" value={filingData.income.otherSources.interest} onChange={(e) => handleNestedInputChange('income', 'otherSources', 'interest', parseFloat(e.target.value) || 0)} className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label>Dividend Income</label>
            <input type="number" value={filingData.income.otherSources.dividend} onChange={(e) => handleNestedInputChange('income', 'otherSources', 'dividend', parseFloat(e.target.value) || 0)} className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label>Other</label>
            <input type="number" value={filingData.income.otherSources.other} onChange={(e) => handleNestedInputChange('income', 'otherSources', 'other', parseFloat(e.target.value) || 0)} className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );

  // Step 4: Deductions
  const renderDeductions = () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-2xl font-bold text-gray-800 mb-4">Tax Deductions</h3>
        <p className="text-gray-600">Verify your deductions. The AI has pre-filled values from your Form 16.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Section 80C (Investments, PPF, LIC)</label>
          <input type="number" value={filingData.deductions.section80C} onChange={(e) => handleInputChange('deductions', 'section80C', parseFloat(e.target.value) || 0)} className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Section 80D (Health Insurance)</label>
          <input type="number" value={filingData.deductions.section80D} onChange={(e) => handleInputChange('deductions', 'section80D', parseFloat(e.target.value) || 0)} className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Section 80G (Donations)</label>
          <input type="number" value={filingData.deductions.section80G} onChange={(e) => handleInputChange('deductions', 'section80G', parseFloat(e.target.value) || 0)} className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Section 24 (Home Loan Interest)</label>
          <input type="number" value={filingData.deductions.section24} onChange={(e) => handleInputChange('deductions', 'section24', parseFloat(e.target.value) || 0)} className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">Select Tax Regime</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
                onClick={() => handleInputChange('taxRegime', 'new')}
                className={`p-6 border-2 rounded-xl text-left transition-all ${
                filingData.taxRegime === 'new' 
                    ? 'border-[#80A1BA] bg-[#80A1BA]/10' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
            >
                <span className="font-bold text-gray-800">New Regime</span>
                <p className="text-sm text-gray-600 mb-2">Lower tax rates, no major deductions.</p>
            </button>
            <button
                onClick={() => handleInputChange('taxRegime', 'old')}
                className={`p-6 border-2 rounded-xl text-left transition-all ${
                filingData.taxRegime === 'old' 
                    ? 'border-[#80A1BA] bg-[#80A1BA]/10' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
            >
                <span className="font-bold text-gray-800">Old Regime</span>
                <p className="text-sm text-gray-600 mb-2">Standard rates with all deductions.</p>
            </button>
        </div>
      </div>
    </div>
  );

  // Step 5: Tax Calculation
  const renderTaxCalculation = () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-2xl font-bold text-gray-800 mb-4">Tax Calculation</h3>
        <p className="text-gray-600">Review your tax liability based on the selected regime.</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">Tax Already Paid</h4>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">TDS (Tax Deducted at Source)</label>
          <input type="number" value={filingData.taxPaid.tds} onChange={(e) => handleInputChange('taxPaid', 'tds', parseFloat(e.target.value) || 0)} className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
        </div>
      </div>
      <div className="bg-gradient-to-r from-[#80A1BA]/10 to-[#91C4C3]/10 rounded-xl border border-[#80A1BA]/20 p-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-6">Tax Summary ({filingData.taxRegime} Regime)</h4>
        <div className="space-y-4">
          <div className="flex justify-between items-center py-3 border-b"><span className="text-gray-600">Total Tax Calculated</span><span className="text-lg font-bold text-gray-800">₹{calculatedTax.toLocaleString()}</span></div>
          <div className="flex justify-between items-center py-3 border-b"><span className="text-gray-600">Tax Already Paid</span><span className="text-lg font-bold text-green-600">₹{totals.totalTaxPaid.toLocaleString()}</span></div>
          <div className="flex justify-between items-center py-4 bg-white rounded-lg px-4">
            <span className="text-lg font-bold text-gray-800">{refund > 0 ? 'Tax Refund' : 'Net Tax Payable'}</span>
            <span className={`text-xl font-bold ${refund > 0 ? 'text-green-600' : 'text-red-600'}`}>
              ₹{refund > 0 ? refund.toLocaleString() : taxPayable.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  // Step 6: Review
  const renderReview = () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-2xl font-bold text-gray-800 mb-4">Review Your Filing</h3>
        <p className="text-gray-600">Verify all information before submission.</p>
      </div>
      {autoFillComplete && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 flex items-center space-x-3">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div>
            <h4 className="font-semibold text-green-800">Form-16 Data Successfully Imported!</h4>
            <p className="text-green-700 text-sm">All data has been auto-filled. Please review for accuracy.</p>
          </div>
        </div>
      )}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-sm text-gray-600">Total Income</p><p className="text-lg font-bold text-gray-800">₹{totals.totalIncome.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-sm text-gray-600">Deductions</p><p className="text-lg font-bold text-green-600">₹{totals.totalDeductions.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-sm text-gray-600">Tax Regime</p><p className="text-lg font-bold text-[#80A1BA] capitalize">{filingData.taxRegime}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-sm text-gray-600">{refund > 0 ? 'Tax Refund' : 'Tax Payable'}</p>
          <p className={`text-lg font-bold ${refund > 0 ? 'text-green-600' : 'text-red-600'}`}>₹{refund > 0 ? refund.toLocaleString() : taxPayable.toLocaleString()}</p>
        </div>
      </div>
      <div className="bg-[#91C4C3]/10 rounded-xl border border-[#91C4C3] p-6">
        <h4 className="text-lg font-semibold text-gray-800 mb-6">Ready to proceed?</h4>
        <div className="flex flex-col sm:flex-row gap-4">
          <button onClick={handleSaveAndInviteCA} className="flex-1 bg-[#80A1BA] text-white py-4 px-6 rounded-lg font-semibold hover:bg-[#6d8da4] transition-colors shadow-sm">
            Save & Invite CA Review
          </button>
          <button onClick={handleSaveAndSubmit} className="flex-1 bg-[#B4DEBD] text-gray-800 py-4 px-6 rounded-lg font-semibold hover:bg-[#a0c8a9] transition-colors shadow-sm">
            Save & Submit Directly
          </button>
        </div>
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: return renderDocumentUpload();
      case 2: return renderPersonalInfo();
      case 3: return renderIncomeDetails();
      case 4: return renderDeductions();
      case 5: return renderTaxCalculation();
      case 6: return renderReview();
      default: return renderDocumentUpload();
    }
  };
  
  // --- MAIN RETURN (Header, Steps, Content, Nav) ---
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <button onClick={() => navigate('/dashboard')} className="flex items-center text-gray-500 hover:text-gray-700">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              Back to Dashboard
            </button>
            <div className="text-right">
              <p className="text-sm text-gray-500">Progress</p>
              <p className="text-sm font-semibold text-gray-800">{currentStep} of {steps.length} steps</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto py-8 px-6">
        <div className="flex justify-between mb-12 relative">
          <div className="absolute top-4 left-0 right-0 h-1 bg-gray-200 -z-10"></div>
          {steps.map((step) => (
            <div key={step.number} className="flex flex-col items-center z-10">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${currentStep >= step.number ? 'bg-[#80A1BA] text-white shadow-md' : 'bg-white border-2 border-gray-300 text-gray-400'}`}>
                {currentStep > step.number ? '✓' : step.number}
              </div>
              <p className={`mt-2 text-xs font-semibold text-center ${currentStep >= step.number ? 'text-[#80A1BA]' : 'text-gray-500'}`}>
                {step.title}
              </p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
          {renderStepContent()}
        </div>

        <div className="flex justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className="px-8 py-3 rounded-lg font-semibold transition-all text-gray-700 hover:bg-gray-50 border border-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            onClick={currentStep === steps.length ? handleFileITR : nextStep}
            disabled={!autoFillComplete && currentStep === 1 && uploadedFiles.length === 0}
            className="bg-[#80A1BA] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#6d8da4] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            title={!autoFillComplete && currentStep === 1 && uploadedFiles.length === 0 ? "Please upload a document to continue" : ""}
          >
            {currentStep === steps.length ? 'Submit Final ITR' : 'Continue'}
          </button>
        </div>
      </div>

      {isUploading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center">
            <div className="w-16 h-16 border-4 border-[#80A1BA] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {loadingMessage}
            </h3>
            <p className="text-gray-600 text-sm">
              Please wait while we securely process your document...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaxFilingPage;