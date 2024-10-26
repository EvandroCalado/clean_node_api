import { AccountModel } from '@/domain/models/account';
import { AddAccount, AddAccountModel } from '@/domain/usecases/add-account';
import { InvalidParamError, MissingParamError, ServerError } from '../errors';
import { EmailValidator } from '../protocols/email-validator';
import { SignUpController } from './signup';

interface SutTypes {
  sut: SignUpController;
  addAccountStub: AddAccount;
  emailValidatorStub: EmailValidator;
}

const makeEmailValidator = (): EmailValidator => {
  class EmailValidatorStub implements EmailValidator {
    isValid(email: string): boolean {
      return true;
    }
  }

  return new EmailValidatorStub();
};

const makeAddAccount = (): AddAccount => {
  class AddAccountStub implements AddAccount {
    async add(account: AddAccountModel): Promise<AccountModel> {
      const fakeAccount = {
        id: 'valid_id',
        name: 'valid_name',
        email: 'valid_email',
        password: 'valid_password',
      };

      return new Promise((resolve) => resolve(fakeAccount));
    }
  }

  return new AddAccountStub();
};

const makeSut = (): SutTypes => {
  const emailValidatorStub = makeEmailValidator();
  const addAccountStub = makeAddAccount();
  const sut = new SignUpController(emailValidatorStub, addAccountStub);

  return { sut, addAccountStub, emailValidatorStub };
};

describe('SignUp Controller', () => {
  it('should return 400 BAD REQUEST if no name is provided', async () => {
    const { sut } = makeSut();
    const httpRequest = {
      body: {
        email: 'valid_email',
        password: 'valid_password',
        passwordConfirmation: 'valid_password',
      },
    };

    const httpResponse = await sut.handle(httpRequest);

    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new MissingParamError('name'));
  });

  it('should return 400 BAD REQUEST if no email is provided', async () => {
    const { sut } = makeSut();
    const httpRequest = {
      body: {
        name: 'valid_name',
        password: 'valid_password',
        passwordConfirmation: 'valid_password',
      },
    };

    const httpResponse = await sut.handle(httpRequest);

    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new MissingParamError('email'));
  });

  it('should return 400 BAD REQUEST if no password is provided', async () => {
    const { sut } = makeSut();
    const httpRequest = {
      body: {
        name: 'valid_name',
        email: 'valid_email',
        passwordConfirmation: 'valid_password',
      },
    };

    const httpResponse = await sut.handle(httpRequest);

    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new MissingParamError('password'));
  });

  it('should return 400 BAD REQUEST if no password confirmation is provided', async () => {
    const { sut } = makeSut();
    const httpRequest = {
      body: {
        name: 'valid_name',
        email: 'valid_email',
        password: 'valid_password',
      },
    };

    const httpResponse = await sut.handle(httpRequest);

    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(
      new MissingParamError('passwordConfirmation'),
    );
  });

  it('should return 400 BAD REQUEST if an invalid email is provided', async () => {
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

    const httpResponse = await sut.handle(httpRequest);

    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(new InvalidParamError('email'));
  });

  it('should return 400 BAD REQUEST if password confirmation fails', async () => {
    const { sut, emailValidatorStub } = makeSut();
    vi.spyOn(emailValidatorStub, 'isValid').mockReturnValueOnce(false);

    const httpRequest = {
      body: {
        name: 'valid_name',
        email: 'invalid_email',
        password: 'valid_password',
        passwordConfirmation: 'different_valid_password',
      },
    };

    const httpResponse = await sut.handle(httpRequest);

    expect(httpResponse.statusCode).toBe(400);
    expect(httpResponse.body).toEqual(
      new InvalidParamError('passwordConfirmation'),
    );
  });

  it('should return 500 INTERNAL SERVER ERROR if EmailValidator throws Error', async () => {
    const { sut, emailValidatorStub } = makeSut();

    vi.spyOn(emailValidatorStub, 'isValid').mockImplementationOnce(() => {
      throw new ServerError();
    });

    const httpRequest = {
      body: {
        name: 'valid_name',
        email: 'invalid_email',
        password: 'valid_password',
        passwordConfirmation: 'valid_password',
      },
    };

    const httpResponse = await sut.handle(httpRequest);

    expect(httpResponse.statusCode).toBe(500);
    expect(httpResponse.body).toEqual(new ServerError());
  });

  it('should return 500 INTERNAL SERVER ERROR if AddAccount throws Error', async () => {
    const { sut, addAccountStub } = makeSut();

    vi.spyOn(addAccountStub, 'add').mockImplementationOnce(() => {
      return new Promise((resolve, reject) => reject(new ServerError()));
    });

    const httpRequest = {
      body: {
        name: 'valid_name',
        email: 'invalid_email',
        password: 'valid_password',
        passwordConfirmation: 'valid_password',
      },
    };

    const httpResponse = await sut.handle(httpRequest);

    expect(httpResponse.statusCode).toBe(500);
    expect(httpResponse.body).toEqual(new ServerError());
  });

  it('should call EmailValidator with correct email', () => {
    const { sut, emailValidatorStub } = makeSut();
    const isValidSpy = vi.spyOn(emailValidatorStub, 'isValid');

    const httpRequest = {
      body: {
        name: 'valid_name',
        email: 'valid_email',
        password: 'valid_password',
        passwordConfirmation: 'valid_password',
      },
    };

    sut.handle(httpRequest);

    expect(isValidSpy).toHaveBeenCalledWith('valid_email');
  });

  it('should call AddAccount with correct values', () => {
    const { sut, addAccountStub } = makeSut();
    const addSpy = vi.spyOn(addAccountStub, 'add');

    const httpRequest = {
      body: {
        name: 'valid_name',
        email: 'valid_email',
        password: 'valid_password',
        passwordConfirmation: 'valid_password',
      },
    };

    sut.handle(httpRequest);

    expect(addSpy).toHaveBeenCalledWith({
      name: 'valid_name',
      email: 'valid_email',
      password: 'valid_password',
    });
  });

  it('should return 201 CREATED if valid data is provided', async () => {
    const { sut } = makeSut();

    const httpRequest = {
      body: {
        name: 'valid_name',
        email: 'valid_email',
        password: 'valid_password',
        passwordConfirmation: 'valid_password',
      },
    };

    const httpResponse = await sut.handle(httpRequest);

    expect(httpResponse.statusCode).toBe(201);
    expect(httpResponse.body).toEqual({
      id: 'valid_id',
      name: 'valid_name',
      email: 'valid_email',
      password: 'valid_password',
    });
  });
});
