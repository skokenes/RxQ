import Session from "../session";
import { defer } from "rxjs/observable/defer";

export default function connectSession(config, opts) {
    return defer(() => new Session(config, opts).global());
}