import {CustomerWithHighlights, TicketWithHighlights} from 'models/search/types'

export const mergeEntitiesWithHighlights = (
    searchResult: TicketWithHighlights | CustomerWithHighlights
) => ({
    ...searchResult.entity,
    highlights: searchResult.highlights,
})
