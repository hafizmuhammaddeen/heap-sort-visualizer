const canvas = document.getElementById('treeCanvas');
const ctx = canvas.getContext('2d');
const arrayContainer = document.getElementById('array-container');
const statusBar = document.getElementById('status-bar');
const errorText = document.getElementById('error-text');

let steps = [];

function isAlreadySorted(arr) {
    for (let i = 0; i < arr.length - 1; i++) {
        if (arr[i] > arr[i + 1]) return false;
    }
    return true;
}

function startSort() {
    let rawInput = document.getElementById('arrayInput').value.trim();
    errorText.innerText = ""; 

    if (rawInput === "") {
        errorText.innerText = "Error: Cannot enter zero input!";
        return;
    }

    // Restriction: Only numbers, commas, and spaces
    if (/[^0-9\s,]/.test(rawInput)) {
        errorText.innerText = "Error: Only numbers, commas, and spaces allowed!";
        return;
    }

    let nums = rawInput.split(/[\s,]+/).filter(x => x !== "").map(Number);

    if (nums.length < 2) {
        errorText.innerText = "Error: Minimum 2 numbers required.";
        return;
    }

    if (nums.length > 200) {
        errorText.innerText = "Error: Maximum limit 200 nodes.";
        return;
    }

    if (isAlreadySorted(nums)) {
        statusBar.innerText = ">_ NO ACTION REQUIRED: ARRAY ALREADY SORTED";
        render({ arr: nums, hSize: 0, fix: [], swap: [], msg: "ALREADY SORTED" });
        return;
    }

    steps = [];
    heapSort(nums.slice());
    animateSteps(0);
}

function heapify(arr, n, i, phase) {
    let largest = i;
    let l = 2 * i + 1;
    let r = 2 * i + 2;
    steps.push({ arr: arr.slice(), hSize: n, fix: [i], swap: [], msg: `${phase}: Analyzing node` });

    if (l < n && arr[l] > arr[largest]) largest = l;
    if (r < n && arr[r] > arr[largest]) largest = r;

    if (largest != i) {
        [arr[i], arr[largest]] = [arr[largest], arr[i]];
        steps.push({ arr: arr.slice(), hSize: n, fix: [], swap: [i, largest], msg: "SWAP_EXECUTED" });
        heapify(arr, n, largest, phase);
    }
}

function heapSort(arr) {
    let n = arr.length;
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) heapify(arr, n, i, "INITIALIZING_HEAP");
    for (let i = n - 1; i > 0; i--) {
        [arr[0], arr[i]] = [arr[i], arr[0]];
        steps.push({ arr: arr.slice(), hSize: i, fix: [], swap: [0, i], msg: "EXTRACTING_MAX" });
        heapify(arr, i, 0, i, "RE_HEAPIFYING");
    }
    steps.push({ arr: arr.slice(), hSize: 0, fix: [], swap: [], msg: "SORTING_COMPLETED" });
}

function render(step) {
    const { arr, hSize, fix, swap, msg } = step;
    statusBar.innerText = ">_ " + msg;
    document.getElementById('unsorted-count').innerText = `Unsorted Keys: ${hSize}`;
    document.getElementById('sorted-count').innerText = `Sorted Keys: ${arr.length - hSize}`;
    document.getElementById('heap-size-label').innerText = `Unsorted Subarray Heap Size: ${hSize}`;

    // Array View
    arrayContainer.innerHTML = '';
    arr.forEach((val, i) => {
        let isSorted = i >= hSize;
        let color = isSorted ? '#4ade80' : fix.includes(i) ? 'red' : swap.includes(i) ? '#ff00ff' : 'yellow';
        let cell = document.createElement('div');
        cell.className = 'array-cell';
        cell.innerHTML = `<div class="index-box ${isSorted ? 'sorted-idx' : ''}">${i + 1}</div>
                          <div class="value-box" style="background-color: ${color}">${val}</div>`;
        arrayContainer.appendChild(cell);
    });

    // Tree View
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let n = arr.length;
    let totalLevels = Math.floor(Math.log2(n)) + 1;
    let nodeSize = n > 100 ? 10 : (n > 50 ? 18 : 26);
    let positions = {};

    for (let i = 0; i < n; i++) {
        let level = Math.floor(Math.log2(i + 1));
        let idx = i - (Math.pow(2, level) - 1);
        let x = (canvas.width / (Math.pow(2, level) + 1)) * (idx + 1);
        let y = 60 + level * (400 / totalLevels);
        positions[i] = { x, y };
    }

    // Lines
    ctx.strokeStyle = "#aaa";
    for (let i = 0; i < hSize; i++) {
        let l = 2 * i + 1, r = 2 * i + 2;
        [l, r].forEach(c => {
            if (c < hSize) {
                ctx.beginPath(); ctx.moveTo(positions[i].x, positions[i].y);
                ctx.lineTo(positions[c].x, positions[c].y); ctx.stroke();
            }
        });
    }

    // Square Nodes
    for (let i = 0; i < n; i++) {
        let { x, y } = positions[i];
        let isSorted = i >= hSize;
        let color = isSorted ? '#4ade80' : fix.includes(i) ? 'red' : swap.includes(i) ? '#ff00ff' : 'yellow';
        ctx.fillStyle = color;
        ctx.fillRect(x - nodeSize/2, y - nodeSize/2, nodeSize, nodeSize);
        ctx.strokeRect(x - nodeSize/2, y - nodeSize/2, nodeSize, nodeSize);
        if (nodeSize > 15) {
            ctx.fillStyle = "black"; ctx.font = `bold ${nodeSize/2}px Arial`;
            ctx.textAlign = "center"; ctx.fillText(arr[i], x, y + 5);
        }
    }
}

function animateSteps(index) {
    if (index >= steps.length) return;
    let delay = steps[0].arr.length > 50 ? 50 : 250;
    render(steps[index]);
    setTimeout(() => animateSteps(index + 1), delay);
}