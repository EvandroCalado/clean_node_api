import { EmailValidatorAdapter } from './email-validator-adapter';

describe('EmailValidator Adapter', () => {
  it('should return false if validator returns false', () => {
    const sut = new EmailValidatorAdapter();

    const isValid = sut.isValid('invalid_email');

    expect(isValid).toBe(false);
  });
});
