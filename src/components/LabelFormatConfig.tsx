
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export interface LabelField {
  id: string;
  label: string;
  prefix?: string;
  isCustom?: boolean;
}

interface LabelFormatConfigProps {
  fields: LabelField[];
  selectedFormat: string[];
  onFormatChange: (fieldId: string, position: number) => void;
  onAddCustomField: (field: LabelField) => void;
}

export const LabelFormatConfig = ({ 
  fields, 
  selectedFormat, 
  onFormatChange,
  onAddCustomField 
}: LabelFormatConfigProps) => {
  const [customFieldLabel, setCustomFieldLabel] = useState("");
  const [customFieldId, setCustomFieldId] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activePosition, setActivePosition] = useState<number | null>(null);

  const handleAddCustomField = () => {
    if (customFieldLabel && customFieldId && activePosition !== null) {
      const newField = {
        id: customFieldId.toLowerCase().replace(/\s+/g, '_'),
        label: customFieldLabel,
        isCustom: true
      };
      onAddCustomField(newField);
      onFormatChange(newField.id, activePosition);
      setCustomFieldLabel("");
      setCustomFieldId("");
      setDialogOpen(false);
      setActivePosition(null);
    }
  };

  const handleCustomFieldSelect = (position: number) => {
    setActivePosition(position);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">
        Customise Label Format
      </h3>
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Custom Search Field</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Field Label
              </label>
              <Input
                placeholder="e.g., Purchase Order Number"
                value={customFieldLabel}
                onChange={(e) => setCustomFieldLabel(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Search Term
              </label>
              <Input
                placeholder="e.g., PO Number, Order ID"
                value={customFieldId}
                onChange={(e) => setCustomFieldId(e.target.value)}
              />
              <p className="text-sm text-gray-500">
                Enter the terms you want OpenAI to look for in the document
              </p>
            </div>
            <Button 
              onClick={handleAddCustomField}
              disabled={!customFieldLabel || !customFieldId}
              className="w-full"
            >
              Add Field
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((position) => (
          <div key={position} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Position {position + 1}
            </label>
            <Select
              value={selectedFormat[position] || "none"}
              onValueChange={(value) => {
                if (value === "custom") {
                  handleCustomFieldSelect(position);
                } else {
                  onFormatChange(value, position);
                }
              }}
            >
              <SelectTrigger className="w-full bg-white/50 backdrop-blur-sm">
                <SelectValue placeholder="Select field" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">
                  (None)
                </SelectItem>
                <SelectItem value="custom">
                  + Add Custom Field
                </SelectItem>
                {fields.map((field) => (
                  <SelectItem 
                    key={field.id} 
                    value={field.id}
                  >
                    {field.label} {field.isCustom && "(Custom)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>
      <p className="text-sm text-gray-500 mt-2">
        Preview: {selectedFormat
          .filter(fieldId => fieldId && fieldId !== "none")
          .map((fieldId, index) => {
            const field = fields.find(f => f.id === fieldId);
            return field ? `${index > 0 ? ' - ' : ''}${field.label}` : '';
          }).join('')}
      </p>
    </div>
  );
};
