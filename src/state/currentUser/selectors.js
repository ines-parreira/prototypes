import {fromJS} from 'immutable'
import {createSelector} from 'reselect'
import {getViews} from '../views/selectors'

import {DEFAULT_PREFERENCES} from './../../config'

export const getCurrentUserState = state => state.currentUser || fromJS({})

export const getCurrentUser = createSelector(
    [getCurrentUserState],
    state => state
)

export const getSettings = createSelector(
    [getCurrentUserState],
    state => state.get('settings', fromJS([]))
)

export const getSettingsByType = type => createSelector(
    [getViews, getSettings],
    (views, settings) => {
        settings = settings.find(setting => setting.get('type') === type, null, fromJS({type, data: {}}))

        // update settings according to views configuration
        views.forEach((view) => {
            const viewId = view.get('id')
            const viewSetting = settings.getIn(['data', viewId.toString()], fromJS({}))

            const hide = viewSetting.get('hide', false)
            const displayOrder = viewSetting.get('display_order', view.get('display_order', 0))

            settings = settings
                .setIn(['data', viewId.toString(), 'hide'], hide)
                .setIn(['data', viewId.toString(), 'display_order'], displayOrder)
        })

        return settings
    }
)

export const getApiKey = createSelector(
    [getCurrentUserState],
    state => state.getIn(['auths', 0, 'data', 'token']) || ''
)

export const getPreferences = createSelector(
    [getSettings],
    state => {
        return fromJS({
            type: 'preferences',
            data: DEFAULT_PREFERENCES
        })
        .mergeDeep(state.find((s) => s.get('type') === 'preferences'))
    }
)
