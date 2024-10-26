import { Encrypter } from '../protocols/encrypter';
import { DbAddAccount } from './db-add-account';

interface SutTypes {
  sut: DbAddAccount;
  encrypterStub: Encrypter;
}

const makeEncrypter = (): Encrypter => {
  class EncrypterStub implements Encrypter {
    async encrypt(value: string): Promise<string> {
      console.log('value', value);
      return new Promise((resolve) => resolve('hashed_password'));
    }
  }

  return new EncrypterStub();
};

const makeSut = (): SutTypes => {
  const encrypterStub = makeEncrypter();

  const sut = new DbAddAccount(encrypterStub);

  return {
    sut,
    encrypterStub,
  };
};

describe('DbAddAccount UseCase', () => {
  it('should call Encrypter with correct password', async () => {
    const { sut, encrypterStub } = makeSut();

    const encryptSpy = vi.spyOn(encrypterStub, 'encrypt');

    const accountData = {
      name: 'valid_name',
      email: 'valid_email',
      password: 'valid_password',
    };

    await sut.add(accountData);

    expect(encryptSpy).toHaveBeenCalledWith(accountData.password);
  });

  it('should throw error if Encrypter throws', async () => {
    const { sut, encrypterStub } = makeSut();

    vi.spyOn(encrypterStub, 'encrypt').mockReturnValueOnce(
      new Promise((resolve, reject) => reject(new Error())),
    );

    const accountData = {
      name: 'valid_name',
      email: 'valid_email',
      password: 'valid_password',
    };

    const promise = sut.add(accountData);

    await expect(promise).rejects.toThrow();
  });
});
