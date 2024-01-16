import { Field, SmartContract, State, state, method } from 'o1js';

export class Counter extends SmartContract {
  @state(Field) value = State<Field>();

  init() {
    super.init();
    this.value.set(Field(0));
  }

  @method increase_counter() {
    const value = this.value.get();
    this.value.requireEquals(value);
    this.value.set(value.add(1));
  }

  @method decrease_counter() {
    const value = this.value.get();
    value.assertGreaterThan(Field(0));
    this.value.set(value.sub(1));
  }
}
