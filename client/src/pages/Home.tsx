import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2, Share2, Edit2, Download, Moon, Sun, FileJson, FileText, Copy } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

// 🎨 Modern Minimalist with Playful Accents
// This page displays a height comparison visualization with vibrant silhouettes
// and a light blue background for the comparison area

interface Person {
  id: string;
  name: string;
  height: number; // in cm
  color: string;
  gender: 'male' | 'female' | 'child';
}

const GENDER_COLORS = {
  male: '#5B9BD5',
  female: '#E74C8C',
  child: '#70AD47',
};

const PRESET_PEOPLE = [
  { name: 'Miley Cyrus', height: 165, color: '#5BF92A', gender: 'female' as const },
  { name: 'Katy Perry', height: 170, color: '#D8B041', gender: 'female' as const },
  { name: 'Taylor Swift', height: 180, color: '#930109', gender: 'female' as const },
  { name: 'Rihanna', height: 173, color: '#93e006', gender: 'female' as const },
  { name: 'Shakira', height: 157, color: '#8780F2', gender: 'female' as const },
];

export default function Home() {
  const [people, setPeople] = useState<Person[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [newHeight, setNewHeight] = useState('');
  const [newColor, setNewColor] = useState('#5B9BD5');
  const [newGender, setNewGender] = useState<'male' | 'female' | 'child'>('female');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [importUrl, setImportUrl] = useState('');
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [importError, setImportError] = useState('');
  const { theme, toggleTheme } = useTheme();
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);

  // 🌙 Load theme preference from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('height-comparison-theme') || 'light';
    if (savedTheme === 'dark' && theme !== 'dark' && toggleTheme) {
      toggleTheme();
    }
  }, []);

  // 📱 Load from URL parameters on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const loadedPeople: Person[] = [];
    
    let index = 0;
    while (params.has(`person${index}`)) {
      const personData = params.get(`person${index}`);
      if (personData) {
        const parts = personData.split('-');
        if (parts.length >= 3) {
          const gender = parts[0].includes('1') ? 'female' : parts[0].includes('2') ? 'male' : 'child';
          const name = parts[1];
          const height = parseFloat(parts[2]);
          const color = parts[3] || '#5B9BD5';
          
          loadedPeople.push({
            id: `person-${index}`,
            name: decodeURIComponent(name),
            height,
            color,
            gender,
          });
        }
      }
      index++;
    }
    
    if (loadedPeople.length > 0) {
      setPeople(loadedPeople);
    }
  }, []);

  // 🔗 Update URL when people change
  useEffect(() => {
    if (people.length > 0) {
      const params = new URLSearchParams();
      people.forEach((person, index) => {
        const genderCode = person.gender === 'female' ? '1' : person.gender === 'male' ? '2' : '3';
        const personStr = `${genderCode}-${encodeURIComponent(person.name)}-${person.height}-${person.color}`;
        params.set(`person${index}`, personStr);
      });
      
      const newUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.replaceState({}, '', newUrl);
    }
  }, [people]);

  const addPerson = () => {
    if (newName && newHeight) {
      const newPerson: Person = {
        id: `person-${Date.now()}`,
        name: newName,
        height: parseFloat(newHeight),
        color: newColor,
        gender: newGender,
      };
      
      if (editingId) {
        setPeople(people.map(p => p.id === editingId ? newPerson : p));
        setEditingId(null);
      } else {
        setPeople([...people, newPerson]);
      }
      
      setNewName('');
      setNewHeight('');
      setNewColor('#5B9BD5');
      setNewGender('female');
      setIsDialogOpen(false);
    }
  };

  const removePerson = (id: string) => {
    setPeople(people.filter(p => p.id !== id));
  };

  const editPerson = (person: Person) => {
    setEditingId(person.id);
    setNewName(person.name);
    setNewHeight(person.height.toString());
    setNewColor(person.color);
    setNewGender(person.gender);
    setIsDialogOpen(true);
  };

  const addPreset = (preset: typeof PRESET_PEOPLE[0]) => {
    const newPerson: Person = {
      id: `person-${Date.now()}`,
      name: preset.name,
      height: preset.height,
      color: preset.color,
      gender: preset.gender,
    };
    setPeople([...people, newPerson]);
  };

  // 🔗 Parse multmetric.com URL and extract people data
  const parseMultmetricUrl = (url: string) => {
    try {
      setImportError('');
      const urlObj = new URL(url);
      const params = urlObj.searchParams;
      const importedPeople: Person[] = [];
      
      let index = 0;
      while (params.has(`person${index}`)) {
        const personData = params.get(`person${index}`);
        if (personData) {
          const parts = personData.split('-');
          if (parts.length >= 3) {
            // 🧬 Parse gender code: 1=female, 2=male, 3=child
            const genderCode = parts[0];
            const gender = genderCode.includes('1') ? 'female' : genderCode.includes('2') ? 'male' : 'child';
            const name = decodeURIComponent(parts[1]);
            const height = parseFloat(parts[2]);
            const color = parts[3] || '#5B9BD5';
            
            importedPeople.push({
              id: `person-${Date.now()}-${index}`,
              name,
              height,
              color,
              gender,
            });
          }
        }
        index++;
      }
      
      if (importedPeople.length === 0) {
        setImportError('❌ Nenhuma pessoa encontrada na URL. Verifica se é um link válido do multmetric.com!');
        return;
      }
      
      // 🎉 Add imported people to existing list
      setPeople([...people, ...importedPeople]);
      setImportUrl('');
      setIsImportDialogOpen(false);
    } catch (error) {
      setImportError('❌ Erro ao processar a URL. Verifica se é um link válido!');
    }
  };

  const shareResults = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: 'Height Comparison',
        url,
      });
    } else {
      navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
  };

  // 📋 Copy multmetric URL format to clipboard for sharing
  const copyMultmetricFormat = () => {
    const multmetricUrl = window.location.href.replace(
      window.location.origin,
      'https://multmetric.com'
    );
    navigator.clipboard.writeText(multmetricUrl);
    alert('Multmetric URL copied!');
  };

  // 🌙 Handle theme toggle and save to localStorage
  const handleThemeToggle = () => {
    if (toggleTheme) {
      toggleTheme();
      const newTheme = theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('height-comparison-theme', newTheme);
    }
  };

  // 📊 Export as CSV
  const exportAsCSV = () => {
    if (people.length === 0) return;
    const headers = ['Name', 'Height (cm)', 'Gender', 'Color'];
    const rows = people.map(p => [p.name, p.height, p.gender, p.color]);
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'height-comparison.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // 📋 Export as JSON
  const exportAsJSON = () => {
    if (people.length === 0) return;
    const json = JSON.stringify(people, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'height-comparison.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  // 🔗 Copy URL code (multmetric format)
  const copyUrlCode = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    alert('URL copied to clipboard!');
  };

  // 📏 Calculate scale: 1cm = 2.02px (based on reference)
  const maxHeight = Math.max(...people.map(p => p.height), 200);
  const scale = 400 / maxHeight;

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-br from-white via-blue-50 to-indigo-50'}`}>
      {/* 🎨 Header Section */}
      <header className={`border-b ${theme === 'dark' ? 'border-gray-700 bg-gray-800/80' : 'border-gray-200 bg-white/80'} backdrop-blur-sm sticky top-0 z-40`}>
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-4xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`} style={{ fontFamily: "'Poppins', sans-serif" }}>
                Height Comparison 📏
              </h1>
              <p className={theme === 'dark' ? 'text-gray-400 mt-1' : 'text-gray-600 mt-1'}>Compare heights visually</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    className="gap-2 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
                  >
                    <Download size={18} />
                    Import URL
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>📥 Import from multmetric.com</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Multmetric URL</label>
                      <Input
                        value={importUrl}
                        onChange={(e) => setImportUrl(e.target.value)}
                        placeholder="https://multmetric.com/?person0=..."
                        className="mt-1"
                      />
                      {importError && (
                        <p className="text-sm text-red-500 mt-2">{importError}</p>
                      )}
                    </div>
                    <Button
                      onClick={() => parseMultmetricUrl(importUrl)}
                      disabled={!importUrl}
                      className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
                    >
                      Import People
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              
              <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    disabled={people.length === 0}
                    className="gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                  >
                    <FileText size={18} />
                    Export
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>📤 Export Comparison</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3">
                    <Button
                      onClick={exportAsCSV}
                      className="w-full justify-start gap-2 bg-blue-500 hover:bg-blue-600"
                    >
                      <FileText size={18} />
                      Export as CSV
                    </Button>
                    <Button
                      onClick={exportAsJSON}
                      className="w-full justify-start gap-2 bg-indigo-500 hover:bg-indigo-600"
                    >
                      <FileJson size={18} />
                      Export as JSON
                    </Button>
                    <Button
                      onClick={copyUrlCode}
                      className="w-full justify-start gap-2 bg-purple-500 hover:bg-purple-600"
                    >
                      <Copy size={18} />
                      Copy URL Code
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              
              <Button
                onClick={shareResults}
                disabled={people.length === 0}
                className="gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              >
                <Share2 size={18} />
                Share
              </Button>
              
              <Button
                onClick={handleThemeToggle}
                className="gap-2 bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700"
              >
                {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                {theme === 'light' ? 'Dark' : 'Light'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* 🎯 Controls Section */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {/* Add/Edit Dialog */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setEditingId(null);
                  setNewName('');
                  setNewHeight('');
                  setNewColor('#5B9BD5');
                  setNewGender('female');
                }}
                className="gap-2 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 h-12 text-base"
              >
                <Plus size={20} />
                Add Person
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{editingId ? '✏️ Edit Person' : '➕ Add Person'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Name</label>
                  <Input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Person name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Height (cm)</label>
                  <Input
                    type="number"
                    value={newHeight}
                    onChange={(e) => setNewHeight(e.target.value)}
                    placeholder="170"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Color</label>
                  <div className="flex gap-2 mt-1">
                    <input
                      type="color"
                      value={newColor}
                      onChange={(e) => setNewColor(e.target.value)}
                      className="w-12 h-10 rounded cursor-pointer"
                    />
                    <Input
                      value={newColor}
                      onChange={(e) => setNewColor(e.target.value)}
                      placeholder="#5B9BD5"
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Gender</label>
                  <select
                    value={newGender}
                    onChange={(e) => setNewGender(e.target.value as 'male' | 'female' | 'child')}
                    className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                  >
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="child">Child</option>
                  </select>
                </div>
                <Button
                  onClick={addPerson}
                  disabled={!newName || !newHeight}
                  className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
                >
                  {editingId ? 'Update' : 'Add'} Person
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Preset People */}
          <div className="lg:col-span-3">
            <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Quick Add:</p>
            <div className="flex flex-wrap gap-2">
              {PRESET_PEOPLE.map((preset) => (
                <Button
                  key={preset.name}
                  onClick={() => addPreset(preset)}
                  variant="outline"
                  className="text-xs"
                >
                  + {preset.name}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* 📊 Comparison Area */}
        {people.length > 0 ? (
          <Card className={`overflow-hidden shadow-lg border-0 ${theme === 'dark' ? 'bg-gray-800' : ''}`}>
            {/* 💙 Light Blue Background for Comparison Box */}
            <div
              className="relative p-8 min-h-96"
              style={{
                background: theme === 'dark' 
                  ? 'linear-gradient(135deg, #1f2937 0%, #111827 100%)'
                  : 'linear-gradient(135deg, #e6f2f9 0%, #d4e9f7 100%)',
                borderRadius: '12px',
              }}
            >
              {/* Height Scale */}
              <div className={`absolute left-8 top-8 bottom-8 flex flex-col justify-between text-xs font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                {[200, 150, 100, 50, 0].map((height) => (
                  <div key={height} className="relative">
                    <span>{height}cm</span>
                  </div>
                ))}
              </div>

              {/* 🎯 Dotted Grid Lines */}
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                style={{ opacity: 0.2 }}
              >
                {[200, 150, 100, 50, 0].map((cm) => {
                  const yPos = ((200 - cm) / 200) * 100;
                  return (
                    <line
                      key={`gridline-${cm}`}
                      x1="0%"
                      y1={`${yPos}%`}
                      x2="100%"
                      y2={`${yPos}%`}
                      stroke={theme === 'dark' ? '#fff' : '#999'}
                      strokeWidth="1"
                      strokeDasharray="5,5"
                    />
                  );
                })}
              </svg>

              {/* Silhouettes Container */}
              <div
                className="flex items-flex-end justify-center gap-4 ml-16 h-96 relative"
                style={{
                  alignItems: 'flex-end',
                }}
              >
                {people.map((person) => (
                  <div key={person.id} className="flex flex-col items-center gap-2 group">
                    {/* Person Info */}
                    <div className="text-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className={`font-bold text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{person.name}</p>
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{person.height}cm</p>
                    </div>

                    {/* Silhouette */}
                    <div
                      className="rounded-full transition-transform hover:scale-110 cursor-pointer"
                      style={{
                        width: `${Math.max(40, (person.height / maxHeight) * 80)}px`,
                        height: `${person.height * scale}px`,
                        backgroundColor: person.color,
                        opacity: 0.9,
                        boxShadow: `0 4px 12px ${person.color}40`,
                      }}
                      onClick={() => editPerson(person)}
                    />

                    {/* Label Below */}
                    <div className="text-center mt-2">
                      <p className={`font-semibold text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{person.name}</p>
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{person.height}cm</p>
                      <Button
                        onClick={() => removePerson(person.id)}
                        variant="ghost"
                        size="sm"
                        className="mt-1 h-6 text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Baseline */}
              <div className={`absolute bottom-8 left-8 right-8 border-t-2 ${theme === 'dark' ? 'border-gray-600' : 'border-gray-400'} opacity-50`} />
            </div>
          </Card>
        ) : (
          <Card className={`p-12 text-center border-2 border-dashed ${theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-300'}`}>
            <div className="text-center">
              <img
                src="https://d2xsxph8kpxj0f.cloudfront.net/310519663120103123/JHEdbNVPzBsuL9JgseAugh/add-person-illustration-EAjKKS5Ha9ccweWZnLViXD.webp"
                alt="Add people"
                className="w-32 h-32 mx-auto mb-4 opacity-80"
              />
              <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-2`}>No people added yet</h2>
              <p className={theme === 'dark' ? 'text-gray-400 mb-4' : 'text-gray-600 mb-4'}>Add people to start comparing heights!</p>
            </div>
          </Card>
        )}

        {/* 📊 Statistics */}
        {people.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <Card className={`p-6 ${theme === 'dark' ? 'bg-gray-800' : ''}`}>
              <h3 className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Tallest</h3>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {people.reduce((max, p) => p.height > max.height ? p : max).name}
              </p>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {Math.max(...people.map(p => p.height))}cm
              </p>
            </Card>

            <Card className={`p-6 ${theme === 'dark' ? 'bg-gray-800' : ''}`}>
              <h3 className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Shortest</h3>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {people.reduce((min, p) => p.height < min.height ? p : min).name}
              </p>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {Math.min(...people.map(p => p.height))}cm
              </p>
            </Card>

            <Card className={`p-6 ${theme === 'dark' ? 'bg-gray-800' : ''}`}>
              <h3 className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Average</h3>
              <p className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {(people.reduce((sum, p) => sum + p.height, 0) / people.length).toFixed(1)}cm
              </p>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {people.length} people
              </p>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
