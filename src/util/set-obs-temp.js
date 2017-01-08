export default function(obs, temp) {
    if(temp === "cold") {
        return obs;
    }
    else if(temp === "warm") {
        return obs
            .publishReplay(1)
            .refCount();
    }
    else if(temp === "hot") {
        const hotObs = obs.publishReplay(1);
        hotObs.connect();
        return hotObs;
    }
}