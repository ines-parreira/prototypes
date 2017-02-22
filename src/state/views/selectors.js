import {fromJS} from 'immutable'
import {createSelector} from 'reselect'
import {sortViews} from './utils'
import {getSettingsByType as getCurrentUserSettingsByType} from '../currentUser/selectors'

export const getViewsState = state => state.views || fromJS({})

export const getViews = createSelector(
    [getViewsState],
    state => state.get('items', fromJS([]))
)

export const getActiveView = createSelector(
    [getViewsState],
    state => state.get('active') || fromJS({})
)

export const getActiveViewSearch = createSelector(
    [getActiveView],
    state => state.get('search') || ''
)

export const getActiveViewFilters = createSelector(
    [getActiveView],
    state => state.get('filters') || ''
)

export const getView = id => createSelector(
    [getViews],
    views => views.find((view) => view.get('id') === id, null, fromJS({}))
)

export const makeGetView = state => id => getView(id)(state)

export const getSelectedItemsIds = createSelector(
    [getViewsState],
    state => state.getIn(['_internal', 'selectedItemsIds'], fromJS([]))
)

export const getViewsByType = type => createSelector(
    [getViews, getCurrentUserSettingsByType(type.replace('list', 'views'))],
    (views, currentUserSettings) => views
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
)
