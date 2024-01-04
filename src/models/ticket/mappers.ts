export const mapNormalizedToArray = <Subtype>(normalizedDataStructure: {
    [key in string | number]: Subtype
}): Subtype[] => {
    return Object.values(normalizedDataStructure)
}
