const fs = require('fs');
const path = require('path');

const raw = fs.readFileSync('extracted_pdf.txt', 'utf8');

const groupDefinitions = [
  { group: 1, selectCount: 10, targetCount: 50, cdr: 'CĐR 1.1', difficulty: 'DỄ', title: 'Group 1: Nhận biết khái niệm cơ bản (CĐR 1.1 - Dễ)' },
  { group: 2, selectCount: 15, targetCount: 97, cdr: 'CĐR 1.1', difficulty: 'TRUNG BÌNH', title: 'Group 2: Hiểu và phân biệt kỹ thuật kiểm thử (CĐR 1.1 - Trung bình)' },
  { group: 3, selectCount: 3, targetCount: 19, cdr: 'CĐR 1.1', difficulty: 'KHÓ', title: 'Group 3: Vận dụng phân tích luồng & độ phức tạp (CĐR 1.1 - Khó)' },
  { group: 4, selectCount: 5, targetCount: 20, cdr: 'CĐR 2.1', difficulty: 'DỄ', title: 'Group 4: Công cụ & thuật ngữ cơ bản (CĐR 2.1 - Dễ)' },
  { group: 5, selectCount: 12, targetCount: 75, cdr: 'CĐR 2.1', difficulty: 'TRUNG BÌNH', title: 'Group 5: Kỹ thuật kiểm thử & bao phủ (CĐR 2.1 - Trung bình)' },
  { group: 6, selectCount: 5, targetCount: 39, cdr: 'CĐR 2.1', difficulty: 'KHÓ', title: 'Group 6: Vận dụng nâng cao, biểu đồ & luồng dữ liệu (CĐR 2.1 - Khó)' }
];

const groupRegex = /Group\s+(\d+)\.\s*Chọn\s+(\d+)\s*câu\s*\((\d+)\s*câu\)\s*–\s*CĐR\s*([0-9.]+)\s*–\s*(DE|TB|KHO)/g;

let match;
const groupPositions = [];
while ((match = groupRegex.exec(raw)) !== null) {
  groupPositions.push({
    groupNum: parseInt(match[1], 10),
    selectCount: parseInt(match[2], 10),
    totalCount: parseInt(match[3], 10),
    cdr: 'CĐR ' + match[4],
    difficulty: match[5] === 'DE' ? 'DỄ' : match[5] === 'TB' ? 'TRUNG BÌNH' : 'KHÓ',
    index: match.index,
    headerLength: match[0].length
  });
}

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
    
    const lines = block.split(/\r?\n/);
    let qCode = '';
    let qTextLines = [];
    let options = { 1: [], 2: [], 3: [], 4: [] };
    let currentOpt = null;
    let correctOpt = null;
    
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim();
      if (/^Page\s+\d+$/i.test(line)) continue;
      if (!line) continue;
      
      const optMatch = line.match(/^([1-4])\s+(\*|\s\*|\s+)\s*(.*)$/);
      const optMatchSimple = line.match(/^([1-4])(?:\s*(\*))?\s*$/);
      
      if (optMatchSimple) {
        currentOpt = parseInt(optMatchSimple[1], 10);
        if (optMatchSimple[2] === '*') correctOpt = currentOpt;
      } else if (optMatch) {
        currentOpt = parseInt(optMatch[1], 10);
        if (optMatch[2].includes('*')) correctOpt = currentOpt;
        if (optMatch[3]) options[currentOpt].push(optMatch[3].trim());
      } else if (currentOpt !== null && !/^[1-4]\s/.test(line)) {
        if (line.includes('*') && !correctOpt) {
          correctOpt = currentOpt;
          line = line.replace(/\*/g, '').trim();
        }
        if (line) options[currentOpt].push(line);
      } else {
        if (!qCode) {
          const codeMatch = line.match(/^(\d{3})\b\s*(.*)$/);
          if (codeMatch) {
            qCode = codeMatch[1];
            line = codeMatch[2];
          }
        }
        // Remove trailing classification like DE 1 0 1 1.1
        line = line.replace(/(?:DE|TB|KHO)\s+\d+\s+\d+\s+\d+\s+[\d.]+\s*$/, '').trim();
        if (line) qTextLines.push(line);
      }
    }
    
    let questionText = qTextLines.join(' ').replace(/\s+/g, ' ').trim();
    
    // Fix known cases where text was formatting in table
    if (qCode === '122' && currentGroup.groupNum === 5) {
      questionText = 'Cho chương trình:\n```\nwhile (condition A) {\n    do B;\n}\nend while;\n```\nCần bao nhiêu path để có thể bao phủ 100% đường đi?';
    }
    
    if (qCode === '039' && currentGroup.groupNum === 5) {
      questionText = 'Cho đoạn code sau, số lần kiểm tra nhỏ nhất cho statement coverage (bao phủ câu lệnh) và branch coverage (bao phủ nhánh) là bao nhiêu?\n```c\ndiscountRate = 1;\nfare = 1000;\nif ((person == "senior") && (month == "January"))\n    bonusPoints = 100 + bonusPoints;\nif (class == "first")\n    discountRate = .5;\nfare = fare * discountRate;\n```';
    }
    
    if (qCode === '040' && currentGroup.groupNum === 5) {
      questionText = 'Cho đoạn chương trình sau, biết rằng các điều kiện độc lập với nhau. Cần bao nhiêu trường hợp kiểm thử cho tất cả các nhánh (khả năng):\n```c\nif (condition1)\n    statement1;\nelse\n    statement2;\nif (condition2)\n    statement3;\n```';
    }
    
    if (qCode === '050' && currentGroup.groupNum === 5) {
      questionText = 'Cần ít nhất bao nhiêu ca kiểm thử để đảm bảo 100% bao phủ nhánh?\n```c\nif (x > y)\n    x = x + 1;\nelse\n    y = y + 1;\nwhile (x > y) {\n    y = x * y;\n    x = x + 1;\n}\n```';
    }

    if (qCode === '199' && currentGroup.groupNum === 5) {
      questionText = 'một phần của chương trình:\n```\nWHILE (condition A) Do B\nEND WHILE\n```\nTài liệu nào tóm tắt các hoạt động kiểm thử kết hợp với một hoặc nhiều đặc tả thiết kế kiểm thử?';
    }

    if (qCode === '123' && currentGroup.groupNum === 6) {
      questionText = 'Cho chương trình sau:\n```c\nIF P + Q > 100 THEN Print "Large" ENDIF (1)\nIf P > 50 THEN Print "P Large" ENDIF (2)\n```\nĐiều nào sau đây đúng?';
    }

    if (qCode === '154' && currentGroup.groupNum === 6) {
      questionText = 'Cho hàm sau:\n```c\nBool isPrime(int x) {\n    Int n = round(sqrt(x));\n    If (x == 2) printf("%d khong la so nguyen to", x);\n    Else\n        For (i = 2; i <= round(sqrt(x)); i++) {\n            If (x % i == 0) return false;\n            Break;\n        }\n    Return true;\n}\n```\nHàm trên có bao nhiêu luồng dữ liệu bất thường?';
    }

    if (qCode === '164' && currentGroup.groupNum === 6) {
      questionText = 'Luồng dữ liệu không bình thường (Data flow anomaly) trong đoạn code sau đây thuộc loại nào:\n```c\nint modifiedbinsearch(int X, int V[], int n) {\n    int low, high, mid;\n    low = 0;\n    high = n - 1;\n    while (low <= high) {\n        mid = (low + high) / 2;\n        if (X < V[mid]) {\n            high = mid - 1;\n            mid = mid - 1;\n        } else if (X > V[mid]) {\n            low = mid + 1;\n        } else {\n            return mid;\n        }\n    }\n    return -1;\n}\n```';
    }

    // Attach diagrams for questions with graphs
    let diagramUrl = null;
    if (qCode === '104' && currentGroup.groupNum === 4) {
      diagramUrl = '/diagrams/q104_symbols.png';
    } else if (qCode === '042' && currentGroup.groupNum === 5) {
      diagramUrl = '/diagrams/q042_cfg.png';
    } else if (qCode === '129' && currentGroup.groupNum === 6) {
      diagramUrl = '/diagrams/q129_cfg.png';
    } else if (qCode === '165' && currentGroup.groupNum === 6) {
      diagramUrl = '/diagrams/q165_dfg.png';
    } else if (qCode === '193' && currentGroup.groupNum === 6) {
      diagramUrl = '/diagrams/q165_dfg.png';
    } else if (qCode === '247' && currentGroup.groupNum === 6) {
      diagramUrl = '/diagrams/q247_state.png';
    } else if (qCode === '261' && currentGroup.groupNum === 6) {
      diagramUrl = '/diagrams/q261_dfg.png';
    } else if (qCode === '262' && currentGroup.groupNum === 6) {
      diagramUrl = '/diagrams/q261_dfg.png';
    } else if (qCode === '263' && currentGroup.groupNum === 6) {
      diagramUrl = '/diagrams/q263_dfg.png';
    }

    // Format options cleanly
    const formattedOptions = [1, 2, 3, 4].map(optNum => {
      let text = (options[optNum] || []).join(' ').replace(/\s+/g, ' ').trim();
      // Remove leading labels like A., B., C., D.
      text = text.replace(/^[A-D]\.\s*/, '');
      return {
        id: optNum,
        label: String.fromCharCode(64 + optNum), // 'A', 'B', 'C', 'D'
        text: text
      };
    });

    // Determine topic tag
    let topic = 'Tổng quan Kiểm thử';
    const combined = (questionText + ' ' + formattedOptions.map(o => o.text).join(' ')).toLowerCase();
    if (combined.includes('hộp đen') || combined.includes('black box')) topic = 'Kiểm thử hộp đen';
    else if (combined.includes('hộp trắng') || combined.includes('white box') || combined.includes('cấu trúc')) topic = 'Kiểm thử hộp trắng';
    else if (combined.includes('luồng dữ liệu') || combined.includes('data flow') || combined.includes('def-use') || combined.includes('du path')) topic = 'Kiểm thử luồng dữ liệu';
    else if (combined.includes('luồng điều khiển') || combined.includes('control flow') || combined.includes('cfg')) topic = 'Kiểm thử luồng điều khiển';
    else if (combined.includes('giá trị biên') || combined.includes('boundary')) topic = 'Phân tích giá trị biên';
    else if (combined.includes('tương đương') || combined.includes('equivalence')) topic = 'Phân hoạch tương đương';
    else if (combined.includes('bảng quyết định') || combined.includes('decision table')) topic = 'Bảng quyết định';
    else if (combined.includes('độ phức tạp chu trình') || combined.includes('cyclomatic')) topic = 'Độ phức tạp Cyclomatic';
    else if (combined.includes('chấp nhận') || combined.includes('uat') || combined.includes('bat')) topic = 'Kiểm thử chấp nhận (UAT)';
    else if (combined.includes('đơn vị') || combined.includes('unit test') || combined.includes('junit') || combined.includes('nunit')) topic = 'Kiểm thử đơn vị & Framework';
    else if (combined.includes('tích hợp') || combined.includes('stub') || combined.includes('driver')) topic = 'Kiểm thử tích hợp';
    else if (combined.includes('hệ thống') || combined.includes('phi chức năng') || combined.includes('performance')) topic = 'Kiểm thử hệ thống & Phi chức năng';
    else if (combined.includes('mô hình lỗi') || combined.includes('defect') || combined.includes('bug')) topic = 'Quản lý lỗi & Mô hình Defect';

    questions.push({
      id: `q_${currentGroup.groupNum}_${qCode || (questions.length + 1)}_${b}`,
      code: qCode || `Q${questions.length + 1}`,
      group: currentGroup.groupNum,
      groupName: `Group ${currentGroup.groupNum} (${currentGroup.difficulty})`,
      cdr: currentGroup.cdr,
      difficulty: currentGroup.difficulty,
      topic: topic,
      question: questionText,
      options: formattedOptions,
      correctOption: correctOpt || 1,
      diagramUrl: diagramUrl
    });
  }
}

console.log('Processed total questions:', questions.length);

// Ensure output directory exists
fs.mkdirSync('src/data', { recursive: true });
fs.writeFileSync('src/data/questions.json', JSON.stringify(questions, null, 2), 'utf8');
console.log('Successfully saved to src/data/questions.json');
