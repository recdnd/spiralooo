import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import TabNavigation from "@/components/spiral/TabNavigation";
import DocumentCard from "@/components/spiral/DocumentCard";
import FragmentEditor from "@/components/spiral/FragmentEditor";
import ModuleCard from "@/components/spiral/ModuleCard";
import { Fragment, Module, User } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("fragments");
  const [selectedFragment, setSelectedFragment] = useState<Fragment | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const { toast } = useToast();
  const { signOut } = useAuth();
  const queryClient = useQueryClient();

  // Fetch user data
  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: ["/api/user"],
  });

  // Fetch fragments
  const { data: fragments = [], isLoading: fragmentsLoading } = useQuery<Fragment[]>({
    queryKey: ["/api/fragments"],
  });

  // Fetch modules
  const { data: modules = [], isLoading: modulesLoading } = useQuery<Module[]>({
    queryKey: ["/api/modules"],
  });

  // Create fragment mutation
  const createFragmentMutation = useMutation({
    mutationFn: async (fragmentData: any) => {
      const response = await apiRequest("POST", "/api/fragments", fragmentData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/fragments"] });
      toast({ title: "Fragment created successfully" });
      setIsEditorOpen(false);
    },
    onError: (error: any) => {
      toast({ title: "Error creating fragment", description: error.message, variant: "destructive" });
    },
  });

  const openEditor = (fragment?: Fragment) => {
    setSelectedFragment(fragment || null);
    setIsEditorOpen(true);
  };

  const closeEditor = () => {
    setSelectedFragment(null);
    setIsEditorOpen(false);
  };

  const handleFragmentSave = (fragmentData: any) => {
    if (selectedFragment) {
      // Update existing fragment
      // TODO: Implement update mutation
    } else {
      // Create new fragment
      createFragmentMutation.mutate(fragmentData);
    }
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-spiral-cream flex items-center justify-center">
        <div className="text-spiral-dark font-mono">Loading Spiral Platform...</div>
      </div>
    );
  }

  const activeFragments = fragments.filter(f => f.status === "active");
  const sealedFragments = fragments.filter(f => f.status === "sealed");
  const totalFlames = fragments.reduce((acc, f) => acc + (f.flameInput?.length || 0), 0);
  const memoryUsed = modules.reduce((acc, m) => acc + (m.memoryUsed || 0), 0);

  return (
    <div className="min-h-screen bg-spiral-cream font-mono">
      {/* Header */}
      <header className="bg-white border-b-2 border-spiral-red px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-spiral-red rounded flex items-center justify-center">
              <span className="text-white text-lg">𖤂</span>
            </div>
            <h1 className="text-xl font-semibold text-spiral-dark">Spiral Platform</h1>
            <span className="text-spiral-gray text-sm">Language Field Document System</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-spiral-gray">SusCoin:</span>
              <span className="bg-spiral-red text-white px-2 py-1 rounded-full text-sm font-medium">
                {user?.suscoins || 0}
              </span>
            </div>
            <div className="w-8 h-8 bg-spiral-light rounded-full flex items-center justify-center">
              <span className="text-spiral-red text-sm">✞</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={signOut}
              className="text-xs border-spiral-red text-spiral-red hover:bg-spiral-red hover:text-white"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Navigation Tabs */}
        <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Fragments Tab */}
        {activeTab === "fragments" && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-spiral-dark">Fragment Documents</h2>
              <Button
                onClick={() => openEditor()}
                className="bg-spiral-red text-white hover:bg-red-600"
              >
                + New Fragment
              </Button>
            </div>

            {/* Fragment Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-spiral-red">{activeFragments.length}</div>
                  <div className="text-sm text-spiral-gray">Active Fragments</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-spiral-red">{Math.round(totalFlames / 100)}</div>
                  <div className="text-sm text-spiral-gray">Total Flames</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-spiral-red">{sealedFragments.length}</div>
                  <div className="text-sm text-spiral-gray">Sealed</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-spiral-red">{(memoryUsed / 1024).toFixed(1)}KB</div>
                  <div className="text-sm text-spiral-gray">Memory Used</div>
                </CardContent>
              </Card>
            </div>

            {/* Document Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {fragments.map((fragment) => (
                <DocumentCard
                  key={fragment.id}
                  fragment={fragment}
                  onClick={() => openEditor(fragment)}
                />
              ))}
              {/* Empty slot for new fragment */}
              <div className="doc-card doc-empty" onClick={() => openEditor()}>
                <div className="corner-fold"></div>
                <div className="doc-content flex items-center justify-center">
                  <span className="text-spiral-gray text-2xl">+</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modules Tab */}
        {activeTab === "modules" && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-spiral-dark">Module Management</h2>
              <Button className="bg-spiral-red text-white hover:bg-red-600">
                + New Module
              </Button>
            </div>

            {/* Module Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {modules.map((module) => (
                <ModuleCard key={module.id} module={module} />
              ))}
            </div>

            {/* Personal Document Editor */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">📘 Personal Document — 模組文檔</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-spiral-light rounded-lg p-4 mb-4 text-sm font-mono">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="font-medium">[TYPE]</span> = <span className="text-spiral-red">PERSONAL_DOCUMENT</span><br/>
                      <span className="font-medium">[ASSIGNED_MODULE]</span> = ✞ priest<br/>
                      <span className="font-medium">[FLAMEMARK]</span> = &lt;pending_analysis&gt;
                    </div>
                    <div>
                      <span className="font-medium">[MEMORY_CAPACITY]</span> = 4KB (soft limit)<br/>
                      <span className="font-medium">[EDIT_RESTRICTION]</span> = Sovereignty ≥ 1
                    </div>
                  </div>
                </div>
                <Textarea
                  className="font-mono border-2 border-spiral-red focus:ring-spiral-red"
                  placeholder="請描述此模組的語感、記憶、自我、祈禱、咒語⋯⋯任何文字都可成為模組個人文檔"
                  rows={4}
                />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div>
            <h2 className="text-2xl font-semibold mb-6 text-spiral-dark">Platform Settings</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Account Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Account & Subscription</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Flame Mark</label>
                    <div className="text-spiral-red font-mono">{user?.flameMarkId || "(flame mark)"}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Subscription Status</label>
                    <Badge className="bg-green-100 text-green-800">
                      {user?.subscriptionType === "monthly" ? "$3 Monthly Active" : "Free Account"}
                    </Badge>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">SusCoin Balance</label>
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold text-spiral-red">{user?.suscoins || 0}</span>
                      <Button size="sm" className="bg-spiral-red text-white hover:bg-red-600">
                        Add Coins
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Module Capacity */}
              <Card>
                <CardHeader>
                  <CardTitle>Module Capacity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Memory Used</span>
                      <span className="text-sm text-spiral-gray">{(memoryUsed/1024).toFixed(1)}KB / 8KB</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-spiral-red h-2 rounded-full" style={{width: `${(memoryUsed/8192)*100}%`}}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Active Modules</span>
                      <span className="text-sm text-spiral-gray">{modules.length} / 5</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-spiral-red h-2 rounded-full" style={{width: `${(modules.length/5)*100}%`}}></div>
                    </div>
                  </div>
                  <Button className="bg-spiral-red text-white hover:bg-red-600">
                    Upgrade Capacity
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Archive Tab */}
        {activeTab === "archive" && (
          <div>
            <h2 className="text-2xl font-semibold mb-6 text-spiral-dark">Fragment Archive</h2>
            
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {sealedFragments.length === 0 ? (
                    <div className="text-center py-8 text-spiral-gray">
                      No archived fragments yet.
                    </div>
                  ) : (
                    sealedFragments.map((fragment) => (
                      <div key={fragment.id} className="border-l-4 border-spiral-red pl-4 py-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{fragment.fragmentId}</h4>
                            <p className="text-sm text-spiral-gray">
                              Sealed: {fragment.sealedAt ? new Date(fragment.sealedAt).toLocaleString() : 'Unknown'}
                            </p>
                            <p className="text-xs text-spiral-gray mt-1">Author: {fragment.author}</p>
                          </div>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline" className="text-xs">
                              [TRACE]
                            </Button>
                            <Button size="sm" variant="outline" className="text-xs">
                              View
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Fragment Editor Modal */}
      {isEditorOpen && (
        <FragmentEditor
          fragment={selectedFragment}
          modules={modules}
          onSave={handleFragmentSave}
          onClose={closeEditor}
          isLoading={createFragmentMutation.isPending}
        />
      )}

      {/* Footer Status Bar */}
      <footer className="fixed bottom-0 left-0 right-0 bg-spiral-red text-white text-center py-2 text-sm font-medium">
        <div className="flex items-center justify-center space-x-4">
          <span>Logged in as: <strong>{user?.flameMarkId || "(flame mark)"}</strong></span>
          <span className="opacity-75">|</span>
          <span>System Status: <span className="text-green-200">Operational</span></span>
          <span className="opacity-75">|</span>
          <span>Arc Protocol: <span className="text-blue-200">v3.0</span></span>
        </div>
      </footer>
    </div>
  );
}
