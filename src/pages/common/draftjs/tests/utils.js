export const isOccupied = (array) => {
    return array.every((character) => character !== null)
}

export const isEntirelyNull = (array) => {
    return array.every((character) => character === null)
}
