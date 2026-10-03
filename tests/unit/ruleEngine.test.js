import { checkExactKeywordMatch } from '../../src/services/rules/ruleEngine.service.js';
import { checkSemanticMatch } from '../../src/services/rules/semanticMatch.service.js';

describe('Special Reply Rule Engine', () => {
  describe('EXACT Keyword Matching', () => {
    test('should match "price" in "what is the price?"', () => {
      const isMatch = checkExactKeywordMatch('what is the price?', ['price', 'cost']);
      expect(isMatch).toBe(true);
    });

    test('should match "cost" case-insensitively in "HOW MUCH DOES THIS COST?"', () => {
      const isMatch = checkExactKeywordMatch('HOW MUCH DOES THIS COST?', ['cost']);
      expect(isMatch).toBe(true);
    });

    test('should NOT match unrelated string "priceless" when looking for "price"', () => {
      const isMatch = checkExactKeywordMatch('this moment is priceless', ['price']);
      expect(isMatch).toBe(false);
    });
  });

  describe('SEMANTIC Similarity Matching', () => {
    test('should identify semantic match for price intent with synonym "rate"', async () => {
      const isMatch = await checkSemanticMatch('what is your hourly rate?', ['price']);
      expect(isMatch).toBe(true);
    });

    test('should return false for completely unrelated comment', async () => {
      const isMatch = await checkSemanticMatch('super cool photo!', ['price', 'cost']);
      expect(isMatch).toBe(false);
    });
  });
});
