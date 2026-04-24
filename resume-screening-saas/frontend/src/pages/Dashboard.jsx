import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, FileText, Loader2, Award, Briefcase, GraduationCap, BarChart2, CheckCircle, TrendingUp } from 'lucide-react';
import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api';

export default function Dashboard() {
  const [files, setFiles] = useState([]);
  const [jobDescription, setJobDescription] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');

  const onDrop = useCallback(acceptedFiles => {
    setFiles(prev => [...prev, ...acceptedFiles]);
    setError('');
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] }
  });

  const handleAnalyze = async () => {
    if (files.length === 0) {
      setError('Please upload at least one resume.');
      return;
    }
    if (!jobDescription.trim()) {
      setError('Please enter a job description.');
      return;
    }

    try {
      setError('');
      setIsUploading(true);
      
      // 1. Upload PDFs and extract text
      const formData = new FormData();
      files.forEach(f => formData.append('files', f));

      const uploadRes = await axios.post(`${API_URL}/upload-resumes`, formData);
      const extractedTexts = uploadRes.data.data.map(d => d.text);

      setIsUploading(false);
      setIsAnalyzing(true);

      // 2. Send for analysis
      const analyzeRes = await axios.post(`${API_URL}/analyze`, {
        job_description: jobDescription,
        resumes: extractedTexts
      });

      setCandidates(analyzeRes.data);
    } catch (err) {
      console.error(err);
      setError('An error occurred during analysis. Please check the backend connection.');
    } finally {
      setIsUploading(false);
      setIsAnalyzing(false);
    }
  };

  const removeFile = (idx) => {
    setFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const getAnalytics = () => {
    if (!candidates || candidates.length === 0) return null;
    
    const avgScore = candidates.reduce((acc, c) => acc + c.score, 0) / candidates.length;
    const maxScore = Math.max(...candidates.map(c => c.score));
    const strongMatches = candidates.filter(c => c.score > 70).length;
    
    const skillCount = {};
    candidates.forEach(c => {
      c.skills.forEach(s => skillCount[s] = (skillCount[s] || 0) + 1);
    });
    
    const topSkills = Object.entries(skillCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(entry => ({ name: entry[0], count: entry[1] }));

    return { 
      total: candidates.length, 
      avg: Math.round(avgScore), 
      max: Math.round(maxScore), 
      strongMatches,
      topSkills,
      maxSkillCount: topSkills.length > 0 ? topSkills[0].count : 1
    };
  };
  const analytics = getAnalytics();

  return (
    <div className="min-h-screen bg-slate-900 overflow-hidden relative p-8 flex flex-col items-center">
      {/* Background glow effects */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-purple-500/10 blur-[100px] rounded-full" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 blur-[100px] rounded-full" />
      
      <div className="z-10 w-full max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
        
        {/* LEFT COLUMN: Inputs */}
        <div className="flex-1 flex flex-col gap-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700 backdrop-blur-md"
          >
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-purple-400" /> Upload Resumes
            </h2>
            
            <div 
              {...getRootProps()} 
              className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                isDragActive ? 'border-purple-500 bg-purple-500/10' : 'border-slate-600 hover:border-slate-500 bg-slate-800/30'
              }`}
            >
              <input {...getInputProps()} />
              <FileText className="w-10 h-10 text-slate-400 mb-4" />
              <p className="text-sm text-slate-300">
                {isDragActive ? "Drop the PDFs here..." : "Drag 'n' drop some PDFs here, or click to select"}
              </p>
            </div>

            {files.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-sm text-slate-400 mb-2">Selected files ({files.length}):</p>
                {files.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/80 border border-slate-700 text-sm">
                    <span className="truncate max-w-[80%] text-slate-300">{file.name}</span>
                    <button onClick={(e) => { e.stopPropagation(); removeFile(idx); }} className="text-red-400 hover:text-red-300">
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700 backdrop-blur-md flex-1 flex flex-col"
          >
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-blue-400" /> Job Description
            </h2>
            <div className="relative flex-1">
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the target job description here..."
                className="w-full h-full min-h-[200px] bg-slate-900/50 border border-slate-700 rounded-xl p-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              />
            </div>
          </motion.div>

          {error && <p className="text-red-400 text-sm text-center font-medium bg-red-400/10 p-3 rounded-lg">{error}</p>}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAnalyze}
            disabled={isUploading || isAnalyzing}
            className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-2 ${
              isUploading || isAnalyzing 
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-purple-500/25'
            }`}
          >
            {isUploading ? <><Loader2 className="w-5 h-5 animate-spin" /> CandiMind is parsing resumes...</>
              : isAnalyzing ? <><Loader2 className="w-5 h-5 animate-spin" /> CandiMind is analyzing candidates...</>
              : <><Award className="w-5 h-5" /> Analyze & Rank Candidates</>
            }
          </motion.button>
        </div>

        {/* RIGHT COLUMN: Results */}
        <div className="flex-[2] w-full self-start">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-2xl bg-slate-800/30 border border-slate-700/50 backdrop-blur-md min-h-[600px] flex flex-col"
          >
            {candidates.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                <BarChart2 className="w-16 h-16 mb-4 opacity-20" />
                <p className="text-lg font-medium">Upload resumes to see insights powered by CandiMind AI</p>
              </div>
            ) : (
              <div className="space-y-10">
                {/* 🎯 NEW DASHBOARD SECTION */}
                <div>
                  <div className="mb-8">
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                      <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                        CandiMind – AI Resume Screening Dashboard
                      </h2>
                      <p className="text-slate-400 mt-2 text-sm font-medium">Smart candidate analysis and ranking powered by AI</p>
                    </motion.div>
                  </div>
                  
                  {/* 1. STATS CARDS */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <motion.div whileHover={{ y: -5 }} className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 backdrop-blur-sm p-5 rounded-2xl border border-slate-700/50 shadow-lg flex flex-col justify-center">
                      <div className="flex items-center gap-2 mb-2 text-purple-300">
                        <FileText className="w-5 h-5" /> 
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Total Resumes</span>
                      </div>
                      <p className="text-3xl font-extrabold text-slate-100">{analytics.total}</p>
                    </motion.div>
                    
                    <motion.div whileHover={{ y: -5 }} className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 backdrop-blur-sm p-5 rounded-2xl border border-slate-700/50 shadow-lg flex flex-col justify-center">
                      <div className="flex items-center gap-2 mb-2 text-blue-400">
                        <BarChart2 className="w-5 h-5" /> 
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Avg Score</span>
                      </div>
                      <p className="text-3xl font-extrabold text-slate-100">{analytics.avg}%</p>
                    </motion.div>

                    <motion.div whileHover={{ y: -5 }} className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 backdrop-blur-sm p-5 rounded-2xl border border-slate-700/50 shadow-lg flex flex-col justify-center">
                      <div className="flex items-center gap-2 mb-2 text-purple-400">
                        <Award className="w-5 h-5" /> 
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Highest Score</span>
                      </div>
                      <p className="text-3xl font-extrabold text-slate-100">{analytics.max}%</p>
                    </motion.div>

                    <motion.div whileHover={{ y: -5 }} className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 backdrop-blur-sm p-5 rounded-2xl border border-slate-700/50 shadow-lg flex flex-col justify-center">
                      <div className="flex items-center gap-2 mb-2 text-green-400">
                        <CheckCircle className="w-5 h-5" /> 
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Strong Matches</span>
                      </div>
                      <p className="text-3xl font-extrabold text-slate-100">{analytics.strongMatches}</p>
                    </motion.div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* 2. TOP CANDIDATES SECTION */}
                    <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 shadow-lg">
                      <h3 className="text-lg font-bold text-slate-200 mb-5 flex items-center gap-2">
                        <Award className="w-5 h-5 text-purple-400" /> Top Candidates
                      </h3>
                      <div className="space-y-4">
                        {candidates.slice(0, 3).map((cand, idx) => (
                          <motion.div whileHover={{ y: -3 }} key={idx} className={`p-4 rounded-xl border transition-colors ${idx === 0 ? 'bg-gradient-to-b from-purple-900/30 to-blue-900/20 border-purple-500/50 relative shadow-lg' : 'bg-slate-800/80 border-slate-700/80 hover:border-slate-600 shadow'} `}>
                            {idx === 0 && (
                              <span className="absolute -top-3 left-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-[10px] uppercase tracking-wider px-3 py-1 rounded-full font-bold shadow-md">
                                🏆 Top Candidate
                              </span>
                            )}
                            
                            <div className={`flex justify-between items-center mb-2 ${idx === 0 ? 'mt-1' : ''}`}>
                              <h4 className={`font-bold ${idx === 0 ? 'text-purple-300' : 'text-slate-200'} text-base truncate pr-2`}>{cand.name}</h4>
                              <span className="font-bold text-slate-300">{Math.round(cand.score)}%</span>
                            </div>
                            
                            {/* Score Progress Bar */}
                            <div className="w-full bg-slate-900/80 rounded-full h-1.5 mb-3 overflow-hidden border border-slate-700">
                              <motion.div 
                                initial={{ width: 0 }} 
                                animate={{ width: `${cand.score}%` }} 
                                transition={{ duration: 1, ease: "easeOut" }}
                                className={`h-full rounded-full ${idx === 0 ? 'bg-gradient-to-r from-purple-500 to-blue-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]' : 'bg-blue-400'}`} 
                              ></motion.div>
                            </div>
                            
                            <div className="flex flex-wrap gap-1.5">
                              {cand.skills.slice(0, 4).map((skill, si) => (
                                <span key={si} className="px-2 py-0.5 text-[10px] rounded-md bg-slate-900/80 text-slate-300 border border-slate-700">
                                  {skill}
                                </span>
                              ))}
                              {cand.skills.length > 4 && (
                                <span className="px-2 py-0.5 text-[10px] rounded-md bg-slate-900/80 text-slate-500 border border-slate-800">
                                  +{cand.skills.length - 4}
                                </span>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* 3. SKILLS OVERVIEW SECTION */}
                    <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 shadow-lg">
                      <h3 className="text-lg font-bold text-slate-200 mb-6 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-blue-400" /> Skills Overview
                      </h3>
                      <div className="space-y-5">
                        {analytics.topSkills.map((skill, si) => (
                          <div key={si}>
                            <div className="flex justify-between items-end mb-1">
                              <span className="text-sm font-semibold text-slate-300">{skill.name}</span>
                              <span className="text-xs text-slate-400 font-medium">Found in {skill.count}</span>
                            </div>
                            <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-700">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${(skill.count / (analytics.maxSkillCount || 1)) * 100}%` }}
                                transition={{ duration: 1, delay: si * 0.1, ease: "easeOut" }}
                                className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full shadow-[0_0_8px_rgba(139,92,246,0.3)]" 
                              ></motion.div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* ORIGINAL RANKED RESULTS */}
                <div className="pt-6 border-t border-slate-700/50">
                  <h2 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                    All Ranked Candidates
                  </h2>
                  <div className="space-y-4">
                    <AnimatePresence>
                      {candidates.map((cand, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      whileHover={{ y: -5 }}
                      transition={{ delay: i * 0.1, duration: 0.3 }}
                      className="p-6 rounded-2xl bg-slate-800/80 backdrop-blur-sm border border-slate-700 hover:border-purple-500/50 transition-colors shadow-xl hover:shadow-2xl hover:shadow-purple-900/20 relative overflow-hidden flex flex-col lg:flex-row gap-6"
                    >
                      {/* Left Side: Candidate Info */}
                      <div className="flex-1 pr-4">
                        <h3 className="text-xl font-extrabold text-slate-100 mb-2">{cand.name}</h3>

                        {cand.summary && (
                          <p className="text-sm text-slate-300 leading-relaxed italic mt-3 mb-5 border-l-4 border-slate-600 pl-4 py-1">
                            {cand.summary}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-2 text-sm text-slate-400 mb-2 pointer-events-none">
                          <GraduationCap className="w-4 h-4" />
                          <span className="truncate">{cand.education}</span>
                        </div>
                        <div className="flex text-sm text-slate-400 mb-5 pointer-events-none">
                          <Briefcase className="w-4 h-4 mr-2" />
                          <span className="truncate">{cand.experience}</span>
                        </div>

                        {/* SKILLS SECTION */}
                        <div className="space-y-4 mt-6">
                          {/* All Skills */}
                          {cand.skills && cand.skills.length > 0 && (
                            <div className="bg-slate-900/40 p-4 rounded-lg border border-slate-700/50">
                              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                                Skills <span className="text-slate-500">({cand.skills.length})</span>
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {cand.skills.map((skill, si) => (
                                  <span 
                                    key={si} 
                                    title={`Skill: ${skill}`}
                                    className="px-3 py-1.5 text-xs rounded-full bg-slate-800 text-slate-300 border border-slate-700 hover:border-slate-500 hover:bg-slate-700/80 transition-all cursor-default"
                                  >
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Matched Skills */}
                          {cand.matched_skills && cand.matched_skills.length > 0 && (
                            <div className="bg-green-900/20 p-4 rounded-lg border border-green-700/30">
                              <p className="text-xs font-bold uppercase tracking-wider text-green-400 mb-3">
                                ✅ Matched Skills <span className="text-green-600">({cand.matched_skills.length})</span>
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {cand.matched_skills.map((skill, si) => (
                                  <span 
                                    key={si}
                                    title="Skill matched with job role"
                                    className="px-3 py-1.5 text-xs rounded-full bg-green-900/40 text-green-300 border border-green-600/50 hover:bg-green-900/60 hover:border-green-500 transition-all cursor-default"
                                  >
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Missing Skills */}
                          {cand.missing_skills && cand.missing_skills.length > 0 && (
                            <div className="bg-red-900/20 p-4 rounded-lg border border-red-700/30">
                              <p className="text-xs font-bold uppercase tracking-wider text-red-400 mb-3">
                                ❌ Missing Skills <span className="text-red-600">({cand.missing_skills.length})</span>
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {cand.missing_skills.map((skill, si) => (
                                  <span 
                                    key={si}
                                    title="Required skill not found in resume"
                                    className="px-3 py-1.5 text-xs rounded-full bg-red-900/40 text-red-300 border border-red-600/50 hover:bg-red-900/60 hover:border-red-500 transition-all cursor-default"
                                  >
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right Side: Enhanced Score Display */}
                      <div className="w-full lg:w-72 bg-slate-900/60 rounded-xl p-5 border border-slate-700/60 flex flex-col relative overflow-hidden glassmorphism shadow-inner">
                        
                        {/* 1. BIG SCORE DISPLAY */}
                        <div className="text-center relative z-10 pt-2 pb-2">
                          <span className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 drop-shadow-[0_0_20px_rgba(139,92,246,0.3)]">
                            {Math.round(cand.score)}<span className="text-3xl">%</span>
                          </span>
                          
                          {/* 2. MATCH CLASSIFICATION BADGE */}
                          <div className="mt-3 flex justify-center">
                            <div className={`px-4 py-1.5 rounded-full text-[11px] font-bold border tracking-wide uppercase shadow-sm ${
                              cand.score >= 70 ? 'bg-green-500/15 text-green-400 border-green-500/30' : 
                              cand.score >= 40 ? 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' :
                              'bg-red-500/15 text-red-400 border-red-500/30'
                            }`}>
                              {cand.score >= 70 ? 'Strong Match ✅' : cand.score >= 40 ? 'Moderate Match ⚠️' : 'Poor Match ❌'}
                            </div>
                          </div>
                        </div>

                        {/* 3. SCORE BREAKDOWN SECTION */}
                        <div className="w-full mt-5 space-y-4 relative z-10">
                          <h4 className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-3 border-b border-slate-700/70 pb-2 text-center">Score Breakdown</h4>
                          
                          {/* 4. PROGRESS BAR DESIGN (Dark gray bg, Gradient fill) */}
                          <div>
                            <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider mb-1.5">
                              <span className="text-slate-400">Semantic Match</span>
                              <span className="text-slate-200">{Math.round(cand.semantic_score || 0)}%</span>
                            </div>
                            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700/50">
                              <motion.div 
                                initial={{ width: 0 }} 
                                animate={{ width: `${cand.semantic_score || 0}%` }} 
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="bg-gradient-to-r from-purple-500 to-blue-500 h-full rounded-full shadow-[0_0_8px_rgba(168,85,247,0.4)]" 
                              />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider mb-1.5">
                              <span className="text-slate-400">Skill Match</span>
                              <span className="text-slate-200">{Math.round(cand.skill_score || 0)}%</span>
                            </div>
                            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700/50">
                              <motion.div 
                                initial={{ width: 0 }} 
                                animate={{ width: `${cand.skill_score || 0}%` }} 
                                transition={{ duration: 1, delay: 0.1, ease: "easeOut" }}
                                className="bg-gradient-to-r from-purple-500 to-blue-500 h-full rounded-full shadow-[0_0_8px_rgba(168,85,247,0.4)]" 
                              />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider mb-1.5">
                              <span className="text-slate-400">Final Score</span>
                              <span className="text-slate-300 drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">{Math.round(cand.score)}%</span>
                            </div>
                            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700/50">
                              <motion.div 
                                initial={{ width: 0 }} 
                                animate={{ width: `${cand.score}%` }} 
                                transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                                className="bg-gradient-to-r from-purple-500 to-blue-500 h-full rounded-full shadow-[0_0_10px_rgba(168,85,247,0.6)]" 
                              />
                            </div>
                          </div>
                        </div>
                        
                        {/* Soft background glow effect for the score section */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-purple-500/10 rounded-full blur-[50px] pointer-events-none" />
                      </div>

                      {/* Rank ribbon logic visually */}
                      {i === 0 && (
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-purple-500 to-blue-500" />
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>
            )}
          </motion.div>
        </div>

      </div>
    </div>
  );
}

