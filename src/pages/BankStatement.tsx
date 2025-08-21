import { useState } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { FileList } from '@/components/FileList';
import { LabelFormatConfig } from '@/components/LabelFormatConfig';
import { useBankStatementProcessor } from '@/hooks/useBankStatementProcessor';
import { useAuth } from '@/contexts/AuthContext';

export default function BankStatement() {
  const { user } = useAuth();
  const [labelFormat, setLabelFormat] = useState<string[]>([
    'Bank Name',
    'Account Number', 
    'Statement Period'
  ]);

  const generateFileName = (details: any) => {
    const parts = labelFormat.map(field => {
      switch (field) {
        case 'Bank Name':
          return details.bank_name || 'Unknown';
        case 'Account Number':
          return details.account_number || 'Unknown';
        case 'Statement Period':
          return details.statement_period || 'Unknown';
        default:
          return '';
      }
    }).filter(part => part && part !== 'Unknown');
    
    return parts.length > 0 ? `${parts.join('_')}.xlsx` : 'bank_statement.xlsx';
  };

  const { files, handleFilesDrop, handleSave, handleDelete } = useBankStatementProcessor(
    labelFormat,
    generateFileName,
    user?.id || ''
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="text-center">
          <img 
            src="/lovable-uploads/5574e1a3-6ab7-4e5b-aaf8-f74b255fe514.png"
            alt="Logo"
            className="mx-auto h-16 w-auto mb-4"
          />
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Bank Statement to Excel Converter
          </h1>
          <p className="text-lg text-muted-foreground">
            Convert bank statement PDFs to structured Excel files
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">
                Excel File Naming Format
              </h3>
              <p className="text-sm text-muted-foreground">
                Configure how your Excel files will be named
              </p>
              <div className="grid grid-cols-1 gap-2">
                {labelFormat.map((field, index) => (
                  <div key={index} className="p-2 bg-muted rounded text-sm">
                    {index + 1}. {field}
                  </div>
                ))}
              </div>
            </div>
            
            <FileUpload onFilesDrop={handleFilesDrop} />
          </div>

          <div>
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-foreground">
                Processed Bank Statements
              </h3>
              <FileList
                files={files}
                onSave={handleSave}
                onDelete={handleDelete}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}