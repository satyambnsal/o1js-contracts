import { PrivateKey, PublicKey, Mina, AccountUpdate, Field } from 'o1js';
import { Factorial } from './Factorial';

let proofsEnabled = false;

let deployerAccount: PublicKey;
let deployerKey: PrivateKey;
let senderAccount: PublicKey;
let senderKey: PrivateKey;
let factorialAppAddress: PublicKey;
let factorialAppKey: PrivateKey;
let factorialApp: Factorial;

describe('factorial', () => {
  beforeAll(async () => {
    if (proofsEnabled) await Factorial.compile();
  });

  beforeEach(() => {
    const LocalInstance = Mina.LocalBlockchain({ proofsEnabled });
    Mina.setActiveInstance(LocalInstance);
    ({ privateKey: deployerKey, publicKey: deployerAccount } =
      LocalInstance.testAccounts[0]);
    ({ privateKey: senderKey, publicKey: senderAccount } =
      LocalInstance.testAccounts[1]);
    factorialAppKey = PrivateKey.random();
    factorialAppAddress = factorialAppKey.toPublicKey();
    factorialApp = new Factorial(factorialAppAddress);
  });

  async function localDeploy() {
    const txn = await Mina.transaction(deployerAccount, () => {
      AccountUpdate.fundNewAccount(deployerAccount);
      factorialApp.deploy();
    });
    await txn.prove();
    await txn.sign([deployerKey, factorialAppKey]).send();
  }

  it('should correctly increase the factorial', async () => {
    await localDeploy();
    const counter = factorialApp.counter.get();
    expect(counter).toEqual(Field(0));

    const txn = await Mina.transaction(senderAccount, () => {
      factorialApp.calculate_factorial(Field(1));
    });
    await txn.prove();
    await txn.sign([senderKey]).send();
    const updated_counter = factorialApp.counter.get();
    expect(updated_counter).toEqual(Field(1));
  });
});
