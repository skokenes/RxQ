import qrs from "../qrs";

export default function connectQRS(config, temp) {
    return new qrs(config, temp);
};