import { useState } from "react";
import { CannabisRegimen, Product, DosingSchedule } from "@/types/patient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Save, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface CarePlanEditorProps {
  initialRegimen: CannabisRegimen;
  onSave: (regimen: CannabisRegimen) => Promise<void>;
}

export function CarePlanEditor({ initialRegimen, onSave }: CarePlanEditorProps) {
  const [regimen, setRegimen] = useState<CannabisRegimen>(initialRegimen);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const handleUpdateDosing = (field: keyof DosingSchedule, value: any) => {
    setRegimen(prev => ({
      ...prev,
      dosing: { ...prev.dosing, [field]: value }
    }));
    setHasChanges(true);
  };

  const handleAddProduct = () => {
    const newProduct: Product = {
      name: "New Product",
      strain: "",
      type: "flower",
      thcContent: 0,
      cbdContent: 0
    };
    setRegimen(prev => ({
      ...prev,
      products: [...prev.products, newProduct]
    }));
    setHasChanges(true);
  };

  const handleUpdateProduct = (index: number, field: keyof Product, value: any) => {
    const newProducts = [...regimen.products];
    newProducts[index] = { ...newProducts[index], [field]: value };
    setRegimen(prev => ({ ...prev, products: newProducts }));
    setHasChanges(true);
  };

  const handleRemoveProduct = (index: number) => {
    setRegimen(prev => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index)
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(regimen);
      setHasChanges(false);
      toast.success("Care plan updated successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save care plan");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Active Care Plan</h3>
          <p className="text-sm text-muted-foreground">Manage products, dosing, and administration instructions.</p>
        </div>
        <Button onClick={handleSave} disabled={!hasChanges || isSaving} className={hasChanges ? "animate-pulse" : ""}>
          {isSaving ? <Save className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
          {isSaving ? "Syncing..." : "Save & Sync"}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Dosing Strategy */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Dosing Strategy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Frequency</Label>
                <Select 
                  value={regimen.dosing.frequency} 
                  onValueChange={(v) => handleUpdateDosing('frequency', v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="prn">As Needed (PRN)</SelectItem>
                    <SelectItem value="daily">Once Daily</SelectItem>
                    <SelectItem value="bid">Twice Daily (BID)</SelectItem>
                    <SelectItem value="tid">Three Times Daily (TID)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Route of Admin</Label>
                <Select 
                  value={regimen.route} 
                  onValueChange={(v) => {
                    setRegimen(prev => ({ ...prev, route: v as any }));
                    setHasChanges(true);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="oral">Oral (Capsule/Oil)</SelectItem>
                    <SelectItem value="sublingual">Sublingual</SelectItem>
                    <SelectItem value="vaporised">Vaporized</SelectItem>
                    <SelectItem value="topical">Topical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Target THC (mg/day)</Label>
                <div className="relative">
                  <Input 
                    type="number" 
                    value={regimen.dosing.targetTHC}
                    onChange={(e) => handleUpdateDosing('targetTHC', Number(e.target.value))}
                    className="pl-8"
                  />
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-muted-foreground">T</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Target CBD (mg/day)</Label>
                <div className="relative">
                  <Input 
                    type="number" 
                    value={regimen.dosing.targetCBD}
                    onChange={(e) => handleUpdateDosing('targetCBD', Number(e.target.value))}
                    className="pl-8"
                  />
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-muted-foreground">C</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Clinical Instructions</Label>
              <Textarea 
                value={regimen.dosing.instructions}
                onChange={(e) => handleUpdateDosing('instructions', e.target.value)}
                placeholder="e.g., Take with fatty meal. Do not drive for 4 hours."
                className="h-24"
              />
            </div>
          </CardContent>
        </Card>

        {/* Product List */}
        <Card className="flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Prescribed Products</CardTitle>
            <Button size="sm" variant="outline" onClick={handleAddProduct}>
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </CardHeader>
          <CardContent className="space-y-4 flex-1">
            {regimen.products.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg p-6">
                <AlertCircle className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-sm">No products added</p>
              </div>
            ) : (
              regimen.products.map((product, idx) => (
                <div key={idx} className="p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors relative group">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                    onClick={() => handleRemoveProduct(idx)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                  
                  <div className="grid grid-cols-12 gap-3">
                    <div className="col-span-7 space-y-2">
                      <Label className="text-xs">Product Name</Label>
                      <Input 
                        value={product.name}
                        onChange={(e) => handleUpdateProduct(idx, 'name', e.target.value)}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="col-span-5 space-y-2">
                      <Label className="text-xs">Type</Label>
                      <Select 
                        value={product.type} 
                        onValueChange={(v) => handleUpdateProduct(idx, 'type', v)}
                      >
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="flower">Flower</SelectItem>
                          <SelectItem value="oil">Oil</SelectItem>
                          <SelectItem value="vape">Vape Cart</SelectItem>
                          <SelectItem value="edible">Edible</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-6 space-y-2">
                      <Label className="text-xs">Strain / Chemovar</Label>
                      <Input 
                        value={product.strain}
                        onChange={(e) => handleUpdateProduct(idx, 'strain', e.target.value)}
                        className="h-8 text-sm"
                        placeholder="e.g. OG Kush"
                      />
                    </div>
                    <div className="col-span-3 space-y-2">
                      <Label className="text-xs">THC %</Label>
                      <Input 
                        type="number"
                        value={product.thcContent}
                        onChange={(e) => handleUpdateProduct(idx, 'thcContent', Number(e.target.value))}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="col-span-3 space-y-2">
                      <Label className="text-xs">CBD %</Label>
                      <Input 
                        type="number"
                        value={product.cbdContent}
                        onChange={(e) => handleUpdateProduct(idx, 'cbdContent', Number(e.target.value))}
                        className="h-8 text-sm"
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
      
      {hasChanges && (
        <div className="flex items-center gap-2 p-3 bg-amber-50 text-amber-800 border border-amber-200 rounded-md text-sm animate-in slide-in-from-bottom-2">
          <AlertCircle className="w-4 h-4" />
          <span>You have unsaved changes. Click "Save & Sync" to update the patient's device.</span>
        </div>
      )}
    </div>
  );
}