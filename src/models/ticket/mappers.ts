type NormalizedDataStructure = {
    [key in string | number]: {
        id: string | number
        [anyKey: string]: unknown
    }
}

export const mapNormalizedToArray = <Input extends NormalizedDataStructure>(
    normalizedDataStructure: Input
) => {
    return Object.values(normalizedDataStructure)
}
