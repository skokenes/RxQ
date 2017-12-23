import connectSession from "./connectSession";

export default function connectEngine(config, opts) {
    console.warn("DEPRECATION WARNING: connectEngine is deprecated and will be removed in a future version of RxQ. Use connectSession instead.");
    return connectSession(config, opts);
}