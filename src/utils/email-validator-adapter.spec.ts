import validator from 'validator';
import { EmailValidatorAdapter } from './email-validator-adapter';

vi.mock('validator', async () => {
  const actual = await vi.importActual<typeof validator>('validator');
  return {
    ...actual,
    isEmail: vi.fn(),
  };
});

const makeSut = (): EmailValidatorAdapter => {
  return new EmailValidatorAdapter();
};

describe('EmailValidator Adapter', () => {
  it('should return false if validator returns false', () => {
    const sut = makeSut();

    vi.spyOn(validator, 'isEmail').mockReturnValueOnce(false);

    const isValid = sut.isValid('invalid_email@email.com');

    expect(isValid).toBe(false);
  });

  it('should return true if validator returns true', () => {
    const sut = makeSut();

    const isValid = sut.isValid('valid_email@email.com');

    expect(isValid).toBe(true);
  });

  it('should call validator with correct email', () => {
    const sut = makeSut();

    const isEmailSpy = vi.spyOn(validator, 'isEmail');

    sut.isValid('valid_email@email.com');

    expect(isEmailSpy).toHaveBeenCalledWith('valid_email@email.com');
  });
});
