"use client";

import React, { useState, useRef } from "react";
import { fetchCategories, importProductsFromCsv } from "@/features/products/productActions";
import { Category } from "@/types";
import { formatPrice } from "@/utils";
import * as XLSX from "xlsx";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, ArrowRight, Table, AlertTriangle, CheckCircle2, RefreshCw, Download, FileSpreadsheet } from "lucide-react";

const SSS_FIELDS = [
  { key: "name", label: "Product Name (Required)", required: true },
  { key: "sku", label: "Product SKU (Required)", required: true },
  { key: "price", label: "Price (Required)", required: true },
  { key: "category", label: "Category (Required)", required: true },
  { key: "description", label: "Description", required: false },
  { key: "compareAtPrice", label: "Compare At Price (Discount)", required: false },
  { key: "material", label: "Material", required: false },
  { key: "care", label: "Care Instructions", required: false },
  { key: "image_url", label: "Image URL(s) (comma separated)", required: false },
  { key: "stock", label: "Stock/Inventory", required: false },
];

export default function ImportPage() {
  const [step, setStep] = useState(1); // 1: Upload, 2: Map, 3: Preview, 4: Progress/Summary
  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rawData, setRawData] = useState<any[]>([]);
  const [mappings, setMappings] = useState<Record<string, string>>({});
  const [categories, setCategories] = useState<Category[]>([]);
  
  // Validation / Preview state
  const [previewRows, setPreviewRows] = useState<any[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  
  // Import state
  const [importProgress, setImportProgress] = useState(0);
  const [importSummary, setImportSummary] = useState<{ success: number; skipped: number; errors: string[] } | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load categories for validation checks
  const loadCategories = async () => {
    try {
      const cats = await fetchCategories();
      setCategories(cats);
    } catch (err) {
      console.error("Failed to load categories", err);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (selectedFile: File) => {
    const ext = selectedFile.name.split(".").pop()?.toLowerCase();
    if (ext !== "csv" && ext !== "xlsx" && ext !== "xls") {
      alert("Please upload only .csv or .xlsx spreadsheets");
      return;
    }
    setFile(selectedFile);
    loadCategories();

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result;
      if (!data) return;

      let sheetData: any[] = [];
      if (ext === "csv") {
        // CSV Parsing
        const text = new TextDecoder().decode(data as ArrayBuffer);
        const rows = text.split(/\r?\n/).map((row) => {
          // Simple parser matching quotes / commas
          const matches = row.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
          return matches.map((val) => val.replace(/^"|"$/g, "").trim());
        });
        
        const fileHeaders = rows[0] || [];
        setHeaders(fileHeaders);
        
        sheetData = rows.slice(1).filter((r) => r.length > 0 && r.some((cell) => cell !== "")).map((r) => {
          const obj: Record<string, string> = {};
          fileHeaders.forEach((h, idx) => {
            obj[h] = r[idx] || "";
          });
          return obj;
        });
      } else {
        // Excel Spreadsheet Parsing
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        sheetData = XLSX.utils.sheet_to_json(sheet);
        if (sheetData.length > 0) {
          setHeaders(Object.keys(sheetData[0]));
        }
      }

      setRawData(sheetData);
      
      // Auto mapping headers
      const autoMap: Record<string, string> = {};
      const fileHeaders = sheetData.length > 0 ? Object.keys(sheetData[0]) : [];
      
      SSS_FIELDS.forEach((f) => {
        const matchingHeader = fileHeaders.find(
          (h) =>
            h.toLowerCase().includes(f.key.toLowerCase()) ||
            h.toLowerCase().replace(/_/g, " ").includes(f.key.toLowerCase().replace(/_/g, " "))
        );
        if (matchingHeader) {
          autoMap[f.key] = matchingHeader;
        }
      });
      setMappings(autoMap);
      setStep(2);
    };

    reader.readAsArrayBuffer(selectedFile);
  };

  const handleMapChange = (fieldKey: string, headerName: string) => {
    setMappings((prev) => ({
      ...prev,
      [fieldKey]: headerName,
    }));
  };

  const handleValidateMappings = () => {
    setIsValidating(true);
    
    // Map raw data using mappings settings
    const mapped = rawData.map((row) => {
      const obj: Record<string, any> = {};
      SSS_FIELDS.forEach((f) => {
        const fileHeader = mappings[f.key];
        obj[f.key] = fileHeader ? row[fileHeader] : undefined;
      });
      return obj;
    });

    // Run validations
    const errors: string[] = [];
    const skuSet = new Set<string>();

    const rowsWithStatus = mapped.map((row, index) => {
      const rowNum = index + 2;
      const issues: string[] = [];

      // Check required
      if (!row.name) issues.push("Product Name is missing");
      if (!row.sku) issues.push("SKU code is missing");
      if (row.sku && skuSet.has(row.sku)) issues.push(`Duplicate SKU detected: ${row.sku}`);
      if (row.sku) skuSet.add(row.sku);
      if (!row.price || isNaN(Number(row.price))) issues.push("Price must be a valid number");
      if (!row.category) issues.push("Category is missing");

      // Warning validations
      const warnings: string[] = [];
      if (!row.description) warnings.push("Description is empty");
      if (!row.image_url) warnings.push("No Image URLs supplied");

      return {
        ...row,
        rowNum,
        status: issues.length > 0 ? "error" : (warnings.length > 0 ? "warning" : "valid"),
        issues,
        warnings,
      };
    });

    setPreviewRows(rowsWithStatus);
    setStep(3);
    setIsValidating(false);
  };

  const handleTriggerImport = async () => {
    setIsImporting(true);
    setImportProgress(10);
    
    // Prepare formatted text CSV content from mapped preview rows to reuse importProductsFromCsv server action
    let csvHeader = "productName,sku,price,compareAtPrice,categoryName,description,material,careInstructions,images,inventory\n";
    let csvRows = previewRows.filter((r) => r.status !== "error").map((row) => {
      const escapedName = `"${(row.name || "").replace(/"/g, '""')}"`;
      const escapedDesc = `"${(row.description || "").replace(/"/g, '""')}"`;
      const escapedCat = `"${(row.category || "").replace(/"/g, '""')}"`;
      const escapedMat = `"${(row.material || "").replace(/"/g, '""')}"`;
      const escapedCare = `"${(row.care || "").replace(/"/g, '""')}"`;
      const imagesStr = `"${(row.image_url || "").replace(/"/g, '""')}"`;
      const stockVal = row.stock || "0";
      
      return `${escapedName},${row.sku},${row.price},${row.compareAtPrice || ""},${escapedCat},${escapedDesc},${escapedMat},${escapedCare},${imagesStr},${stockVal}`;
    }).join("\n");

    const fullCsv = csvHeader + csvRows;
    setImportProgress(40);

    try {
      const res = await importProductsFromCsv(fullCsv);
      setImportProgress(85);
      
      const skippedCount = previewRows.filter((r) => r.status === "error").length;
      
      setImportSummary({
        success: res.importedCount,
        skipped: skippedCount,
        errors: res.errors || [],
      });
      setImportProgress(100);
      setStep(4);
    } catch (err: any) {
      alert(err.message || "Failed to import rows");
    } finally {
      setIsImporting(false);
    }
  };

  const downloadTemplate = () => {
    const headersList = ["productName", "sku", "price", "compareAtPrice", "categoryName", "description", "material", "careInstructions", "images", "inventory"];
    const csvContent = "data:text/csv;charset=utf-8," + headersList.join(",") + "\n" +
      "Designer Pink Saree,PINK-SAR-01,1200,1500,Sarees,Beautiful luxury designer silk saree.,Pure Kanchipuram Silk,Dry clean only,https://images.unsplash.com/photo-1610030469983-98e550d6193c,15\n" +
      "Organza Floral Suit,ORG-SUIT-02,850,,Kurtis,Delicate organza suits with floral embroidery.,100% Organza Silk,Hand wash separately,,20";
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "sss_boutique_products_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 font-poppins text-zinc-100 bg-[#0A0A0A]">
      <div className="space-y-1">
        <span className="text-[10px] text-accent font-bold uppercase tracking-[0.2em]">Product Catalog</span>
        <h1 className="font-serif text-3xl font-light tracking-wide text-white">Bulk Spreadsheet Importer</h1>
        <div className="w-12 h-[1px] bg-accent mt-3" />
      </div>

      {/* STEP DISPLAY */}
      <div className="flex justify-between items-center max-w-xl mx-auto py-2 text-[10px] uppercase font-bold tracking-widest text-zinc-500">
        <span className={step >= 1 ? "text-accent" : ""}>1. Upload</span>
        <ArrowRight className="w-3.5 h-3.5" />
        <span className={step >= 2 ? "text-accent" : ""}>2. Map Columns</span>
        <ArrowRight className="w-3.5 h-3.5" />
        <span className={step >= 3 ? "text-accent" : ""}>3. Preview & Verify</span>
        <ArrowRight className="w-3.5 h-3.5" />
        <span className={step >= 4 ? "text-accent" : ""}>4. Finish</span>
      </div>

      {/* STEP CONTROLS */}
      <AnimatePresence mode="wait">
        {/* STEP 1: UPLOAD ZONE */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[#1C1C1C] hover:border-accent transition duration-300 bg-[#121212] p-12 text-center flex flex-col items-center space-y-4 cursor-pointer"
            >
              <Upload className="w-10 h-10 text-accent animate-bounce" />
              <div className="space-y-1">
                <p className="font-serif text-base text-white">Drag & drop your inventory file</p>
                <p className="text-zinc-500 text-[10px] uppercase tracking-wider">Supports Microsoft Excel (.xlsx) and CSV (.csv) sheets</p>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv, .xlsx, .xls"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                type="button"
                className="bg-[#1A1A1A] hover:bg-zinc-800 border border-[#262626] text-white px-4 py-2 font-bold uppercase tracking-wider text-[9px] mt-2 transition"
              >
                Browse Files
              </button>
            </div>

            <div className="flex justify-center">
              <button
                onClick={downloadTemplate}
                className="flex items-center space-x-2 text-accent hover:underline text-[10px] font-bold uppercase tracking-wider"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Sample CSV Template</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 2: MAP COLUMNS */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6 max-w-xl mx-auto"
          >
            <div className="bg-[#121212] border border-[#1C1C1C] p-6 space-y-4">
              <h3 className="font-serif text-base text-white tracking-wide flex items-center space-x-2">
                <FileSpreadsheet className="w-4 h-4 text-accent" />
                <span>Map Excel Headers to SSS Fields</span>
              </h3>
              <p className="text-zinc-400 text-xs leading-relaxed font-light">
                Please match the header columns detected in your uploaded spreadsheet to our database fields. Fields marked required must be mapped to proceed.
              </p>

              <div className="space-y-3 pt-3">
                {SSS_FIELDS.map((field) => (
                  <div key={field.key} className="flex items-center justify-between text-xs py-2.5 border-b border-[#1C1C1C]/60 last:border-0">
                    <span className="font-semibold text-zinc-300">{field.label}</span>
                    
                    <select
                      value={mappings[field.key] || ""}
                      onChange={(e) => handleMapChange(field.key, e.target.value)}
                      className="bg-[#0A0A0A] border border-[#1C1C1C] rounded-none px-3 py-2 text-xs focus:outline-none focus:border-accent text-white w-52"
                    >
                      <option value="">-- Ignore Field --</option>
                      {headers.map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2 border border-[#1C1C1C] hover:bg-zinc-900 transition text-[10px] uppercase font-bold tracking-wider"
              >
                Back to Upload
              </button>
              <button
                onClick={handleValidateMappings}
                className="px-5 py-2.5 bg-accent text-foreground hover:bg-accent/90 transition text-[10px] uppercase font-bold tracking-wider"
              >
                Validate & Preview Mapped Rows
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 3: PREVIEW & VALIDATION */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            <div className="bg-[#121212] border border-[#1C1C1C] p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-serif text-base text-white tracking-wide flex items-center space-x-2">
                  <Table className="w-4 h-4 text-accent" />
                  <span>Validation Preview (First 10 Mapped Rows)</span>
                </h3>
                <div className="flex space-x-4 text-[10px] font-bold uppercase tracking-wider">
                  <span className="text-emerald-400">Valid: {previewRows.filter(r => r.status === "valid").length}</span>
                  <span className="text-amber-400">Warnings: {previewRows.filter(r => r.status === "warning").length}</span>
                  <span className="text-rose-455">Errors: {previewRows.filter(r => r.status === "error").length}</span>
                </div>
              </div>

              {/* TABLE */}
              <div className="overflow-x-auto border border-[#1C1C1C] mt-4">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#1C1C1C] text-[9px] text-zinc-500 uppercase tracking-widest font-bold bg-[#0C0C0C]">
                      <th className="p-3">Row</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Product Name</th>
                      <th className="p-3">SKU</th>
                      <th className="p-3">Category</th>
                      <th className="p-3 text-right">Price</th>
                      <th className="p-3">Issues / Warnings</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1C1C1C]">
                    {previewRows.slice(0, 10).map((row) => (
                      <tr key={row.rowNum} className="hover:bg-[#161616] transition">
                        <td className="p-3 font-mono text-zinc-500">#{row.rowNum}</td>
                        <td className="p-3">
                          <span className={`px-1.5 py-0.5 border text-[8px] uppercase tracking-wider font-semibold rounded-none ${
                            row.status === "error"
                              ? "bg-rose-950/20 text-rose-455 border-rose-900/30"
                              : row.status === "warning"
                              ? "bg-amber-950/20 text-amber-400 border-amber-900/30"
                              : "bg-emerald-950/20 text-emerald-400 border-emerald-900/30"
                          }`}>
                            {row.status}
                          </span>
                        </td>
                        <td className="p-3 text-white font-medium truncate max-w-[155px]">{row.name || "---"}</td>
                        <td className="p-3 font-mono text-zinc-400">{row.sku || "---"}</td>
                        <td className="p-3 text-zinc-400">{row.category || "---"}</td>
                        <td className="p-3 text-right font-semibold text-accent">{row.price ? formatPrice(Number(row.price)) : "---"}</td>
                        <td className="p-3 max-w-[200px] truncate text-[10px]">
                          {row.issues.length > 0 && <span className="text-rose-455 block">{row.issues.join(", ")}</span>}
                          {row.warnings.length > 0 && <span className="text-amber-400 block">{row.warnings.join(", ")}</span>}
                          {row.status === "valid" && <span className="text-emerald-400">Ready to import</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <button
                onClick={() => setStep(2)}
                className="px-4 py-2 border border-[#1C1C1C] hover:bg-zinc-900 transition text-[10px] uppercase font-bold tracking-wider"
              >
                Back to Mappings
              </button>
              
              <button
                disabled={isImporting}
                onClick={handleTriggerImport}
                className="px-6 py-2.5 bg-accent text-foreground hover:bg-accent/90 transition text-[10px] uppercase font-bold tracking-wider flex items-center space-x-2 shadow-luxury"
              >
                {isImporting ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                )}
                <span>Import valid products</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 4: IMPORT PROGRESS & SUMMARY */}
        {step === 4 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6 max-w-md mx-auto"
          >
            {isImporting ? (
              <div className="bg-[#121212] border border-[#1C1C1C] p-8 text-center space-y-4">
                <RefreshCw className="w-10 h-10 text-accent animate-spin mx-auto" />
                <div className="space-y-1">
                  <h3 className="font-serif text-lg text-white">Importing Catalog...</h3>
                  <p className="text-zinc-500 text-[10px] uppercase tracking-wider">Batches products creation queries in progress</p>
                </div>
                
                {/* Progress bar */}
                <div className="w-full bg-[#0A0A0A] h-2 border border-[#1C1C1C] mt-4 relative overflow-hidden">
                  <motion.div
                    className="bg-accent h-full absolute left-0 top-0"
                    animate={{ width: `${importProgress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
            ) : (
              <div className="bg-[#121212] border border-[#1C1C1C] p-6 space-y-6">
                <div className="text-center space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-accent mx-auto" />
                  <h3 className="font-serif text-xl text-white">Catalog Import Completed</h3>
                  <div className="w-12 h-[1px] bg-accent mx-auto mt-2" />
                </div>

                <div className="space-y-3 pt-3 border-t border-[#1C1C1C] text-xs">
                  <div className="flex justify-between items-center py-1.5 border-b border-[#1C1C1C]/40">
                    <span className="text-zinc-400 font-medium">Successfully Imported:</span>
                    <span className="font-bold text-white text-sm">{importSummary?.success} Products</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-[#1C1C1C]/40">
                    <span className="text-zinc-400 font-medium">Skipped (Errors):</span>
                    <span className={`font-bold text-sm ${importSummary?.skipped && importSummary.skipped > 0 ? "text-rose-455" : "text-white"}`}>
                      {importSummary?.skipped} Products
                    </span>
                  </div>
                </div>

                {importSummary?.errors && importSummary.errors.length > 0 && (
                  <div className="space-y-2 text-xs">
                    <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest block">Details (Import Warnings)</span>
                    <div className="bg-[#0A0A0A] border border-[#1F1F1F] p-3 max-h-40 overflow-y-auto text-[10px] space-y-1.5 text-zinc-400 font-mono">
                      {importSummary.errors.map((err, idx) => (
                        <p key={idx} className="flex items-start space-x-1">
                          <AlertTriangle className="w-3 h-3 text-amber-500 flex-shrink-0 mt-0.5" />
                          <span>{err}</span>
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-center border-t border-[#1C1C1C] pt-5">
                  <button
                    onClick={() => {
                      setStep(1);
                      setFile(null);
                      setRawData([]);
                      setHeaders([]);
                    }}
                    className="px-5 py-2.5 bg-accent text-foreground hover:bg-accent/90 transition text-[10px] uppercase font-bold tracking-wider w-full shadow-luxury"
                  >
                    Import Another File
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
