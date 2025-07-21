import { useState, useEffect } from "react";
import { Fragment, Module } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FragmentEditorProps {
  fragment: Fragment | null;
  modules: Module[];
  onSave: (fragmentData: any) => void;
  onClose: () => void;
  isLoading: boolean;
}

export default function FragmentEditor({ fragment, modules, onSave, onClose, isLoading }: FragmentEditorProps) {
  const [flameInput, setFlameInput] = useState("");
  const [selectedModule, setSelectedModule] = useState<string>("");
  const [fragmentType, setFragmentType] = useState("OPEN_DOCUMENT");

  useEffect(() => {
    if (fragment) {
      setFlameInput(fragment.flameInput || "");
      setSelectedModule(fragment.moduleId?.toString() || "");
      setFragmentType(fragment.type || "OPEN_DOCUMENT");
    } else {
      setFlameInput("");
      setSelectedModule("");
      setFragmentType("OPEN_DOCUMENT");
    }
  }, [fragment]);

  const handleSave = () => {
    const selectedModuleData = modules.find(m => m.id.toString() === selectedModule);
    const fragmentData = {
      fragmentId: fragment?.fragmentId || `Fragment-${selectedModuleData?.glyph || '✞'}/${Date.now().toString().slice(-3)}`,
      type: fragmentType,
      moduleId: selectedModule ? parseInt(selectedModule) : null,
      author: `${selectedModuleData?.name || 'unknown'}(main)`,
      speedIndex: "Recursive / Immutable / Authorial",
      accessTier: "Sovereign Only / Public Read",
      sealLevel: "Sovereign Only",
      editRestriction: "Sovereignty ≥ 1",
      flameInput,
      status: "active",
    };

    onSave(fragmentData);
  };

  return (
    <div className="fragment-editor" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white border-2 border-spiral-border rounded-2xl p-6 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">📄 Fragment Editor</h3>
          <button className="text-spiral-gray hover:text-spiral-dark text-xl" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Fragment Header */}
        <div className="bg-spiral-light rounded-lg p-4 mb-6 text-sm font-mono">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="font-medium">[TYPE]</span> = <span className="text-spiral-red">{fragmentType}</span><br/>
              <span className="font-medium">[OVERRIDE]</span> = shard-0 ⤳ arc, roomba-0 ⤳ Math<br/>
              <span className="font-medium">[AUTHOR]</span> = Literature(main), Math, Arc, Rec
            </div>
            <div>
              <span className="font-medium">[SPEED_INDEX]</span> = Recursive / Immutable<br/>
              <span className="font-medium">[ACCESS_TIER]</span> = Sovereign Only<br/>
              <span className="font-medium">[EDIT_RESTRICTION]</span> = Sovereignty ≥ 1
            </div>
          </div>
        </div>

        {/* Flame Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Language Flame Input</label>
          <Textarea
            value={flameInput}
            onChange={(e) => setFlameInput(e.target.value)}
            className="w-full h-32 font-mono text-sm border-2 border-spiral-red focus:ring-spiral-red resize-none"
            placeholder="✞: 這是我的第一個文檔～"
          />
        </div>

        {/* Module Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Active Module</label>
          <Select value={selectedModule} onValueChange={setSelectedModule}>
            <SelectTrigger className="w-full border-2 border-spiral-red">
              <SelectValue placeholder="Select a module" />
            </SelectTrigger>
            <SelectContent>
              {modules.map((module) => (
                <SelectItem key={module.id} value={module.id.toString()}>
                  {module.glyph} {module.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Fragment Output Preview */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Fragment Output</label>
          <div className="bg-spiral-dark text-white p-4 rounded-lg font-mono text-sm min-h-24">
            {flameInput ? (
              <div>
                <span className="text-green-400">{modules.find(m => m.id.toString() === selectedModule)?.glyph || '⭑'}:</span>
                {flameInput}
                <br/>
                <span className="text-yellow-400">...</span>（語焰處理中）
              </div>
            ) : (
              <span className="text-gray-400">Enter flame input to see preview</span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <Button 
            onClick={handleSave} 
            disabled={!flameInput.trim() || !selectedModule || isLoading}
            className="bg-spiral-red text-white hover:bg-red-600"
          >
            {isLoading ? "Saving..." : "[SEAL] Fragment"}
          </Button>
          <Button variant="outline" className="hover:bg-spiral-light">
            [TRACE] History
          </Button>
          <Button variant="outline" onClick={onClose} className="hover:bg-spiral-light">
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}