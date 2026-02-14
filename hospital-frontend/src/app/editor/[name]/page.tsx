"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Printer,
  FileText,
  Loader2,
  User,
  Hash,
  Stethoscope,
  Bed,
  Calendar,
  Clock,
  MapPin,
} from "lucide-react";
import { injectData } from "@/lib/htmlInjector";

const INITIAL_FORM_DATA = {
  uid: "",
  ipd: "",
  admissionDate: "",
  name: "",
  age: "",
  consultant: "",
  diagnosis: "",
  bed: "",
  location: "",
  locationType: "",
  duration: "",
};

export default function EditorPage() {
  const params = useParams();
  const router = useRouter();
  const templateName = decodeURIComponent(params.name as string);

  const [htmlContent, setHtmlContent] = useState<string>("");
  const [previewContent, setPreviewContent] = useState<string>("");
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [loading, setLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const isBloodTransfusion = templateName.includes(
    "29. Blood And Blood Product and Record form",
  );

  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      let hours = date.getHours();
      const minutes = String(date.getMinutes()).padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      return `${day}/${month}/${year}  ${hours}:${minutes} ${ampm}`;
    } catch (e) {
      return dateStr;
    }
  };

  useEffect(() => {
    fetch(`/api/templates/${encodeURIComponent(templateName)}`)
      .then((res) => res.text())
      .then((html) => {
        setHtmlContent(html);
        setPreviewContent(html);
        setLoading(false);
      });
  }, [templateName]);

  // Update preview when form data changes
  useEffect(() => {
    if (htmlContent) {
      const dataToInject = {
        ...formData,
        admissionDate: formatDateTime(formData.admissionDate),
        // If it's blood transfusion, we want to show the type we selected
        location:
          isBloodTransfusion && formData.locationType
            ? `${formData.locationType}: ${formData.location}`
            : formData.location,
      };

      const updatedHtml = injectData(htmlContent, dataToInject);
      setPreviewContent(updatedHtml);
    }
  }, [formData, htmlContent, isBloodTransfusion]);

  // Update iframe content
  useEffect(() => {
    if (iframeRef.current && previewContent) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(previewContent);
        doc.title = templateName; // Set title for clean printing header
        doc.close();
      }
    }
  }, [previewContent, templateName]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePrint = () => {
    if (iframeRef.current) {
      iframeRef.current.contentWindow?.print();
    }
  };

  const handleSave = () => {
    alert("Form data saved successfully!");
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
          <p className="text-slate-500 font-medium">Loading Template...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-slate-50 overflow-hidden">
      {/* Navbar */}
      <nav className="flex h-16 items-center justify-between border-b bg-white px-6 shadow-sm z-20">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/")}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-sm font-semibold max-w-[300px] truncate">
              {templateName}
            </h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
              Patient Management System
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-slate-50 transition-all"
          >
            <Printer size={16} />
            Print
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 shadow-md shadow-blue-200 transition-all"
          >
            <Printer size={16} />
            Download PDF
          </button>
        </div>
      </nav>

      {/* Split Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Side: Preview */}
        <div className="flex-1 bg-slate-200 p-8 overflow-auto flex justify-center items-start custom-scrollbar">
          <div className="w-full max-w-[850px] bg-white shadow-2xl rounded-sm min-h-[1100px] origin-top">
            <iframe
              ref={iframeRef}
              title="Form Preview"
              className="w-full h-[1100px] border-none"
            />
          </div>
        </div>

        {/* Right Side: Form Controls */}
        <div className="w-[400px] bg-white border-l overflow-y-auto p-6 shadow-xl z-10 custom-scrollbar">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-800">Form Details</h2>
            <p className="text-xs text-slate-500">
              Enter patient information below to update the preview.
            </p>
          </div>

          <div className="space-y-6">
            <section className="space-y-4">
              <h3 className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                Registration Info
              </h3>
              <div className="grid gap-4">
                <FormField
                  label="UID / Reg No"
                  name="uid"
                  value={formData.uid}
                  onChange={handleInputChange}
                  icon={<Hash size={16} />}
                  placeholder="e.g. 12345"
                />
                <FormField
                  label="IPD / Indoor No"
                  name="ipd"
                  value={formData.ipd}
                  onChange={handleInputChange}
                  icon={<FileText size={16} />}
                  placeholder="e.g. 67890"
                />
                {isBloodTransfusion && (
                  <div className="space-y-1.5 focus-within:translate-x-1 transition-transform">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Calendar size={16} className="text-blue-600" />
                      Admission Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      name="admissionDate"
                      value={formData.admissionDate}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-black font-medium outline-none ring-blue-500 focus:ring-2 focus:border-transparent transition-all shadow-sm"
                    />
                  </div>
                )}
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                Patient Details
              </h3>
              <div className="grid gap-4">
                <FormField
                  label="Patient's Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  icon={<User size={16} />}
                  placeholder="Enter full name"
                />
                <FormField
                  label="Age/Sex"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  icon={<Calendar size={16} />}
                  placeholder="e.g. 45Y/M"
                />
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                Clinical Details
              </h3>
              <div className="grid gap-4">
                <FormField
                  label="Consultant"
                  name="consultant"
                  value={formData.consultant}
                  onChange={handleInputChange}
                  icon={<Stethoscope size={16} />}
                  placeholder="Doctor name"
                />
                <FormField
                  label="Ward / Bed No"
                  name="bed"
                  value={formData.bed}
                  onChange={handleInputChange}
                  icon={<Bed size={16} />}
                  placeholder="e.g. ICU-05"
                />
                <FormField
                  label="Diagnosis"
                  name="diagnosis"
                  value={formData.diagnosis}
                  onChange={handleInputChange}
                  icon={<FileText size={16} />}
                  placeholder="Clinical diagnosis"
                />
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                Other Info
              </h3>
              <div className="grid gap-4">
                {isBloodTransfusion && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <MapPin size={16} className="text-blue-600" />
                      Location Type
                    </label>
                    <div className="flex gap-2">
                      {["ICU", "Ward", "Room"].map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              locationType: type,
                            }))
                          }
                          className={`flex-1 py-1.5 text-xs font-bold rounded-md border transition-all ${
                            formData.locationType === type
                              ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-100"
                              : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <FormField
                  label={
                    isBloodTransfusion
                      ? `${formData.locationType || "Location"} Name / No`
                      : "Location"
                  }
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  icon={<MapPin size={16} />}
                  placeholder="e.g. Emergency"
                />
                <FormField
                  label="Duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  icon={<Clock size={16} />}
                  placeholder="e.g. 2 Days"
                />
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

function FormField({
  label,
  name,
  value,
  onChange,
  icon,
  placeholder,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon?: React.ReactNode;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5 focus-within:translate-x-1 transition-transform">
      <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
        <span className="text-blue-600">{icon}</span>
        {label}
      </label>
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-black font-medium outline-none ring-blue-500 focus:ring-2 focus:border-transparent transition-all shadow-sm"
      />
    </div>
  );
}
