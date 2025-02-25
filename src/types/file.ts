
import { ProcessingState } from '../components/ProcessingStatus';

export interface ProcessedFile {
  name: string;
  size: number;
  status: ProcessingState;
  downloadUrl?: string;
  details?: {
    location: string;
    supplier_name: string;
    invoice_number: string;
    gross_invoice_amount: string;
  };
  filePath?: string;
}
