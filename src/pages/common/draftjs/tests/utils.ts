export const isOccupied = (array: any[]) => {
    return array.every((character) => character !== null)
}

export const isEntirelyNull = (array: any[]) => {
    return array.every((character) => character === null)
}
