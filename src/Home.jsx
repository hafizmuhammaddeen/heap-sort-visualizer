import React, { useState, useRef, useEffect } from 'react';
import './style.css'; 

const HeapSortAnalyzer = () => {
  const [inputValue, setInputValue] = useState(""); 
  const [status, setStatus] = useState("ENGINE STATUS: STANDBY");
  const [errorText, setErrorText] = useState("");
  const [currentStep, setCurrentStep] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [complexity, setComplexity] = useState({ time: "-", space: "-" });

  const canvasRef = useRef(null);
  const timeoutRef = useRef(null);

  const handleReset = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setInputValue("");
    setCurrentStep(null);
    setStatus("ENGINE STATUS: STANDBY");
    setErrorText("");
    setIsSimulating(false);
    setComplexity({ time: "-", space: "-" });
    const canvas = canvasRef.current;
    if (canvas) canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
  };

  const drawTree = (step) => {
    const canvas = canvasRef.current;
    if (!canvas || !step) return;
    const ctx = canvas.getContext('2d');
    const { arr, fix, swap, isComplete } = step;

    let n = arr.length;
    let totalLevels = Math.floor(Math.log2(n)) + 1;
    const verticalSpacing = 100;
    const leafNodes = Math.pow(2, totalLevels - 1);
    const nodeGap = n > 31 ? 40 : 60; 
    
    const calculatedWidth = Math.max(1150, leafNodes * nodeGap);
    const calculatedHeight = (totalLevels * verticalSpacing) + 80;

    if (canvas.width !== calculatedWidth) canvas.width = calculatedWidth;
    if (canvas.height !== calculatedHeight) canvas.height = calculatedHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let positions = {};

    for (let i = 0; i < n; i++) {
        let level = Math.floor(Math.log2(i + 1));
        let idx = i - (Math.pow(2, level) - 1);
        let x = (canvas.width / (Math.pow(2, level) + 1)) * (idx + 1);
        let y = 60 + level * verticalSpacing;
        positions[i] = { x, y };
    }

    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 2;
    for (let i = 0; i < n; i++) {
        let l = 2 * i + 1, r = 2 * i + 2;
        [l, r].forEach(c => {
            if (c < n) {
                ctx.beginPath(); ctx.moveTo(positions[i].x, positions[i].y);
                ctx.lineTo(positions[c].x, positions[c].y); ctx.stroke();
            }
        });
    }

    const nodeSize = n > 31 ? 24 : 30; 
    ctx.font = n > 31 ? "bold 10px Inter" : "bold 13px Inter";

    for (let i = 0; i < n; i++) {
        let { x, y } = positions[i];
        let text = String(arr[i]);
        let textWidth = ctx.measureText(text).width;
        let boxWidth = Math.max(nodeSize, textWidth + 8);
        let boxHeight = nodeSize;

        let color = isComplete ? '#10b981' : fix.includes(i) ? '#f97316' : swap.includes(i) ? '#06b6d4' : '#ffffff';
        ctx.fillStyle = color;
        ctx.strokeStyle = "#1e293b";
        ctx.lineWidth = 1.5;
        
        ctx.fillRect(x - boxWidth/2, y - boxHeight/2, boxWidth, boxHeight);
        ctx.strokeRect(x - boxWidth/2, y - boxHeight/2, boxWidth, boxHeight);
        
        ctx.fillStyle = (color === '#ffffff') ? "black" : "white";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(text, x, y);
    }
  };

  const startSimulation = async (mode) => {
    if (isSimulating) return;
    setErrorText("");
    const cleanInput = inputValue.trim();
    if (!cleanInput) return setErrorText("SYSTEM MSG: INPUT REQUIRED");

    const nums = cleanInput.split(/[\s,]+/).filter(x => x !== "").map(Number);
    if (nums.length < 2 || nums.length > 300) {
        setErrorText("VALIDATION: RANGE_ERROR [2-300]");
        return;
    }

    if (nums.some(isNaN)) return setErrorText("SYSTEM MSG: INVALID DATA");

    setIsSimulating(true);
    setStatus(`CORE PROCESS: ${mode.toUpperCase()} HEAP GEN`);

    try {
        const response = await fetch('http://localhost:5001/api/heapsort', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nums, mode })
        });
        const allSteps = await response.json();
        animateSteps(0, allSteps);
    } catch (err) {
        setErrorText("FATAL: SERVER OFFLINE");
        setIsSimulating(false);
    }
  };

  const animateSteps = (index, allSteps) => {
    if (index >= allSteps.length) {
        setIsSimulating(false);
        setComplexity({ time: "O(N log N)", space: "O(1)" }); 
        return;
    }
    const step = allSteps[index];
    setCurrentStep(step);
    setStatus(`RUNNING > ${step.msg}`);
    drawTree(step);
    timeoutRef.current = setTimeout(() => animateSteps(index + 1, allSteps), 350);
  };

  return (
    <div className="heap-analyzer-wrapper">
      <div className="top-nav">
        <div className="input-container">
          <span className="label">ARRAY SOURCE:</span>
          <input 
            type="text" 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Data input (2-100)..."
            disabled={isSimulating}
            autoComplete="off"
          />
          <button className="max-btn" onClick={() => startSimulation('max')} disabled={isSimulating}>MAX BUILD</button>
          <button className="min-btn" onClick={() => startSimulation('min')} disabled={isSimulating}>MIN BUILD</button>
          <button className="reset-btn" onClick={handleReset}>CLEAR</button>
        </div>
        <div id="error-text">{errorText}</div>
      </div>

      <div className="terminal-header">
        <span>HEAP STRUCTURE VISUALIZATION ENGINE</span>
        <span className="auth"> STABLE</span>
      </div>

      <div id="status-bar">{status}</div>

      <div className="main-content">
        <div className="stats-row">
          <div className="stat-group">
             <span>Items Left: {currentStep?.isComplete ? 0 : (currentStep?.arr.length || 0)}</span>
             <span>Processed: {currentStep?.isComplete ? currentStep.arr.length : 0}</span>
          </div>
          <div className="stat-group complexity-box">
             <span>TC: <b style={{color: '#fbbf24'}}>{complexity.time}</b></span>
             <span>SC: <b style={{color: '#fbbf24'}}>{complexity.space}</b></span>
          </div>
        </div>

        <div className="box-title">BUFFER MEMORY ARRAY</div>
        <div id="array-container">
            {currentStep?.arr.map((val, i) => (
                <div key={i} className="array-cell">
                    <div className={`index-box ${currentStep.isComplete ? 'sorted-idx' : ''}`}>{i}</div>
                    <div className="value-box" style={{
                        backgroundColor: currentStep.isComplete ? '#10b981' : currentStep.fix.includes(i) ? '#f97316' : currentStep.swap.includes(i) ? '#06b6d4' : '#ffffff',
                        color: (currentStep.isComplete || currentStep.fix.includes(i) || currentStep.swap.includes(i)) ? 'white' : 'black'
                    }}>{val}</div>
                </div>
            ))}
        </div>

        <div className="box-title">HIERARCHICAL TREE STRUCTURE</div>
        <div id="tree-box">
          <canvas ref={canvasRef}></canvas>
        </div>

        <div id="legend">
            <div className="leg-item"><span className="box orange"></span> Adjusting</div>
            <div className="leg-item"><span className="box cyan"></span> Swapping</div>
            <div className="leg-item"><span className="box white"></span> Unprocessed</div>
            <div className="leg-item"><span className="box emerald"></span> Completed</div>
        </div>
      </div>
    </div>
  );
};

export default HeapSortAnalyzer;