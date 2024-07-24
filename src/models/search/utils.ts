export const mergeEntitiesWithHighlights = <T, K>(searchResult: {
    entity: T
    highlights: K
}) => ({
    ...searchResult.entity,
    highlights: searchResult.highlights,
})
