// @flow
import {isCurrentlyOnView} from '../../utils'

// types
import type {viewsStateType} from '../views/types'

const ignoredIds = ['search', 'new', '0', 0]

/**
 * Return true if view should be updated (refetched)
 * @param viewId
 * @param viewsState
 * @returns {boolean}
 */
export const shouldUpdateView = (viewId: string, viewsState: viewsStateType): boolean => {
    return !ignoredIds.includes(viewId) && isCurrentlyOnView(viewId, viewsState)
}
