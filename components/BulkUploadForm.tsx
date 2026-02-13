"use client";

import { useState } from "react";
import Papa from "papaparse";
import { bulkUploadUsers } from "@/app/actions/bulk-upload";
import { Upload } from "lucide-react";

export default function BulkUploadForm() {
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);
  const [results, setResults] = useState<any>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setMessage(null);
    setResults(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const users = results.data as any[];

          if (users.length === 0) {
            setMessage({ type: "error", text: "CSV file is empty" });
            setIsUploading(false);
            return;
          }

          setMessage({
            type: "info",
            text: `Processing ${users.length} users...`,
          });

          const result = await bulkUploadUsers(users);

          if (result.success) {
            setResults(result.results);
            setMessage({
              type: "success",
              text: `Upload complete! Success: ${result.results?.success ?? 0}, Failed: ${result.results?.failed ?? 0}`,
            });
          } else {
            setMessage({
              type: "error",
              text: result.error || "Upload failed",
            });
          }
        } catch (error) {
          setMessage({ type: "error", text: "Error processing file" });
        } finally {
          setIsUploading(false);
          e.target.value = "";
        }
      },
      error: () => {
        setMessage({ type: "error", text: "Error parsing CSV file" });
        setIsUploading(false);
      },
    });
  };

  return (
    <div className="space-y-6">
      {message && (
        <div
          className={`rounded-md p-4 ${
            message.type === "success"
              ? "bg-green-50 text-green-800"
              : message.type === "error"
                ? "bg-red-50 text-red-800"
                : "bg-blue-50 text-blue-800"
          }`}
        >
          <p className="text-sm">{message.text}</p>
        </div>
      )}

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <label htmlFor="csvFile" className="cursor-pointer">
          <span className="mt-2 block text-sm font-medium text-gray-900">
            {isUploading ? "Processing..." : "Click to upload CSV file"}
          </span>
          <span className="mt-1 block text-xs text-gray-500">
            CSV file with user data
          </span>
          <input
            id="csvFile"
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            disabled={isUploading}
            className="hidden"
          />
        </label>
      </div>

      {results && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Upload Results
          </h3>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-white p-4 rounded">
              <p className="text-sm text-gray-600">Successful</p>
              <p className="text-2xl font-bold text-green-600">
                {results.success}
              </p>
            </div>
            <div className="bg-white p-4 rounded">
              <p className="text-sm text-gray-600">Failed</p>
              <p className="text-2xl font-bold text-red-600">
                {results.failed}
              </p>
            </div>
          </div>

          {results.errors.length > 0 && (
            <div>
              <p className="font-medium text-gray-900 mb-2">Errors:</p>
              <div className="bg-white p-4 rounded max-h-60 overflow-y-auto">
                {results.errors.map((error: string, index: number) => (
                  <p key={index} className="text-sm text-red-600 mb-1">
                    {error}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
