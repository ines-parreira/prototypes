import {TicketWithHighlights} from 'models/search/types'

export const mergeEntitiesWithHighlights = (
    searchResult: TicketWithHighlights
) => ({
    ...searchResult.entity,
    highlights: searchResult.highlights,
})
