/** Core arithmetic and representation helpers. Kept independent from UI/animation. */
export const OPERATIONS = {
  add: { symbol: '+', label: 'Addition', cycles: 2 },
  sub: { symbol: '−', label: 'Subtraction', cycles: 2 },
  mul: { symbol: '×', label: 'Multiplication', cycles: 4 },
  div: { symbol: '÷', label: 'Division', cycles: 8 },
};

export const CPU_PROFILES = {
  educational: { label: 'Educational CPU', hz: 100_000_000, display: '100 MHz', cycles: 1 },
  basic: { label: 'Basic CPU', hz: 1_000_000_000, display: '1 GHz', cycles: 1 },
  modern: { label: 'Modern CPU', hz: 3_500_000_000, display: '3.5 GHz', cycles: 1 },
};

export function validateOperands(aValue, bValue, operation) {
  const parse = (value, label) => {
    if (value === '' || value === null || value === undefined) {
      throw new Error(`Enter a value for ${label}.`);
    }
    const n = Number(value);
    if (!Number.isInteger(n) || n < 0 || n > 9) {
      throw new Error(`${label} must be a whole number from 0 to 9.`);
    }
    return n;
  };
  const a = parse(aValue, 'Input A');
  const b = parse(bValue, 'Input B');
  if (!Object.hasOwn(OPERATIONS, operation)) throw new Error('Choose a valid arithmetic operation.');
  if (operation === 'div' && b === 0) throw new Error('Division by zero is undefined. Choose a divisor from 1 to 9.');
  return { a, b, operation };
}

export function toBinary(value, width = 4) {
  const n = Math.trunc(value);
  if (n < 0) return toTwosComplement(n, Math.max(width, 8));
  return n.toString(2).padStart(width, '0');
}

export function toTwosComplement(value, width = 8) {
  const modulus = 2 ** width;
  return (value < 0 ? modulus + value : value).toString(2).slice(-width).padStart(width, '0');
}

export function fromTwosComplement(bits) {
  if (!bits || bits[0] !== '1') return Number.parseInt(bits || '0', 2);
  return Number.parseInt(bits, 2) - 2 ** bits.length;
}

export function calculate(a, b, operation) {
  const safe = validateOperands(String(a), String(b), operation);
  let value;
  switch (operation) {
    case 'add': value = safe.a + safe.b; break;
    case 'sub': value = safe.a - safe.b; break;
    case 'mul': value = safe.a * safe.b; break;
    case 'div': value = safe.a / safe.b; break;
    default: throw new Error('Unsupported operation.');
  }

  const quotient = operation === 'div' ? Math.floor(safe.a / safe.b) : null;
  const remainder = operation === 'div' ? safe.a % safe.b : null;
  const resultBits = operation === 'div'
    ? toBinary(quotient, 8)
    : (value < 0 ? toTwosComplement(value, 8) : toBinary(value, 8));

  return {
    ...safe,
    value,
    quotient,
    remainder,
    inputABits: toBinary(safe.a, 4),
    inputBBits: toBinary(safe.b, 4),
    resultBits,
    remainderBits: operation === 'div' ? toBinary(remainder, 4) : null,
    isNegative: value < 0,
    formattedValue: operation === 'div' ? `${quotient}${remainder ? ` remainder ${remainder}` : ''}` : String(value),
  };
}

/** Truth function shared by the interactive gate lab and its truth table. */
export function evaluateGate(gate, a, b = 0) {
  const A = Boolean(a);
  const B = Boolean(b);
  switch (gate) {
    case 'NOT': return Number(!A);
    case 'AND': return Number(A && B);
    case 'OR': return Number(A || B);
    case 'NAND': return Number(!(A && B));
    case 'NOR': return Number(!(A || B));
    case 'XOR': return Number(A !== B);
    case 'XNOR': return Number(A === B);
    default: throw new Error(`Unknown gate: ${gate}`);
  }
}

export function getTruthTable(gate) {
  const inputs = gate === 'NOT' ? [[0], [1]] : [[0, 0], [0, 1], [1, 0], [1, 1]];
  return inputs.map(([a, b]) => ({ a, ...(gate === 'NOT' ? {} : { b }), out: evaluateGate(gate, a, b ?? 0) }));
}

export function getTiming(operation, profileKey, gateDepth = 4) {
  const profile = CPU_PROFILES[profileKey] ?? CPU_PROFILES.educational;
  const cycles = OPERATIONS[operation].cycles;
  const clockPeriodNs = 1e9 / profile.hz;
  const executionNs = (cycles / profile.hz) * 1e9;
  // Illustrative path delay only, deliberately separated from clocked execution time.
  const propagationNs = gateDepth * 0.12;
  return { profile, cycles, clockPeriodNs, executionNs, propagationNs, totalNs: executionNs + propagationNs };
}

/** Build explanatory, operation-specific stages; arithmetic results come from calculate(). */
export function buildStages(result) {
  const { a, b, operation, inputABits, inputBBits, resultBits, value, quotient, remainder } = result;
  const common = [
    { title: 'Inputs received', kicker: '01 / INPUT', description: `The user supplied ${a} and ${b}. The arithmetic engine validates both values before the visualization starts.`, focus: 'registerA' },
    { title: 'Binary conversion', kicker: '02 / ENCODE', description: `${a} becomes ${inputABits} and ${b} becomes ${inputBBits}. Each bit is a place-value choice: 8, 4, 2, or 1.`, focus: 'registerA' },
    { title: 'Registers loaded', kicker: '03 / STORE', description: `Input register A holds ${inputABits}; input register B holds ${inputBBits}. Registers are small, fast storage locations made from digital circuits.`, focus: 'registerB' },
    { title: 'Control selects the path', kicker: '04 / CONTROL', description: `The simplified control unit selects the ${OPERATIONS[operation].label.toLowerCase()} path and enables the relevant ALU circuitry. Real processors use instruction decoding and control logic in more detail.`, focus: 'control' },
    { title: 'Signals propagate', kicker: '05 / SIGNALS', description: 'The highlighted pulses represent modeled changes in logic state traveling along circuit paths. They are not individual electrons and the animation is not a physical measurement.', focus: 'wires' },
    { title: 'Transistors switch', kicker: '06 / SWITCH', description: 'Transistors act as voltage-controlled switches. In a simplified CMOS inverter, a low input turns the PMOS path on and NMOS off; a high input does the reverse.', focus: 'transistor' },
    { title: 'Logic gates evaluate', kicker: '07 / LOGIC', description: `The ALU is built from digital logic. Input patterns are evaluated with Boolean rules; the ${operation === 'add' || operation === 'sub' ? 'adder' : operation === 'mul' ? 'partial-product and adder' : 'comparison and subtraction'} path is highlighted.`, focus: 'alu' },
  ];

  let operationStage;
  if (operation === 'add') {
    const bitA = inputABits.split('').reverse().map(Number);
    const bitB = inputBBits.split('').reverse().map(Number);
    let carry = 0;
    const rows = [];
    for (let i = 0; i < 4; i++) {
      const sum = bitA[i] + bitB[i] + carry;
      rows.push(`Bit ${i}: ${bitA[i]} + ${bitB[i]}${carry ? ' + carry 1' : ''} → sum ${sum % 2}, carry ${Math.floor(sum / 2)}`);
      carry = Math.floor(sum / 2);
    }
    operationStage = { title: 'Adder combines the bits', kicker: '08 / ADDER', description: `A full-adder stage combines A, B, and carry-in. The sum is XOR logic; the carry is generated by AND/OR logic. ${rows.join(' · ')} The exact total is ${a} + ${b} = ${value}.`, focus: 'alu' };
  } else if (operation === 'sub') {
    const width = 8;
    const aBits = toTwosComplement(a, width);
    const bBits = toTwosComplement(-b, width);
    operationStage = { title: 'Subtract with two’s complement', kicker: '08 / ADDER', description: `A common digital technique is A − B = A + (two’s complement of B). For this model, A is ${toTwosComplement(a, width)}, and −B is represented as ${bBits}; the adder combines them. The signed result is ${value}, encoded as ${resultBits}.`, focus: 'alu' };
  } else if (operation === 'mul') {
    const partials = inputBBits.split('').reverse().map((bit, i) => ({ bit: Number(bit), shift: i, row: bit === '1' ? `${inputABits} shifted left ${i} → ${toBinary(a * 2 ** i, 8)}` : `0 at bit ${i} → 00000000` }));
    operationStage = { title: 'Partial products are added', kicker: '08 / MULTIPLY', description: `Binary multiplication creates partial products with AND operations, shifting each row according to the multiplier bit, then adds them. ${partials.map(p => `B bit ${p.shift}=${p.bit}: ${p.row}`).join(' · ')} Final product: ${a} × ${b} = ${value}.`, focus: 'alu' };
  } else {
    const quotientRows = [];
    let rem = 0;
    const dividendBits = toBinary(a, 4);
    for (const bit of dividendBits) {
      rem = rem * 2 + Number(bit);
      const take = rem >= b;
      quotientRows.push(`bring down ${bit}: partial remainder ${rem}${take ? ` − ${b} = ${rem - b}` : ''}`);
      if (take) rem -= b;
    }
    operationStage = { title: 'Division compares and subtracts', kicker: '08 / DIVIDE', description: `This is a simplified long-division trace. The circuit brings down each dividend bit, compares the partial remainder with ${b}, and subtracts the divisor when possible. ${quotientRows.join(' · ')} Quotient ${quotient}; remainder ${remainder}.`, focus: 'alu' };
  }

  common.push(operationStage);
  common.push({ title: 'Output register captures bits', kicker: '09 / WRITE BACK', description: `The result register captures ${resultBits}${operation === 'div' ? ` as the integer quotient; the remainder is ${result.remainderBits}` : ''}. ${result.isNegative ? 'This is a signed two’s-complement pattern, not a positive unsigned value.' : 'The result is represented as an unsigned binary number.'}`, focus: 'output' });
  common.push({ title: 'Result ready', kicker: '10 / COMPLETE', description: operation === 'div' ? `${a} ÷ ${b} = ${quotient}${remainder ? ` remainder ${remainder}` : ''} (decimal value ${value}). The quotient bits and remainder are both shown in the result panel.` : `${a} ${OPERATIONS[operation].symbol} ${b} = ${value}. The binary output is ${resultBits}, then interpreted as ${value} in decimal.`, focus: 'output' });
  return common;
}
