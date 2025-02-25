
import { useState } from 'react';
import { FileUpload } from '../components/FileUpload';
import { FileSection } from '../components/FileSection';
import { LabelFormatConfig, LabelField } from '../components/LabelFormatConfig';
import { useFileProcessor } from '../hooks/useFileProcessor';

const DEFAULT_FIELDS: LabelField[] = [
  { id: 'location', label: 'Location' },
  { id: 'supplier_name', label: 'Supplier Name' },
  { id: 'invoice_number', label: 'Invoice Number' },
  { id: 'gross_invoice_amount', label: 'Amount', prefix: '£' }
];

const DEFAULT_FORMAT = ['location', 'supplier_name', 'invoice_number', 'gross_invoice_amount'];

const Index = () => {
  const [labelFormat, setLabelFormat] = useState<string[]>(DEFAULT_FORMAT);

  const handleFormatChange = (fieldId: string, position: number) => {
    const newFormat = [...labelFormat];
    newFormat[position] = fieldId === "none" ? "" : fieldId;
    setLabelFormat(newFormat);
  };

  const generateFileName = (details: Record<string, string>) => {
    if (!details) return '';

    const parts = labelFormat.map(fieldId => {
      const field = DEFAULT_FIELDS.find(f => f.id === fieldId);
      if (!field) return '';

      const value = details[field.id];
      return field.prefix ? `${field.prefix}${value}` : value;
    });

    return parts.join(' - ') + '.pdf';
  };

  const { files, handleFilesDrop, handleSave } = useFileProcessor(labelFormat, generateFileName);

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">
            PDF Invoice Organiser
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Designed to streamline document management by automatically labelling uploaded PDF invoices in a structured and consistent format. Simply upload a PDF invoice, and the system will return the file with a correctly formatted label for easy organisation and retrieval.
          </p>
        </div>

        <div className="glass-card p-8 mb-8">
          <div className="mb-8">
            <LabelFormatConfig
              fields={DEFAULT_FIELDS}
              selectedFormat={labelFormat}
              onFormatChange={handleFormatChange}
            />
          </div>
          <FileUpload onFilesDrop={handleFilesDrop} />
        </div>

        <FileSection files={files} onSave={handleSave} />
      </div>
    </div>
  );
};

export default Index;
