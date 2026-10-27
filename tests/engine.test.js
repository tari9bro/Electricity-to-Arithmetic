import test from 'node:test';
import assert from 'node:assert/strict';
import { calculate, evaluateGate, fromTwosComplement, getTiming, getTruthTable, toBinary, toTwosComplement, validateOperands } from '../src/core/engine.js';

test('four arithmetic operations return correct values', () => {
  assert.equal(calculate(3, 2, 'add').value, 5);
  assert.equal(calculate(3, 7, 'sub').value, -4);
  assert.equal(calculate(9, 9, 'mul').value, 81);
  assert.equal(calculate(7, 2, 'div').value, 3.5);
  assert.equal(calculate(7, 2, 'div').quotient, 3);
  assert.equal(calculate(7, 2, 'div').remainder, 1);
});

test('arithmetic is correct for every allowed operand pair', () => {
  for (let a = 0; a <= 9; a++) {
    for (let b = 0; b <= 9; b++) {
      assert.equal(calculate(a, b, 'add').value, a + b, `addition ${a}+${b}`);
      assert.equal(calculate(a, b, 'sub').value, a - b, `subtraction ${a}-${b}`);
      assert.equal(calculate(a, b, 'mul').value, a * b, `multiplication ${a}*${b}`);
      if (b > 0) {
        assert.equal(calculate(a, b, 'div').value, a / b, `division ${a}/${b}`);
        assert.equal(calculate(a, b, 'div').quotient, Math.floor(a / b));
        assert.equal(calculate(a, b, 'div').remainder, a % b);
      }
    }
  }
});

test('binary conversions and two-complement negative values are consistent', () => {
  assert.equal(toBinary(3, 4), '0011');
  assert.equal(toBinary(2, 4), '0010');
  assert.equal(toTwosComplement(-4, 8), '11111100');
  assert.equal(fromTwosComplement('11111100'), -4);
});

test('invalid values and division by zero are rejected', () => {
  assert.throws(() => validateOperands('', 2, 'add'), /Enter a value/);
  assert.throws(() => validateOperands(1.5, 2, 'add'), /whole number/);
  assert.throws(() => validateOperands(-1, 2, 'add'), /whole number/);
  assert.throws(() => validateOperands(10, 2, 'add'), /whole number/);
  assert.throws(() => calculate(2, 0, 'div'), /Division by zero/);
});

test('all gate truth functions match expected outputs', () => {
  assert.deepEqual(getTruthTable('AND').map(r => r.out), [0, 0, 0, 1]);
  assert.deepEqual(getTruthTable('OR').map(r => r.out), [0, 1, 1, 1]);
  assert.deepEqual(getTruthTable('NAND').map(r => r.out), [1, 1, 1, 0]);
  assert.deepEqual(getTruthTable('NOR').map(r => r.out), [1, 0, 0, 0]);
  assert.deepEqual(getTruthTable('XOR').map(r => r.out), [0, 1, 1, 0]);
  assert.deepEqual(getTruthTable('XNOR').map(r => r.out), [1, 0, 0, 1]);
  assert.equal(evaluateGate('NOT', 1), 0);
  assert.equal(evaluateGate('NOT', 0), 1);
});

test('timing changes with clock profile and not arithmetic result', () => {
  const slow = getTiming('add', 'educational');
  const fast = getTiming('add', 'modern');
  assert.equal(slow.cycles, fast.cycles);
  assert.ok(slow.executionNs > fast.executionNs);
  assert.ok(slow.propagationNs > 0);
});
