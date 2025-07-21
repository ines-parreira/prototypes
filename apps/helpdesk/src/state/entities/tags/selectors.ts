import { createSelector } from 'reselect'

import { getEntities } from 'state/entities/selectors'

export const getEntitiesTags = createSelector(
    getEntities,
    (state) => state.tags,
)
