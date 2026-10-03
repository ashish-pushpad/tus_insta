import { processTemplate } from '../../src/utils/template.js';

describe('Template Interpolation Engine', () => {
  test('should replace {{username}} and {{link}} variables correctly', () => {
    const template = 'Hey {{username}} 👋 Check out {{link}}';
    const variables = {
      username: '@john_doe',
      link: 'https://example.com/product'
    };

    const output = processTemplate(template, variables);
    expect(output).toBe('Hey @john_doe 👋 Check out https://example.com/product');
  });

  test('should handle case-insensitive variable placeholders', () => {
    const template = 'Hello {{USERNAME}}, your URL is {{Link}}';
    const variables = {
      username: '@maria',
      link: 'https://test.dev'
    };

    const output = processTemplate(template, variables);
    expect(output).toBe('Hello @maria, your URL is https://test.dev');
  });

  test('should provide safe default fallbacks for missing variables', () => {
    const template = 'Hi {{username}}, product is {{product_name}}';
    const output = processTemplate(template, {});

    expect(output).toBe('Hi @user, product is our product');
  });
});
