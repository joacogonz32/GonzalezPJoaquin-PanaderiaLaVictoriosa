export function createIdGenerator(startingId = 1) {
    let currentId = startingId;
    return function nextId() {
        return currentId++;
    };
}
