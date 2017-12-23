import Session from "../session";

export default function connectSession(config, opts) {
    return new Session(config, opts).global();
}