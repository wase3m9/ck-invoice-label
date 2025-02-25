
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface LabelField {
  id: string;
  label: string;
  prefix?: string;
}

interface LabelFormatConfigProps {
  fields: LabelField[];
  selectedFormat: string[];
  onFormatChange: (fieldId: string, position: number) => void;
}

export const LabelFormatConfig = ({ fields, selectedFormat, onFormatChange }: LabelFormatConfigProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        Customize Label Format
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((position) => (
          <div key={position} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Position {position + 1}
            </label>
            <Select
              value={selectedFormat[position]}
              onValueChange={(value) => onFormatChange(value, position)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select field" />
              </SelectTrigger>
              <SelectContent>
                {fields.map((field) => (
                  <SelectItem 
                    key={field.id} 
                    value={field.id}
                    disabled={selectedFormat.includes(field.id)}
                  >
                    {field.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>
      <p className="text-sm text-gray-500 mt-2">
        Preview: {selectedFormat.map((fieldId, index) => {
          const field = fields.find(f => f.id === fieldId);
          return field ? `${index > 0 ? ' - ' : ''}${field.label}` : '';
        }).join('')}
      </p>
    </div>
  );
};
