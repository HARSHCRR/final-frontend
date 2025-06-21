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
  const [isFingerprintScanned, setIsFingerprintScanned] = useState(false);

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

  const handleFileUpload = (type: string, file: File, description: string) => {
    setMedicalFiles(prev => [...prev, { type, file, description }]);
  };

  const handleFingerprintScan = () => {
    // Simulate fingerprint scan
    setIsFingerprintScanned(true);
    toast.success("Fingerprint scanned successfully!");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFingerprintScanned) {
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

      // Send to backend
      const response = await fetch("/api/patients/register", {
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
                            handleFileUpload(type, file, "");
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
                        onChange={(e) => {
                          const file = medicalFiles.find(f => f.type === type);
                          if (file) {
                            handleFileUpload(type, file.file, e.target.value);
                          }
                        }}
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