const fs = require('fs');

const raw = fs.readFileSync('extracted_pdf.txt', 'utf8');

// The groups:
const groupRegex = /Group\s+(\d+)\.\s*Chọn\s+(\d+)\s*câu\s*\((\d+)\s*câu\)\s*–\s*CĐR\s*([0-9.]+)\s*–\s*(DE|TB|KHO)/g;

let match;
const groupPositions = [];
while ((match = groupRegex.exec(raw)) !== null) {
  groupPositions.push({
    groupNum: parseInt(match[1], 10),
    selectCount: parseInt(match[2], 10),
    totalCount: parseInt(match[3], 10),
    cdr: 'CĐR ' + match[4],
    difficultyRaw: match[5],
    difficulty: match[5] === 'DE' ? 'DỄ' : match[5] === 'TB' ? 'TRUNG BÌNH' : 'KHÓ',
    index: match.index,
    headerLength: match[0].length
  });
}

console.log('Found groups:', groupPositions.length);

const questions = [];

for (let g = 0; g < groupPositions.length; g++) {
  const currentGroup = groupPositions[g];
  const nextIndex = g + 1 < groupPositions.length ? groupPositions[g + 1].index : raw.length;
  const groupChunk = raw.slice(currentGroup.index + currentGroup.headerLength, nextIndex);
  
  // Split groupChunk by \bEnd\b
  const qBlocks = groupChunk.split(/\r?\n\s*End\s*\r?\n/);
  
  for (let b = 0; b < qBlocks.length; b++) {
    const block = qBlocks[b].trim();
    if (!block || block.startsWith('Giảng viên ra đề')) continue;
    
    // Parse the question block
    // Look for lines starting with option numbers: 1, 2, 3, 4
    // Sometimes option lines have * before or after or in table
    const lines = block.split(/\r?\n/);
    
    let qCode = '';
    let qTextLines = [];
    let options = {};
    let currentOpt = null;
    let correctOpt = null;
    
    // Check if first line has question code e.g. "007" or "101"
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim();
      // Remove page headers if present like "Page 3"
      if (/^Page\s+\d+$/i.test(line)) continue;
      if (!line) continue;
      
      // Match option start: e.g. "1 ...", "2 ...", "3 * ...", "4 ...", "1 * ..."
      // or "1          *      ..."
      const optMatch = line.match(/^([1-4])\s+(\*|\s\*|\s+)\s*(.*)$/);
      // Also match if line is just "1", "2", "3", "4" or "1 *"
      const optMatchSimple = line.match(/^([1-4])(?:\s*(\*))?\s*$/);
      
      if (optMatchSimple) {
        currentOpt = parseInt(optMatchSimple[1], 10);
        if (optMatchSimple[2] === '*') correctOpt = currentOpt;
        options[currentOpt] = options[currentOpt] || [];
      } else if (optMatch) {
        currentOpt = parseInt(optMatch[1], 10);
        if (optMatch[2].includes('*')) correctOpt = currentOpt;
        options[currentOpt] = options[currentOpt] || [];
        if (optMatch[3]) options[currentOpt].push(optMatch[3]);
      } else if (currentOpt !== null && /^[1-4]/.test(line) === false) {
        // Continuation of current option, but check if there's a '*' in the line
        if (line.includes('*') && !correctOpt) {
          // Check if the * marks the option
          correctOpt = currentOpt;
          line = line.replace(/\*/g, '').trim();
        }
        if (line) options[currentOpt].push(line);
      } else {
        // Still in question text
        // Check for question code on first non-empty line
        if (!qCode) {
          const codeMatch = line.match(/^(\d{3})\s+(.*)$/);
          if (codeMatch) {
            qCode = codeMatch[1];
            line = codeMatch[2];
          }
        }
        // Clean trailing metadata tags like "DE 1 0 1 1.1" or "TB 1 0 1 2.1"
        line = line.replace(/(?:DE|TB|KHO)\s+\d+\s+\d+\s+\d+\s+[\d.]+\s*$/, '').trim();
        if (line) qTextLines.push(line);
      }
    }
    
    questions.push({
      index: questions.length + 1,
      code: qCode || `Q${questions.length + 1}`,
      group: currentGroup.groupNum,
      groupName: `Group ${currentGroup.groupNum}`,
      cdr: currentGroup.cdr,
      difficulty: currentGroup.difficulty,
      question: qTextLines.join(' ').replace(/\s+/g, ' ').trim(),
      rawOptions: options,
      correctOpt
    });
  }
}

console.log('Parsed questions count:', questions.length);
const withoutCorrect = questions.filter(q => !q.correctOpt);
console.log('Questions without correct answer detected:', withoutCorrect.length);
if (withoutCorrect.length > 0) {
  console.log('Sample without correct:', withoutCorrect.slice(0, 3));
}
