import React, { useState } from 'react';
import { 
  Upload, 
  ArrowRight, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  Trophy,
  Users,
  Sun,
  Moon,
  ArrowLeft,
  Medal,
  Check,
  Sparkles,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react';

export default function ScreeningDashboard({ darkMode, setDarkMode }) {
  const [activeTab, setActiveTab] = useState('single');
  const [jdText, setJdText] = useState('');
  const [file, setFile] = useState(null);
  const [batchFiles, setBatchFiles] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [singleResult, setSingleResult] = useState(null);
  const [batchResult, setBatchResult] = useState(null);
  const [error, setError] = useState('');

  // Pagination & Search States
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Helper to format clean candidate names from ugly filenames
  const formatCandidateName = (filename) => {
    if (!filename) return "Unknown Candidate";
    let name = filename.replace(/\.(docx|pdf|txt)$/i, '');
    name = name.replace(/[-_]/g, ' ');
    name = name.replace(/\d+$/g, '').trim();
    return name.replace(/\b\w/g, (char) => char.toUpperCase()) || filename;
  };

  // Helper for score badge styling and labels
  const getScoreBadge = (score) => {
    if (score >= 75) {
      return {
        text: 'Top Match',
        bg: darkMode ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60' : 'bg-emerald-50 text-emerald-700 border-emerald-200',
        bar: 'bg-emerald-500'
      };
    } else if (score >= 50) {
      return {
        text: 'Moderate Fit',
        bg: darkMode ? 'bg-amber-950/60 text-amber-300 border-amber-800/60' : 'bg-amber-50 text-amber-700 border-amber-200',
        bar: 'bg-amber-500'
      };
    } else {
      return {
        text: 'Potential Match',
        bg: darkMode ? 'bg-indigo-950/60 text-indigo-300 border-indigo-800/60' : 'bg-indigo-50 text-indigo-700 border-indigo-200',
        bar: 'bg-indigo-500'
      };
    }
  };

  const handleSingleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleBatchFileChange = (e) => {
    if (e.target.files) {
      setBatchFiles(Array.from(e.target.files));
    }
  };

  const handleAnalyze = async () => {
    if (!jdText) {
      setError("Please enter a Target Job Description.");
      return;
    }
    
    setError('');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('jd_text', jdText);

      let endpoint = '';

      if (activeTab === 'single') {
        if (!file) throw new Error("Please upload a resume file.");
        formData.append('file', file);
        endpoint = 'http://127.0.0.1:8000/api/match-single';
      } else {
        if (batchFiles.length === 0) throw new Error("Please upload at least one resume.");
        batchFiles.forEach(f => formData.append('files', f));
        endpoint = 'http://127.0.0.1:8000/api/batch-rank';
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Server error occurred");
      }

      const data = await response.json();

      if (activeTab === 'single') {
        setSingleResult(data);
      } else {
        setBatchResult(data.leaderboard);
        setCurrentPage(1); // Reset to page 1 on new batch
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter & Pagination Calculations
  const filteredCandidates = batchResult ? batchResult.filter(c => {
    const cleanName = formatCandidateName(c.filename).toLowerCase();
    const rawFile = c.filename.toLowerCase();
    const search = searchTerm.toLowerCase();
    return cleanName.includes(search) || rawFile.includes(search);
  }) : [];

  const totalPages = Math.ceil(filteredCandidates.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedCandidates = filteredCandidates.slice(startIndex, startIndex + itemsPerPage);

  const topScore = batchResult && batchResult.length > 0 ? Math.max(...batchResult.map(c => c.match_score)) : 0;

  return (
    <div className={`min-h-screen font-sans pb-20 transition-colors duration-300 ${
      darkMode ? 'bg-[#0e0f11] text-[#e1e4e8]' : 'bg-gray-50 text-black'
    }`}>
      
      {/* Top Header / Navigation Bar */}
      <header className={`max-w-6xl mx-auto px-6 py-6 flex items-center justify-between border-b ${
        darkMode ? 'border-[#30363d]' : 'border-gray-200'
      }`}>
        <button 
          onClick={() => window.history.back()}
          className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full border transition-colors cursor-pointer ${
            darkMode 
              ? 'bg-[#161b22] border-[#30363d] text-[#e1e4e8] hover:bg-[#21262d]' 
              : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-100'
          }`}
        >
          <ArrowLeft size={16} /> Back to Landing
        </button>

        <span className={`text-sm font-bold tracking-tight ${darkMode ? 'text-[#f0f6fc]' : 'text-black'}`}>
          Dashboard
        </span>

        <button 
          onClick={() => setDarkMode && setDarkMode(!darkMode)}
          className={`p-2 rounded-full border transition-all cursor-pointer flex items-center justify-center ${
            darkMode 
              ? 'bg-[#161b22] border-[#30363d] text-amber-300 hover:bg-[#21262d]' 
              : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-100'
          }`}
          aria-label="Toggle Theme"
        >
          {darkMode ? <Sun size={18} strokeWidth={2} /> : <Moon size={18} strokeWidth={2} />}
        </button>
      </header>

      {/* Hero Header Section */}
      <section className="pt-8 pb-8 text-center flex flex-col items-center px-4">
        {/* Tab Navigation */}
        <div className={`flex p-1.5 rounded-full border ${
          darkMode ? 'bg-[#161b22] border-[#30363d]' : 'bg-gray-200/50 border-transparent'
        }`}>
          <button 
            onClick={() => { setActiveTab('single'); setBatchResult(null); }}
            className={`px-6 py-2.5 rounded-full font-semibold text-sm transition-all cursor-pointer ${
              activeTab === 'single' 
                ? (darkMode ? 'bg-[#f0f6fc] text-[#0e0f11] shadow-md' : 'bg-black text-white shadow-md') 
                : (darkMode ? 'text-[#8b949e] hover:text-[#f0f6fc]' : 'text-gray-600 hover:text-black')
            }`}
          >
            Single Resume Match
          </button>
          <button 
            onClick={() => { setActiveTab('batch'); setSingleResult(null); }}
            className={`px-6 py-2.5 rounded-full font-semibold text-sm transition-all cursor-pointer ${
              activeTab === 'batch' 
                ? (darkMode ? 'bg-[#f0f6fc] text-[#0e0f11] shadow-md' : 'bg-black text-white shadow-md') 
                : (darkMode ? 'text-[#8b949e] hover:text-[#f0f6fc]' : 'text-gray-600 hover:text-black')
            }`}
          >
            Batch Leaderboard
          </button>
        </div>
      </section>

      {/* Main Content Grid */}
      <main className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Inputs */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className={`rounded-[2rem] p-8 border ${
            darkMode 
              ? 'bg-[#161b22] border-[#30363d]' 
              : 'bg-white border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]'
          }`}>
            <h2 className={`text-xl font-bold mb-6 flex items-center gap-2 ${darkMode ? 'text-[#f0f6fc]' : 'text-black'}`}>
              <FileText className="text-gray-400" /> Job & Resume Inputs
            </h2>

            {error && (
              <div className={`mb-6 p-4 text-sm rounded-xl border flex items-start gap-2 ${
                darkMode 
                  ? 'bg-red-950/40 text-red-300 border-red-800/50' 
                  : 'bg-red-50 text-red-700 border-red-100'
              }`}>
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="mb-6">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Target Job Description
              </label>
              <textarea 
                className={`w-full h-48 p-4 border rounded-xl focus:ring-2 focus:ring-gray-400 outline-none resize-none text-sm transition-all ${
                  darkMode 
                    ? 'bg-[#0e0f11] border-[#30363d] text-[#e1e4e8] focus:border-gray-500' 
                    : 'bg-white border-gray-200 text-black focus:border-transparent'
                }`}
                placeholder="Paste the job description here..."
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
              />
            </div>

            <div className="mb-8">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                {activeTab === 'single' ? 'Upload Resume (.PDF, .DOCX)' : 'Upload Resumes (Multiple)'}
              </label>
              <div className="flex items-center gap-4">
                <label className={`cursor-pointer px-5 py-2.5 rounded-full text-sm font-semibold transition-colors flex items-center gap-2 ${
                  darkMode ? 'bg-[#f0f6fc] text-[#0e0f11] hover:bg-white' : 'bg-black text-white hover:bg-gray-800'
                }`}>
                  <Upload size={16} /> Choose File{activeTab === 'batch' && 's'}
                  <input 
                    type="file" 
                    className="hidden" 
                    multiple={activeTab === 'batch'}
                    accept=".pdf,.docx,.txt"
                    onChange={activeTab === 'single' ? handleSingleFileChange : handleBatchFileChange}
                  />
                </label>
                <span className={`text-sm truncate max-w-[200px] ${darkMode ? 'text-[#8b949e]' : 'text-gray-500'}`}>
                  {activeTab === 'single' 
                    ? (file ? file.name : "No file chosen") 
                    : (batchFiles.length > 0 ? `${batchFiles.length} files chosen` : "No files chosen")}
                </span>
              </div>
            </div>

            <button 
              onClick={handleAnalyze}
              disabled={loading}
              className={`w-full py-4 rounded-full font-bold text-lg transition-colors flex items-center justify-center gap-2 cursor-pointer ${
                darkMode 
                  ? 'bg-[#f0f6fc] text-[#0e0f11] hover:bg-white disabled:bg-gray-800 disabled:text-gray-500' 
                  : 'bg-black text-white hover:bg-gray-800 disabled:bg-gray-400'
              }`}
            >
              {loading ? <Loader2 className="animate-spin" /> : "Analyze & Match"}
              {!loading && <ArrowRight size={20} />}
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Results */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Waiting State */}
          {!singleResult && !batchResult && !loading && (
            <div className={`rounded-[2rem] h-full min-h-[500px] border border-dashed flex flex-col items-center justify-center p-8 text-center ${
              darkMode 
                ? 'bg-[#161b22] border-[#30363d] text-[#8b949e]' 
                : 'bg-white border-gray-200 text-gray-400'
            }`}>
              {activeTab === 'single' ? <FileText size={48} className="mb-4 opacity-50" /> : <Users size={48} className="mb-4 opacity-50" />}
              <p className={`text-lg font-medium ${darkMode ? 'text-[#f0f6fc]' : 'text-gray-700'}`}>Ready to analyze</p>
              <p className="text-sm">Upload files and paste a job description to see AI matching results here.</p>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className={`rounded-[2rem] h-full min-h-[500px] border flex flex-col items-center justify-center ${
              darkMode 
                ? 'bg-[#161b22] border-[#30363d] text-[#8b949e]' 
                : 'bg-white border-gray-100 text-gray-400 shadow-sm'
            }`}>
              <Loader2 size={48} className={`animate-spin mb-4 ${darkMode ? 'text-[#f0f6fc]' : 'text-black'}`} />
              <p className={`text-lg font-medium ${darkMode ? 'text-[#f0f6fc]' : 'text-black'}`}>
                Analyzing Document{activeTab === 'batch' ? 's' : ''}...
              </p>
              <p className="text-sm">Extracting semantics and matching skills.</p>
            </div>
          )}

          {/* SINGLE MATCH RESULTS */}
          {activeTab === 'single' && singleResult && !loading && (
            <>
              <div className={`rounded-[2rem] p-10 text-white shadow-2xl relative overflow-hidden ${
                darkMode ? 'bg-[#161b22] border border-[#30363d]' : 'bg-[#1a1a1a]'
              }`}>
                <div className="absolute -right-10 -top-10 opacity-5">
                  <Trophy size={250} />
                </div>
                <h2 className="text-8xl font-extrabold tracking-tighter mb-4 text-emerald-400">
                  {singleResult.match_score}%
                </h2>
                <p className="text-xl font-medium text-gray-300">Semantic Match Score</p>
                <p className="text-sm text-gray-500 mt-1">File: {singleResult.filename}</p>
              </div>

              <div className={`rounded-[2rem] p-8 border ${
                darkMode 
                  ? 'bg-[#161b22] border-[#30363d]' 
                  : 'bg-white border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]'
              }`}>
                <div className="mb-8">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <CheckCircle2 size={18} className="text-green-500" /> Matched Skills & Keywords
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {singleResult.matched_skills.map((skill, idx) => (
                      <span 
                        key={idx} 
                        className={`px-4 py-1.5 rounded-full text-sm font-medium border capitalize ${
                          darkMode 
                            ? 'bg-emerald-950/50 text-emerald-300 border-emerald-800/50' 
                            : 'bg-green-50 text-green-700 border-green-200'
                        }`}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <AlertCircle size={18} className="text-red-500" /> Missing Key Requirements
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {singleResult.missing_skills.map((skill, idx) => (
                      <span 
                        key={idx} 
                        className={`px-4 py-1.5 rounded-full text-sm font-medium border capitalize ${
                          darkMode 
                            ? 'bg-red-950/50 text-red-300 border-red-800/50' 
                            : 'bg-red-50 text-red-700 border-red-200'
                        }`}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* BATCH LEADERBOARD WITH SEARCH & PAGINATION */}
          {activeTab === 'batch' && batchResult && !loading && (
            <div className={`rounded-[2rem] p-6 md:p-8 border overflow-hidden flex flex-col ${
              darkMode 
                ? 'bg-[#161b22] border-[#30363d]' 
                : 'bg-white border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]'
            }`}>
              
              {/* Header & Metrics Summary */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-5 border-b border-gray-500/20">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-2xl ${darkMode ? 'bg-amber-400/10 text-amber-400' : 'bg-yellow-100 text-yellow-700'}`}>
                    <Trophy size={24} />
                  </div>
                  <div>
                    <h3 className={`text-xl font-extrabold ${darkMode ? 'text-[#f0f6fc]' : 'text-black'}`}>
                      Ranked Leaderboard
                    </h3>
                    <p className={`text-xs ${darkMode ? 'text-[#8b949e]' : 'text-gray-500'}`}>
                      Evaluated semantically against target job description
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 text-xs font-semibold">
                  <div className={`px-3 py-1.5 rounded-xl border ${darkMode ? 'bg-[#0e0f11] border-[#30363d] text-[#8b949e]' : 'bg-gray-100 border-gray-200 text-gray-600'}`}>
                    Total: <span className={darkMode ? 'text-white font-bold' : 'text-black font-bold'}>{batchResult.length}</span>
                  </div>
                  <div className={`px-3 py-1.5 rounded-xl border ${darkMode ? 'bg-emerald-950/40 border-emerald-800/50 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
                    Top Match: <span className="font-bold">{topScore}%</span>
                  </div>
                </div>
              </div>

              {/* SEARCH & FILTER BAR */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-5">
                {/* Search Input Box */}
                <div className="relative w-full sm:w-72">
                  <Search size={16} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                  <input
                    type="text"
                    placeholder="Search candidate name..."
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    className={`w-full pl-9 pr-4 py-2 rounded-xl text-xs border outline-none transition-all ${
                      darkMode 
                        ? 'bg-[#0e0f11] border-[#30363d] text-[#e1e4e8] focus:border-gray-500' 
                        : 'bg-gray-50 border-gray-200 text-black focus:border-gray-400'
                    }`}
                  />
                </div>

                {/* Items Per Page Selector */}
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <span className={`text-xs ${darkMode ? 'text-[#8b949e]' : 'text-gray-500'}`}>Per page:</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                    className={`px-3 py-1.5 rounded-xl text-xs border outline-none font-medium cursor-pointer ${
                      darkMode 
                        ? 'bg-[#0e0f11] border-[#30363d] text-[#e1e4e8]' 
                        : 'bg-gray-50 border-gray-200 text-black'
                    }`}
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={1000}>All ({batchResult.length})</option>
                  </select>
                </div>
              </div>
              
              {/* LEADERBOARD SCROLL CONTAINER (Compact Vertically) */}
              <div className="max-h-[580px] overflow-y-auto pr-1 space-y-2.5">
                {displayedCandidates.length === 0 ? (
                  <div className="text-center py-12 text-xs text-gray-400">
                    No candidates found matching "{searchTerm}"
                  </div>
                ) : (
                  displayedCandidates.map((candidate) => {
                    const badge = getScoreBadge(candidate.match_score);
                    const cleanName = formatCandidateName(candidate.filename);
                    const isTop3 = candidate.rank <= 3;

                    return (
                      <div 
                        key={candidate.rank} 
                        className={`p-3.5 rounded-xl border transition-all duration-150 ${
                          darkMode 
                            ? 'bg-[#0e0f11] border-[#30363d] hover:border-gray-600' 
                            : 'bg-white border-gray-200/80 hover:border-gray-300 hover:shadow-sm'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          
                          {/* Left: Rank & Candidate Details */}
                          <div className="flex items-center gap-3 min-w-0">
                            {/* Compact Rank Badge */}
                            <div className={`w-8 h-8 shrink-0 rounded-xl flex items-center justify-center font-bold text-xs ${
                              candidate.rank === 1 ? 'bg-amber-400 text-black shadow-sm' : 
                              candidate.rank === 2 ? 'bg-slate-300 text-slate-900' : 
                              candidate.rank === 3 ? 'bg-amber-700/80 text-amber-100' : 
                              (darkMode ? 'bg-[#161b22] text-[#8b949e] border border-[#30363d]' : 'bg-gray-100 text-gray-500')
                            }`}>
                              {isTop3 ? <Medal size={15} /> : `#${candidate.rank}`}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 truncate">
                                <h4 className={`font-bold text-sm truncate ${darkMode ? 'text-[#f0f6fc]' : 'text-black'}`}>
                                  {cleanName}
                                </h4>
                                {candidate.rank === 1 && (
                                  <span className="text-[9px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-400 border border-amber-400/30 flex items-center gap-0.5 shrink-0">
                                    <Sparkles size={9} /> Top
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-2 mt-0.5">
                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono border truncate max-w-[140px] sm:max-w-[200px] ${
                                  darkMode ? 'bg-[#161b22] border-[#30363d] text-[#8b949e]' : 'bg-gray-100 border-gray-200 text-gray-500'
                                }`}>
                                  {candidate.filename}
                                </span>

                                {candidate.top_missing_skills && candidate.top_missing_skills.length > 0 ? (
                                  <span className="text-[10px] text-rose-400 truncate">
                                    Missing: {candidate.top_missing_skills.slice(0, 2).join(', ')}
                                    {candidate.top_missing_skills.length > 2 && ` +${candidate.top_missing_skills.length - 2}`}
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-emerald-400 flex items-center gap-0.5">
                                    <Check size={10} /> Matched
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Right: Badge & Match Bar */}
                          <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-500/10">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${badge.bg}`}>
                              {badge.text}
                            </span>

                            <div className="flex items-center gap-2">
                              <div className={`w-20 h-1.5 rounded-full overflow-hidden ${darkMode ? 'bg-[#161b22]' : 'bg-gray-100'}`}>
                                <div 
                                  className={`h-full rounded-full ${badge.bar}`}
                                  style={{ width: `${candidate.match_score}%` }}
                                />
                              </div>
                              <span className={`text-base font-extrabold w-10 text-right ${darkMode ? 'text-[#f0f6fc]' : 'text-black'}`}>
                                {candidate.match_score}%
                              </span>
                            </div>
                          </div>

                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* PAGINATION FOOTER CONTROLS */}
              {filteredCandidates.length > itemsPerPage && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-5 pt-4 border-t border-gray-500/20 text-xs">
                  <div className={darkMode ? 'text-[#8b949e]' : 'text-gray-500'}>
                    Showing <span className="font-bold">{startIndex + 1}</span> to <span className="font-bold">{Math.min(startIndex + itemsPerPage, filteredCandidates.length)}</span> of <span className="font-bold">{filteredCandidates.length}</span> candidates
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                      disabled={currentPage === 1}
                      className={`p-1.5 rounded-lg border transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                        darkMode ? 'bg-[#0e0f11] border-[#30363d] hover:bg-[#161b22]' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <ChevronLeft size={16} />
                    </button>

                    <span className="px-3 font-semibold">
                      Page {currentPage} of {totalPages}
                    </span>

                    <button
                      onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className={`p-1.5 rounded-lg border transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                        darkMode ? 'bg-[#0e0f11] border-[#30363d] hover:bg-[#161b22]' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>
      </main>
    </div>
  );
}