// @flow
import {fromJS} from 'immutable'
import {createSelector} from 'reselect'
import type {Map, List} from 'immutable'
import moment from 'moment/moment'

import {createImmutableSelector} from '../../utils'
import * as viewsConfig from '../../config/views'
import {getSettingsByType as getCurrentUserSettingsByType} from '../currentUser/selectors'

import type {stateType} from '../types'

import {sortViews} from './utils'

export const getViewsState = (state: stateType) => state.views || fromJS({})

export const getViews = createImmutableSelector(
    [getViewsState],
    (state) => state.get('items', fromJS([]))
)

export const getActiveView = createImmutableSelector(
    [getViewsState],
    (state) => state.get('active') || fromJS({})
)

export const hasActiveView = createSelector(
    [getActiveView],
    (state) => !state.isEmpty()
)

export const hasActiveViewOfType = (type: string) => createSelector(
    [hasActiveView, getActiveView],
    (isActive, activeView) => isActive && activeView.get('type') === type
)

export const isDirty = createSelector(
    [getActiveView],
    (state) => state.get('dirty') || false
)

export const isActiveViewTrashView = createSelector(
    [getActiveView],
    (state) => state.get('category') === 'system' && state.get('name').toLocaleLowerCase() === 'trash'
)

export const isEditMode = createSelector(
    [getActiveView],
    (state) => state.get('editMode') || false
)

export const areFiltersValid = createSelector(
    [getActiveView],
    (view) => {
        const filters = view.get('filters') || ''
        return !([', \'\')', ', [])'].some((pattern) => filters.includes(pattern)))
    }
)

export const getActiveViewOrderDirection = createSelector(
    [getActiveView],
    (state) => state.get('order_dir') || ''
)

export const getActiveViewOrderBy = createSelector(
    [getActiveView],
    (state) => state.get('order_by') || ''
)

export const getActiveViewFilters = createSelector(
    [getActiveView],
    (state) => state.get('filters') || ''
)

export const getActiveViewConfig = createSelector(
    [getActiveView],
    (view) => {
        return viewsConfig.getConfigByType(view.get('type'))
    }
)

/**
 * Retrieve the "active" view from views list instead of the one register in "active" property of the state
 * This way we have the pristine view which is currently active, before it has been copied in the "active" property and
 * probably modified
 */
export const getPristineActiveView = createImmutableSelector(
    [getViews, getActiveView],
    (views, activeView) => views.find((v) => v.get('id') === activeView.get('id')) || fromJS({})
)

export const getSelectedItemsIds = createImmutableSelector(
    [getViewsState],
    (state) => state.getIn(['_internal', 'selectedItemsIds'], fromJS([]))
)

export const getPagination = createImmutableSelector(
    [getViewsState],
    (state) => state.getIn(['_internal', 'pagination'], fromJS({}))
)

export const getLastViewId = createSelector(
    [getViewsState],
    (state) => state.getIn(['_internal', 'lastViewId'])
)

export const getLoading = createSelector(
    [getViewsState],
    (state) => state.getIn(['_internal', 'loading'], fromJS({}))
)

// in props usage
// ex: isMerging: isLoading('merge')(state)
export const isLoading = (name: string) => createSelector(
    [getLoading],
    (loading) => loading.get(name, false)
)

// in component usage
// ex: isLoading: makeIsLoading(state)   then : const isMerging = isLoading('merge')
export const makeIsLoading = (state: stateType) => (name: string) => isLoading(name)(state)

export const getViewsByType = (type: string) => createImmutableSelector(
    [getViews, getCurrentUserSettingsByType(type.replace('list', 'views'))],
    (views, currentUserSettings) => {
        return views
        // keep only views of asked type
            .filter((view) => view.get('type') === type)
            // update views according to current user settings
            .map((view) => {
                const viewId = view.get('id')
                const viewSetting = currentUserSettings.getIn(['data', viewId.toString()], fromJS({}))

                const hide = viewSetting.get('hide', false)
                const displayOrder = viewSetting.get('display_order', view.get('display_order', 0))

                return view
                    .set('hide', hide)
                    .set('display_order', displayOrder)
            })
            // sort views by display order
            .sort(sortViews)
    }
)

export const getViewIdToDisplay = (type: string, urlViewId: ?string) => createSelector(
    [getViewsByType(type)],
    (views: List<Map<*, *>>) => {
        if (urlViewId) {
            // Prevent suggesting a view with the wrong type
            const matchingView = views.find((view) => view.get('id') === parseInt(urlViewId))
            if (matchingView) {
                return parseInt(urlViewId)
            }
        }

        if (views.isEmpty()) {
            return null
        }

        return parseInt(views.first().get('id'))
    }
)

export const makeGetViewIdToDisplay = (state: stateType) => (type: string, urlViewId: ?string) => getViewIdToDisplay(type, urlViewId)(state)

/**
 * Return view of asked id, if id is 'new' it generates a new view according to config
 * @param id {String}
 * @param configName {String} - optional
 */
export const getView = (id: string, configName: ?string = '') => createImmutableSelector(
    [getViews],
    (views) => {
        if (id === 'new' || !id) {
            if (!configName) {
                console.error(`Can't get new view with config name "${String(configName)}"`)
                return fromJS({})
            }

            return viewsConfig.getConfigByName(configName).get('newView')()
        }

        return views.find((view) => view.get('id') === parseInt(id), null, fromJS({}))
    }
)

export const makeGetView = (state: stateType) => (id: string, configName: ?string) => getView(id, configName)(state)

/**
 * Return the count for a given view. Default to 0
 * @param viewId
 */
export const getViewCount = (viewId: string) => createSelector(
    [getViewsState],
    (state) => {
        const counts = state.get('counts', fromJS({}))
        return counts.get(viewId.toString(), null)
    }
)

export const makeGetViewCount = (state: stateType) => (viewId: string) => getViewCount(viewId)(state)

export const getRecentViews = createSelector(
    [getViewsState],
    (state) => state.get('recent') || fromJS({})
)

export const getVisibleViewIds = () => createSelector(
    [getViewsByType('ticket-list'), getViewsByType('customer-list')],
    (ticketViews, userViews) => {
        const views = ticketViews.concat(userViews).filter((v) => !v.get('hide'))
        return views.map((v) => v.get('id'))
    }
)

/**
 * Get id of views which have their counts expired
 * @param offset a time in seconds
 * @returns {Reselect.Selector<any, any>}
 */
export const getExpiredViewsCounts = (offset: number) => createSelector(
    [getRecentViews],
    (recentViews) => {
        return recentViews
            .filter((view) => {
                const expireAt = moment(view.get('updated_datetime')).add(offset, 's')
                return expireAt.isBefore(moment.utc())
            })
            .keySeq()
            .map((viewId) => parseInt(viewId))
            .toList()
    }
)


