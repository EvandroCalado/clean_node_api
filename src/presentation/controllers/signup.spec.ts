import { InvalidParamError } from '../errors/invalid-param-error';
import { MissingParamError } from '../errors/missing-param-error';
import { EmailValidator } from '../protocols/email-validator';
import { SignUpController } from './signup';

interface SutTypes {
  sut: SignUpController;
  emailValidatorStub: EmailValidator;
}

const makeSut = (): SutTypes => {
  class EmailValidatorStub implements EmailValidator {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    isValid(email: string): boolean {
      return true;
    }
  }

  const emailValidatorStub = new EmailValidatorStub();

  const sut = new SignUpController(emailValidatorStub);

  return { sut, emailValidatorStub };
};

describe('SignUp Controller', () => {
  it('should return 400 BAD REQUEST if no name is provided', () => {
    const { sut } = makeSut();
    const httpRequest = {
      body: {
        email: 'valid_email',
        password: 'valid_password',
        passwordConfirmation: 'valid_password',
      },
    };

    const httpResponse = sut.handle(httpRequest);

    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new MissingParamError('name'));
  });

  it('should return 400 BAD REQUEST if no email is provided', () => {
    const { sut } = makeSut();
    const httpRequest = {
      body: {
        name: 'valid_name',
        password: 'valid_password',
        passwordConfirmation: 'valid_password',
      },
    };

    const httpResponse = sut.handle(httpRequest);

    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new MissingParamError('email'));
  });

  it('should return 400 BAD REQUEST if no password is provided', () => {
    const { sut } = makeSut();
    const httpRequest = {
      body: {
        name: 'valid_name',
        email: 'valid_email',
        passwordConfirmation: 'valid_password',
      },
    };

    const httpResponse = sut.handle(httpRequest);

    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new MissingParamError('password'));
  });

  it('should return 400 BAD REQUEST if no password confirmation is provided', () => {
    const { sut } = makeSut();
    const httpRequest = {
      body: {
        name: 'valid_name',
        email: 'valid_email',
        password: 'valid_password',
      },
    };

    const httpResponse = sut.handle(httpRequest);

    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new MissingParamError('passwordConfirmation'));
  });

  it('should return 400 BAD REQUEST if an invalid email is provided', () => {
    const { sut, emailValidatorStub } = makeSut();
    vi.spyOn(emailValidatorStub, 'isValid').mockReturnValueOnce(false);

    const httpRequest = {
      body: {
        name: 'valid_name',
        email: 'invalid_email',
        password: 'valid_password',
        passwordConfirmation: 'valid_password',
      },
    };

    const httpResponse = sut.handle(httpRequest);

    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new InvalidParamError('email'));
  });
});
