"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface MedicalFile {
  type: string;
  file: File;
  description: string;
}

export default function PatientSignup() {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    aadhar: "",
    bloodType: "",
    allergies: "",
    emergencyContactName: "",
    emergencyContactRelation: "",
    emergencyContactNumber: "",
  });

  const [medicalFiles, setMedicalFiles] = useState<MedicalFile[]>([]);

  // Track descriptions by type
  const [fileDescriptions, setFileDescriptions] = useState<Record<string, string>>({});

  const [isFingerprintScanned, setIsFingerprintScanned] = useState(false);
  const [fingerprintImage, setFingerprintImage] = useState<string | null>(null);
  const [fingerprintTemplate, setFingerprintTemplate] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileUpload = (type: string, file: File) => {
    setMedicalFiles(prev => {
      // Remove any previous file of this type
      const filtered = prev.filter(f => f.type !== type);
      return [...filtered, { type, file, description: fileDescriptions[type] || "" }];
    });
  };

  const handleDescriptionChange = (type: string, description: string) => {
    setFileDescriptions(prev => ({ ...prev, [type]: description }));
    setMedicalFiles(prev => prev.map(f => f.type === type ? { ...f, description } : f));
  };

  const handleFingerprintScan = async () => {
    try {
      const response = await fetch("http://localhost:8080/CallMorphoAPI?5", {
        method: "POST"
      });
      const data = await response.json();
      if (Number(data.ReturnCode) === 0) {
        setFingerprintImage(`data:image/png;base64,${data.Base64BMPIMage}`);
        setFingerprintTemplate(data.Base64ISOTemplate);
        setIsFingerprintScanned(true);
        toast.success("Fingerprint scanned successfully!");
      } else {
        toast.error("Device error: " + data.ReturnCode);
      }
    } catch (error) {
      toast.error("Failed to connect to fingerprint device.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFingerprintScanned || !fingerprintTemplate) {
      toast.error("Please scan your fingerprint first!");
      return;
    }

    try {
      // Create FormData for file upload
      const formDataToSend = new FormData();
      
      // Append patient information
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value);
      });

      // Append medical files
      medicalFiles.forEach((file, index) => {
        formDataToSend.append(`medicalFiles[${index}][type]`, file.type);
        formDataToSend.append(`medicalFiles[${index}][file]`, file.file);
        formDataToSend.append(`medicalFiles[${index}][description]`, file.description);
      });

      // Append fingerprint data
      formDataToSend.append("fingerprintTemplate", fingerprintTemplate);
      if (fingerprintImage) {
        formDataToSend.append("fingerprintImage", fingerprintImage);
      }

      // Send to backend
      const response = await fetch("http://localhost:5000/register_patient", {
        method: "POST",
        body: formDataToSend,
      });

      if (!response.ok) {
        throw new Error("Registration failed");
      }
      toast.success("Registration successful!");
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Registration failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Card className="p-6">
          <h1 className="text-2xl font-bold mb-6">Patient Registration</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  name="age"
                  type="number"
                  value={formData.age}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => handleSelectChange("gender", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="aadhar">Aadhar Number</Label>
                <Input
                  id="aadhar"
                  name="aadhar"
                  value={formData.aadhar}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bloodType">Blood Type</Label>
                <Select
                  value={formData.bloodType}
                  onValueChange={(value) => handleSelectChange("bloodType", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select blood type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A+">A+</SelectItem>
                    <SelectItem value="A-">A-</SelectItem>
                    <SelectItem value="B+">B+</SelectItem>
                    <SelectItem value="B-">B-</SelectItem>
                    <SelectItem value="AB+">AB+</SelectItem>
                    <SelectItem value="AB-">AB-</SelectItem>
                    <SelectItem value="O+">O+</SelectItem>
                    <SelectItem value="O-">O-</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="allergies">Allergies (comma-separated)</Label>
                <Input
                  id="allergies"
                  name="allergies"
                  value={formData.allergies}
                  onChange={handleInputChange}
                  placeholder="e.g., Penicillin, Peanuts"
                />
              </div>

              {/* Emergency Contact Section */}
              <div className="col-span-2 border-t pt-6">
                <h2 className="text-lg font-semibold mb-4">Emergency Contact Details</h2>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContactName">Name</Label>
                    <Input
                      id="emergencyContactName"
                      name="emergencyContactName"
                      value={formData.emergencyContactName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContactRelation">Relation</Label>
                    <Input
                      id="emergencyContactRelation"
                      name="emergencyContactRelation"
                      value={formData.emergencyContactRelation}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContactNumber">Contact Number</Label>
                    <Input
                      id="emergencyContactNumber"
                      name="emergencyContactNumber"
                      value={formData.emergencyContactNumber}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Fingerprint Scan */}
            <div className="border-t pt-6">
              <h2 className="text-lg font-semibold mb-4">Fingerprint Registration</h2>
              <Button
                type="button"
                onClick={handleFingerprintScan}
                className={isFingerprintScanned ? "bg-green-500" : ""}
              >
                {isFingerprintScanned ? "✓ Fingerprint Scanned" : "Scan Fingerprint"}
              </Button>
              {fingerprintImage && (
                <div className="mt-4">
                  <img src={fingerprintImage} alt="Fingerprint" className="w-48 h-64 object-contain border" />
                </div>
              )}
            </div>

            {/* Medical Records Upload */}
            <div className="border-t pt-6">
              <h2 className="text-lg font-semibold mb-4">Medical Records</h2>
              <div className="space-y-4">
                {["MRI", "X-Ray", "Blood Report", "Prescription", "Other"].map((type) => (
                  <div key={type} className="flex gap-4 items-end">
                    <div className="flex-1">
                      <Label>{type}</Label>
                      <Input
                        type="file"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleFileUpload(type, file);
                          }
                        }}
                        accept=".pdf,.jpg,.jpeg,.png"
                      />
                    </div>
                    <div className="flex-1">
                      <Label>Description</Label>
                      <Input
                        type="text"
                        placeholder="Enter description"
                        value={fileDescriptions[type] || ""}
                        onChange={(e) => handleDescriptionChange(type, e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t pt-6">
              <Button type="submit" className="w-full">
                Complete Registration
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
} 