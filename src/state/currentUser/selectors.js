// @flow
import {fromJS} from 'immutable'
import {createSelector} from 'reselect'

import {getViews} from '../views/selectors'
import type {stateType} from '../types'
import {DEFAULT_PREFERENCES} from '../../config'
import {createImmutableSelector} from '../../utils'

// types

export const getCurrentUserState = (state: stateType) => state.currentUser || fromJS({})

export const getCurrentUser = createSelector(
    [getCurrentUserState],
    (state) => state
)

export const getSettings = createSelector(
    [getCurrentUserState],
    (state) => state.get('settings') || fromJS([])
)

const _getSettingsByType = (views, settings, type) => {
    (settings) = settings.find((setting) => setting.get('type') === type) || fromJS({type, data: {}})

    // add vies and update settings according to views configuration
    views.forEach((view) => {
        const viewId = view.get('id')
        const viewSetting = settings.getIn(['data', viewId.toString()], fromJS({}))

        const hide = viewSetting.get('hide') || false
        const displayOrder = viewSetting.get('display_order', view.get('display_order', 0))

        settings = settings
            .setIn(['data', viewId.toString(), 'hide'], hide)
            .setIn(['data', viewId.toString(), 'display_order'], displayOrder)
    })

    return settings
}

export const makeGetSettingsByType = () => createImmutableSelector(
    [getViews, getSettings, (state, type) => type],
    _getSettingsByType
)

// used to get ticket-views and customer-views user preferences
export const getSettingsByType = (type: string) => createImmutableSelector(
    [getViews, getSettings],
    (views, settings) => _getSettingsByType(views, settings, type)
)

export const getApiKey = createSelector(
    [getCurrentUserState],
    (state) => state.getIn(['auths', 0, 'data', 'token']) || ''
)

export const getPreferences = createSelector(
    [getSettings],
    (state) => {
        return fromJS({
            type: 'preferences',
            data: DEFAULT_PREFERENCES
        })
            .mergeDeep(state.find((setting) => setting.get('type') === 'preferences') || fromJS({}))
    }
)

export const isAvailable = createSelector(
    [getPreferences],
    (state) => state.getIn(['data', 'available'])
)

export const isHidingTips = createSelector(
    [getPreferences],
    (state) => state.getIn(['data', 'hide_tips']) || false
)

export const isActive = createSelector(
    [getCurrentUserState],
    (state) => state.get('is_active') !== false
)

export const getTimezone = createSelector(
    [getCurrentUserState],
    (state) => state.get('timezone') || null
)
