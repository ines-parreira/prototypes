import {fromJS} from 'immutable'
import {createSelector} from 'reselect'
import {createImmutableSelector} from '../../utils'
import {sortViews} from './utils'
import * as viewsConfig from '../../config/views'
import {getSettingsByType as getCurrentUserSettingsByType} from '../currentUser/selectors'

export const getViewsState = state => state.views || fromJS({})

export const getViews = createImmutableSelector(
    [getViewsState],
    state => state.get('items', fromJS([]))
)

export const getActiveView = createImmutableSelector(
    [getViewsState],
    state => state.get('active') || fromJS({})
)

export const hasActiveView = createSelector(
    [getActiveView],
    state => !state.isEmpty()
)

export const hasActiveViewOfType = type => createSelector(
    [hasActiveView, getActiveView],
    (isActive, activeView) => isActive && activeView.get('type') === type
)

export const isDirty = createSelector(
    [getActiveView],
    state => state.get('dirty') || false
)

export const isActiveViewTrashView = createSelector(
    [getActiveView],
    state => state.get('category') === 'system' && state.get('name').toLocaleLowerCase() === 'trash'
)

export const isEditMode = createSelector(
    [getActiveView],
    state => state.get('editMode') || false
)

export const areFiltersValid = createSelector(
    [getActiveView],
    (view) => {
        return !view.get('filters').includes(', \'\')')
    }
)

export const getActiveViewOrderDirection = createSelector(
    [getActiveView],
    state => state.get('order_dir') || ''
)

export const getActiveViewOrderBy = createSelector(
    [getActiveView],
    state => state.get('order_by') || ''
)

export const getActiveViewFilters = createSelector(
    [getActiveView],
    state => state.get('filters') || ''
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
    (views, activeView) => views.find(v => v.get('id') === activeView.get('id')) || fromJS({})
)

export const getSelectedItemsIds = createImmutableSelector(
    [getViewsState],
    state => state.getIn(['_internal', 'selectedItemsIds'], fromJS([]))
)

export const getPagination = createImmutableSelector(
    [getViewsState],
    state => state.getIn(['_internal', 'pagination'], fromJS({}))
)

export const getLastViewId = createSelector(
    [getViewsState],
    state => state.getIn(['_internal', 'lastViewId'])
)

export const getLoading = createSelector(
    [getViewsState],
    state => state.getIn(['_internal', 'loading'], fromJS({}))
)

// in props usage
// ex: isMerging: isLoading('merge')(state)
export const isLoading = name => createSelector(
    [getLoading],
    loading => loading.get(name, false)
)

// in component usage
// ex: isLoading: makeIsLoading(state)   then : const isMerging = isLoading('merge')
export const makeIsLoading = state => name => isLoading(name)(state)

export const getViewsByType = type => createImmutableSelector(
    [getViews, getCurrentUserSettingsByType(type.replace('list', 'views'))],
    (views, currentUserSettings) => {
        return views
        // keep only views of asked type
            .filter(view => view.get('type') === type)
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

export const getViewIdToDisplay = (type, urlViewId) => createSelector(
    [getViewsByType(type)],
    (views) => {
        if (urlViewId) {
            return parseInt(urlViewId)
        }

        if (views.isEmpty()) {
            return null
        }

        return parseInt(views.first().get('id'))
    }
)

export const makeGetViewIdToDisplay = state => (type, urlViewId) => getViewIdToDisplay(type, urlViewId)(state)

/**
 * Return view of asked id, if id is 'new' it generates a new view according to config
 * @param id {String}
 * @param configName {String} - optional
 */
export const getView = (id, configName = '') => createImmutableSelector(
    [getViews],
    views => {
        if (id === 'new' || !id) {
            if (!configName) {
                console.error(`Can't get new view with config name "${configName}"`)
                return fromJS({})
            }

            return viewsConfig.getConfigByName(configName).get('newView')()
        }

        return views.find(view => view.get('id') === parseInt(id), null, fromJS({}))
    }
)

export const makeGetView = state => (id, configName) => getView(id, configName)(state)

/**
 * Return the count for a given view. Default to 0
 * @param viewId
 */
export const getViewCount = (viewId) => createSelector(
    [getViewsState],
    state => {
        const counts = state.get('counts', fromJS({}))
        return counts.get(viewId.toString(), 0)
    }
)

export const makeGetViewCount = state => (viewId) => getViewCount(viewId)(state)
