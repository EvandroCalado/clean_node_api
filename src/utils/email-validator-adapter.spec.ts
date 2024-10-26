import validator from 'validator';
import { EmailValidatorAdapter } from './email-validator-adapter';

vi.mock('validator', async () => {
  const actual = await vi.importActual<typeof validator>('validator');
  return {
    ...actual,
    isEmail: vi.fn(),
  };
});

describe('EmailValidator Adapter', () => {
  it('should return false if validator returns false', () => {
    const sut = new EmailValidatorAdapter();

    vi.spyOn(validator, 'isEmail').mockReturnValueOnce(false);

    const isValid = sut.isValid('invalid_email@email.com');

    expect(isValid).toBe(false);
  });

  it('should return true if validator returns true', () => {
    const sut = new EmailValidatorAdapter();

    const isValid = sut.isValid('valid_email@email.com');

    expect(isValid).toBe(true);
  });
});
