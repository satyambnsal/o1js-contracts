import {
  Field,
  Reducer,
  SmartContract,
  State,
  state,
  method,
  Circuit,
  Struct,
} from 'o1js';

export class FactorialMap extends Struct({
  num: Field,
  result: Field,
}) {}

export class Factorial extends SmartContract {
  @state(Field) counter = State<Field>();
  @state(FactorialMap) fact_map = State<FactorialMap>();

  reducer = Reducer({ actionType: Field });

  init() {
    super.init();
    this.counter.set(Field(0));
  }

  @method get_factorial(n: Field) {
    this.increase_counter();
    let x = this.calculate_factorial(n);
    this.reducer.dispatch(x);
    this.fact_map.set(new FactorialMap({ num: n, result: x }));
  }

  @method calculate_factorial(n: Field): Field {
    return Circuit.if(
      n.equals(0).or(n.equals(1)),
      Field(1),
      n.mul(this.calculate_factorial(n.sub(1)))
    );
  }

  @method increase_counter() {
    const counter = this.counter.get();
    this.counter.requireEquals(counter);
    const updated_counter = counter.add(1);
    this.counter.set(updated_counter);
  }
}
