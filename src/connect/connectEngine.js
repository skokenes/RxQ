import Session from "../session";

export default function connectEngine(config, opts) {
    return new Session(config, opts).global();
};