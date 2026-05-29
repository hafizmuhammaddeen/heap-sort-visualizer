const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5001;

app.use(cors());
app.use(express.json());

let steps = [];

function heapify(arr, n, i, mode) {
    let target = i;
    let l = 2 * i + 1;
    let r = 2 * i + 2;
    steps.push({ 
        arr: [...arr], 
        hSize: n, 
        fix: [i], 
        swap: [], 
        msg: `Fixing: Analyzing Node ${arr[i]}`, 
        isComplete: false 
    });

    if (mode === 'max') {
        if (l < n && arr[l] > arr[target]) target = l;
        if (r < n && arr[r] > arr[target]) target = r;
    } else {
        if (l < n && arr[l] < arr[target]) target = l;
        if (r < n && arr[r] < arr[target]) target = r;
    }

    if (target !== i) {
      
        [arr[i], arr[target]] = [arr[target], arr[i]];

        steps.push({ 
            arr: [...arr], 
            hSize: n, 
            fix: [], 
            swap: [i, target], 
            msg: `Swapping: ${arr[i]} <-> ${arr[target]}`, 
            isComplete: false 
        });

       
        heapify(arr, n, target, mode);
    }
}


app.post('/api/heapsort', (req, res) => {
    const { nums, mode } = req.body; 
    
    
    if (!nums || !mode) return res.status(400).json({ error: "Missing data" });

    steps = []; 
    let arr = [...nums];
    let n = arr.length;

    const startIndex = Math.floor(n / 2) - 1;

    for (let i = startIndex; i >= 0; i--) {
        heapify(arr, n, i, mode);
    }

    steps.push({ 
        arr: [...arr], 
        hSize: n, 
        fix: [], 
        swap: [], 
        msg: `${mode.toUpperCase()} HEAP STABILIZED`, 
        isComplete: true 
    });

    res.json(steps);
});

app.listen(PORT, () => {
    console.log(` Backend running on http://localhost:${PORT}`);
});