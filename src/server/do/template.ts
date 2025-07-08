import { DurableObject } from 'cloudflare:workers';

interface State {
  counter: number;
}

const initialState: State = {
  counter: 0,
};

export class DurableObjectTemplate extends DurableObject<Env> {
  state: State;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.state = initialState;
    this.ctx.blockConcurrencyWhile(async () => {
      this.state = (await this.ctx.storage.get('state')) || initialState;
    });
  }

  getCounter() {
    return this.state.counter;
  }

  updateCounter(counter: number) {
    this.state.counter = counter;
    this.ctx.storage.put('state', this.state);
  }

  incrementCounter() {
    this.state.counter++;
    this.ctx.storage.put('state', this.state);
    return this.state.counter;
  }

  decrementCounter() {
    this.state.counter--;
    this.ctx.storage.put('state', this.state);
    return this.state.counter;
  }
}
