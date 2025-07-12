"use client";

import { useState } from "react";
import { patients, Patient, MedicalRecord } from "@/data/patients";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function DoctorDashboard() {
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [chatInput, setChatInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Simulate fingerprint scan
  const handleFingerprintScan = async (fingerprintId: string) => {
    const patient = patients.find(p => p.fingerprintId === fingerprintId);
    setSelectedPatient(patient || null);
    if (patient) {
      setIsLoading(true);
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: [{
              role: "user",
              content: "Please provide a summary of this patient's medical history and any important points to note."
            }],
            patientData: patient
          }),
        });

        if (!response.ok) throw new Error('Failed to get AI response');
        
        const aiMessage = await response.json();
        // Clear previous chat when switching patients
        setChatMessages([aiMessage]);
      } catch (error) {
        console.error('Error getting AI summary:', error);
        setChatMessages([{
          role: "assistant",
          content: `Patient Summary for ${patient.name}:\n` +
            `- Age: ${patient.age}, Gender: ${patient.gender}\n` +
            `- Blood Type: ${patient.bloodType}\n` +
            `- Allergies: ${patient.allergies.join(", ")}\n` +
            `- Recent visits: ${patient.medicalHistory.generalReports[0]?.date || "None"}`
        }]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    // Add user message
    const userMessage = { role: "user", content: chatInput };
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput("");
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...chatMessages, userMessage],
          patientData: selectedPatient, // This can be null if no patient is selected
          isGeneralQuery: !selectedPatient // Add flag to indicate if this is a general medical query
        }),
      });

      if (!response.ok) throw new Error('Failed to get AI response');
      
      const aiMessage = await response.json();
      setChatMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      setChatMessages(prev => [...prev, {
        role: "assistant",
        content: "I apologize, but I'm having trouble connecting to the AI service right now. Please try again later."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const RecordList = ({ title, records }: { title: string; records: MedicalRecord[] }) => {
    const [selectedReport, setSelectedReport] = useState<MedicalRecord | null>(null);

    const handleViewReport = (report: MedicalRecord) => {
      setSelectedReport(report);
    };

    const handleCloseReport = () => {
      setSelectedReport(null);
    };

    return (
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-3">{title}</h3>
        {records.length === 0 ? (
          <p className="text-gray-500">No records available</p>
        ) : (
          <div className="space-y-2">
            {records.map((record, index) => (
              <div key={index} className="border p-3 rounded hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-medium block">{record.type}</span>
                    <span className="text-sm text-gray-500 block">{record.date}</span>
                    <p className="text-sm mt-1">{record.result}</p>
                    <p className="text-sm text-gray-600">Doctor: {record.doctor}</p>
                  </div>
                  {record.attachmentUrl && (
                    <Button
                      onClick={() => handleViewReport(record)}
                      variant="outline"
                      size="sm"
                      className="ml-2"
                    >
                      View Report
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Report Viewer Modal */}
        {selectedReport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="p-4 border-b flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">{selectedReport.type}</h3>
                  <p className="text-sm text-gray-500">
                    Date: {selectedReport.date} | Doctor: {selectedReport.doctor}
                  </p>
                </div>
                <Button
                  onClick={handleCloseReport}
                  variant="outline"
                  size="sm"
                >
                  Close
                </Button>
              </div>
              <div className="p-4 overflow-auto max-h-[calc(90vh-8rem)]">
                {selectedReport.attachmentUrl && (
                  <div className="relative w-full h-[600px]">
                    <Image
                      src={selectedReport.attachmentUrl}
                      alt={`${selectedReport.type} Report`}
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 50vw"
                    />
                  </div>
                )}
                <div className="mt-4">
                  <h4 className="font-medium">Report Details:</h4>
                  <p className="text-sm mt-1">{selectedReport.description}</p>
                  <p className="text-sm mt-2">
                    <span className="font-medium">Result: </span>
                    {selectedReport.result}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Scan and lookup patient by fingerprint
  const handleScanNewPatient = async () => {
    setLookupError(null);
    setLookupLoading(true);
    setSelectedPatient(null);
    try {
      // 1. Capture fingerprint
      const response = await fetch("http://localhost:8080/CallMorphoAPI?5", { method: "POST" });
      const data = await response.json();
      if (Number(data.ReturnCode) !== 0) {
        setLookupError("Fingerprint device error: " + data.ReturnCode);
        setLookupLoading(false);
        return;
      }
      const template = data.Base64ISOTemplate;
      // 2. Lookup patient in backend
      const lookupRes = await fetch("http://localhost:5000/find_patient", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fingerprint_template: template })
      });
      const lookupData = await lookupRes.json();
      if (lookupData.success && lookupData.patient) {
        setSelectedPatient(lookupData.patient);
        setLookupError(null);
        // AI summary for real patients
        const p = lookupData.patient;
        let summary = `Patient Summary for ${p.name} (from fingerprint):\n- Age: ${p.age}, Gender: ${p.gender}\n- Blood Type: ${p.bloodType}\n- Emergency Contact: ${p.emergencyContact?.name} (${p.emergencyContact?.relation}), Phone: ${p.emergencyContact?.number}\n`;
        if (p.medicalFiles && p.medicalFiles.length > 0) {
          summary += `- Medical Files by Type:\n`;
          const byType: Record<string, string[]> = {};
          p.medicalFiles.forEach((file: any) => {
            const type = file.type || "Other";
            if (!byType[type]) byType[type] = [];
            byType[type].push(file.filename);
          });
          Object.entries(byType).forEach(([type, files]) => {
            summary += `  * ${type}: ${files.join(", ")}\n`;
          });
        } else {
          summary += "- No medical files uploaded.\n";
        }
        setChatMessages([{ role: "assistant", content: summary }]);
      } else {
        setSelectedPatient(null);
        setLookupError("No patient found");
      }
    } catch (err) {
      setLookupError("Failed to connect to device or server.");
    } finally {
      setLookupLoading(false);
    }
  };

  // Helper to check if patient is a mock patient (has medicalHistory)
  const isMockPatient = (patient: any) => !!patient.medicalHistory;

  // Helper to group real patient files by type field
  const groupFilesByType = (files: any[]) => {
    const groups: Record<string, any[]> = {
      blood: [],
      xray: [],
      mri: [],
      ecg: [],
      ct: [],
      general: [],
      prescription: [],
      other: [],
    };
    files.forEach(file => {
      const type = (file.type || "other").toLowerCase();
      if (type.includes("blood")) groups.blood.push(file);
      else if (type.includes("xray") || type.includes("x-ray")) groups.xray.push(file);
      else if (type.includes("mri")) groups.mri.push(file);
      else if (type.includes("ecg")) groups.ecg.push(file);
      else if (type.includes("ct")) groups.ct.push(file);
      else if (type.includes("prescription")) groups.prescription.push(file);
      else if (type.includes("general")) groups.general.push(file);
      else groups.other.push(file);
    });
    return groups;
  };

  // Helper to open base64 image in new tab
  const handleViewReport = (file: any) => {
    if (file.data) {
      // Try to guess file type from filename
      let mime = "image/png";
      if (file.filename && file.filename.toLowerCase().endsWith(".jpg")) mime = "image/jpeg";
      if (file.filename && file.filename.toLowerCase().endsWith(".jpeg")) mime = "image/jpeg";
      if (file.filename && file.filename.toLowerCase().endsWith(".pdf")) mime = "application/pdf";
      const url = `data:${mime};base64,${file.data}`;
      window.open(url, "_blank");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Bar */}
      <div className="bg-white shadow p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Doctor Dashboard</h1>
          <div className="flex gap-2">
            <Button
              onClick={handleScanNewPatient}
              variant="default"
              className="font-semibold"
              disabled={lookupLoading}
            >
              {lookupLoading ? "Scanning..." : "Scan New Patient"}
            </Button>
            {patients.map(patient => (
              <Button
                key={patient.fingerprintId}
                onClick={() => handleFingerprintScan(patient.fingerprintId)}
                variant="outline"
                disabled={isLoading}
              >
                Scan {patient.name}&apos;s Fingerprint
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 px-4 grid grid-cols-4 gap-6">
        {/* Left Column - AI Chat */}
        <div className="col-span-1 bg-white rounded-lg shadow p-4 h-[calc(100vh-12rem)] mr-10">
          <h2 className="text-lg font-semibold mb-4">AI Assistant</h2>
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-auto mb-4 space-y-4">
              {chatMessages.map((message, index) => (
                <div
                  key={index}
                  className={`p-2 rounded ${
                    message.role === "assistant"
                      ? "bg-blue-100 ml-4"
                      : "bg-gray-100 mr-4"
                  }`}
                >
                  {message.content}
                </div>
              ))}
              {isLoading && (
                <div className="bg-gray-100 ml-4 p-2 rounded animate-pulse">
                  AI is thinking...
                </div>
              )}
            </div>
            <form onSubmit={handleChatSubmit} className="mt-auto">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={selectedPatient ? "Ask about patient data..." : "Ask any medical question..."}
                  className="flex-1 p-2 border rounded"
                  disabled={isLoading}
                />
                <Button type="submit" disabled={isLoading}>
                  Send
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Columns - Medical Records */}
        <div className="col-span-3 space-y-6">
          {lookupError && (
            <div className="bg-red-100 text-red-700 p-4 rounded-lg text-center font-semibold">{lookupError}</div>
          )}
          {selectedPatient ? (
            <>
              <div className="bg-white p-4 rounded-lg shadow">
                <h2 className="text-xl font-bold mb-2">
                  Patient: {selectedPatient.name}
                </h2>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>Age: {selectedPatient.age}</div>
                  <div>Gender: {selectedPatient.gender}</div>
                  <div>Blood Type: {selectedPatient.bloodType}</div>
                </div>
              </div>
              {/* Emergency Contact Section */}
              <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg shadow flex items-center gap-6 my-2">
                <div>
                  <h3 className="text-lg font-semibold text-red-700 mb-1">Emergency Contact</h3>
                  <div className="text-sm text-gray-700">
                    <div><span className="font-medium">Name:</span> {selectedPatient.emergencyContact?.name}</div>
                    <div><span className="font-medium">Relation:</span> {selectedPatient.emergencyContact?.relation}</div>
                    <div><span className="font-medium">Phone:</span> {selectedPatient.emergencyContact?.number}</div>
                  </div>
                </div>
              </div>
              {/* Medical Files Section */}
              <div className="grid grid-cols-2 gap-6">
                {isMockPatient(selectedPatient) ? (
                  <>
                    <RecordList
                      title="Blood Reports"
                      records={selectedPatient.medicalHistory?.bloodReports || []}
                    />
                    <RecordList
                      title="X-Ray Reports"
                      records={selectedPatient.medicalHistory?.xrays || []}
                    />
                    <RecordList
                      title="ECG Reports"
                      records={selectedPatient.medicalHistory?.ecgReports || []}
                    />
                    <RecordList
                      title="General Reports"
                      records={selectedPatient.medicalHistory?.generalReports || []}
                    />
                    <RecordList
                      title="MRI Reports"
                      records={selectedPatient.medicalHistory?.mriReports || []}
                    />
                    <RecordList
                      title="CT Scan Reports"
                      records={selectedPatient.medicalHistory?.ctScanReports || []}
                    />
                  </>
                ) : (
                  (() => {
                    const files = selectedPatient.medicalFiles || [];
                    const grouped = groupFilesByType(files);
                    return (
                      <>
                        <div className="bg-white p-4 rounded-lg shadow">
                          <h3 className="text-lg font-semibold mb-3">Blood Reports</h3>
                          {grouped.blood.length > 0 ? (
                            <ul>
                              {grouped.blood.map((file, idx) => (
                                <li key={idx} className="mb-2 flex items-center gap-2">
                                  <span className="font-medium">{file.filename}</span>
                                  <Button size="sm" variant="outline" onClick={() => handleViewReport(file)}>View Report</Button>
                                </li>
                              ))}
                            </ul>
                          ) : <p className="text-gray-500">No records available</p>}
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow">
                          <h3 className="text-lg font-semibold mb-3">X-Ray Reports</h3>
                          {grouped.xray.length > 0 ? (
                            <ul>
                              {grouped.xray.map((file, idx) => (
                                <li key={idx} className="mb-2 flex items-center gap-2">
                                  <span className="font-medium">{file.filename}</span>
                                  <Button size="sm" variant="outline" onClick={() => handleViewReport(file)}>View Report</Button>
                                </li>
                              ))}
                            </ul>
                          ) : <p className="text-gray-500">No records available</p>}
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow">
                          <h3 className="text-lg font-semibold mb-3">MRI Reports</h3>
                          {grouped.mri.length > 0 ? (
                            <ul>
                              {grouped.mri.map((file, idx) => (
                                <li key={idx} className="mb-2 flex items-center gap-2">
                                  <span className="font-medium">{file.filename}</span>
                                  <Button size="sm" variant="outline" onClick={() => handleViewReport(file)}>View Report</Button>
                                </li>
                              ))}
                            </ul>
                          ) : <p className="text-gray-500">No records available</p>}
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow">
                          <h3 className="text-lg font-semibold mb-3">ECG Reports</h3>
                          {grouped.ecg.length > 0 ? (
                            <ul>
                              {grouped.ecg.map((file, idx) => (
                                <li key={idx} className="mb-2 flex items-center gap-2">
                                  <span className="font-medium">{file.filename}</span>
                                  <Button size="sm" variant="outline" onClick={() => handleViewReport(file)}>View Report</Button>
                                </li>
                              ))}
                            </ul>
                          ) : <p className="text-gray-500">No records available</p>}
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow">
                          <h3 className="text-lg font-semibold mb-3">CT Scan Reports</h3>
                          {grouped.ct.length > 0 ? (
                            <ul>
                              {grouped.ct.map((file, idx) => (
                                <li key={idx} className="mb-2 flex items-center gap-2">
                                  <span className="font-medium">{file.filename}</span>
                                  <Button size="sm" variant="outline" onClick={() => handleViewReport(file)}>View Report</Button>
                                </li>
                              ))}
                            </ul>
                          ) : <p className="text-gray-500">No records available</p>}
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow">
                          <h3 className="text-lg font-semibold mb-3">Prescriptions</h3>
                          {grouped.prescription.length > 0 ? (
                            <ul>
                              {grouped.prescription.map((file, idx) => (
                                <li key={idx} className="mb-2 flex items-center gap-2">
                                  <span className="font-medium">{file.filename}</span>
                                  <Button size="sm" variant="outline" onClick={() => handleViewReport(file)}>View Report</Button>
                                </li>
                              ))}
                            </ul>
                          ) : <p className="text-gray-500">No records available</p>}
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow">
                          <h3 className="text-lg font-semibold mb-3">Other Files</h3>
                          {grouped.other.length > 0 ? (
                            <ul>
                              {grouped.other.map((file, idx) => (
                                <li key={idx} className="mb-2 flex items-center gap-2">
                                  <span className="font-medium">{file.filename}</span>
                                  <Button size="sm" variant="outline" onClick={() => handleViewReport(file)}>View Report</Button>
                                </li>
                              ))}
                            </ul>
                          ) : <p className="text-gray-500">No records available</p>}
                        </div>
                      </>
                    );
                  })()
                )}
              </div>
            </>
          ) : (
            <div className="bg-white p-8 rounded-lg shadow text-center">
              <h2 className="text-xl font-semibold text-gray-600">
                Please scan a patient&apos;s fingerprint to view their medical records
              </h2>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 