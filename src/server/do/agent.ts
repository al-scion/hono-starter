import { AIChatAgent } from "agents/ai-chat-agent";

interface State {
  counter: number
}

export class Agent extends AIChatAgent<Env, State> {
  
  // async onRequest(request: Request): Promise<Response> {
  //   return await super.onRequest(request)
  // }
  // async onStart() {}
  // async onConnect(connection: Connection, ctx: ConnectionContext) {}
  // async onClose(connection: Connection, code: number, reason: string, wasClean: boolean) {}
  // async onError(error: unknown) {console.error(`WS error: ${error}`)}
  // async onMessage(connection: Connection, message: WSMessage) {}
  // async onStateUpdate(state: State | undefined, source: Connection | "server") {}
  // async onEmail(email: ForwardableEmailMessage) {console.log('email', email)}
  // async onAlarm() {}
}