import Session from "../session";
import { defer } from "rxjs";

export default function connectSession(config, opts) {
  const session = new Session(config, opts);

  return {
    global$: session.global(),
    notifications$: session.notifications$,
    close: () => {}
  };
}
