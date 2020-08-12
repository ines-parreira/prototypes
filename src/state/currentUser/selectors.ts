import {fromJS, List, Map} from 'immutable'
import {createSelector} from 'reselect'

import {RootState} from '../types'
import {DEFAULT_PREFERENCES} from '../../config.js'
import {createImmutableSelector} from '../../utils.js'

import {CurrentUserState} from './types'

//$TsFixMe remove once state/utils are migrated
const typeSafeCreateImmutableCreator = createImmutableSelector as typeof createSelector
//$TsFixMe replace with getViews selector once state/views/selectors are migrated
const typeSafeGetViews = (state: RootState) =>
    (state.views || fromJS({})).get('items', fromJS([])) as List<any>

export const getCurrentUserState = (state: RootState): Map<any, any> =>
    (state.currentUser as CurrentUserState) || fromJS({})

export const getCurrentUser = createSelector<
    RootState,
    CurrentUserState,
    CurrentUserState
>(getCurrentUserState, (state) => state)

export const getSettings = createSelector<
    RootState,
    List<any>,
    CurrentUserState
>(
    getCurrentUserState,
    (state) => (state.get('settings') as List<any>) || fromJS([])
)

const _getSettingsByType = (
    views: List<any>,
    settings: List<any>,
    type: string
) => {
    let formattedSettings =
        (settings.find(
            (setting: Map<any, any>) => setting.get('type') === type
        ) as Map<any, any>) || fromJS({type, data: {}})

    // add vies and update settings according to views configuration
    views.forEach((view: Map<any, any>) => {
        const viewId: number = view.get('id')
        const viewSetting: Map<any, any> = formattedSettings.getIn(
            ['data', viewId.toString()],
            fromJS({})
        )

        const hide = (viewSetting.get('hide') as boolean) || false
        const displayOrder: number = viewSetting.get(
            'display_order',
            view.get('display_order', 0)
        )

        formattedSettings = formattedSettings
            .setIn(['data', viewId.toString(), 'hide'], hide)
            .setIn(['data', viewId.toString(), 'display_order'], displayOrder)
    })

    return formattedSettings
}

export const makeGetSettingsByType = () =>
    typeSafeCreateImmutableCreator<
        RootState,
        Map<any, any>,
        List<any>,
        List<any>,
        string
    >(
        typeSafeGetViews,
        getSettings,
        (state, type: string) => type,
        _getSettingsByType
    )

// used to get ticket-views and customer-views user preferences
export const getSettingsByType = (type: string) =>
    typeSafeCreateImmutableCreator<
        RootState,
        Map<any, any>,
        List<any>,
        List<any>
    >(typeSafeGetViews, getSettings, (views, settings) =>
        _getSettingsByType(views, settings, type)
    )

export const getApiKey = createSelector<RootState, string, CurrentUserState>(
    getCurrentUserState,
    (state) => (state.getIn(['auths', 0, 'data', 'token']) as string) || ''
)

export const getPreferences = createSelector<
    RootState,
    Map<any, any>,
    List<any>
>(getSettings, (state) => {
    return (fromJS({
        type: 'preferences',
        data: DEFAULT_PREFERENCES,
    }) as Map<any, any>).mergeDeep(
        (state.find(
            (setting: Map<any, any>) => setting.get('type') === 'preferences'
        ) as Maybe<Map<any, any>>) || fromJS({})
    )
})

export const isAvailable = createSelector<RootState, boolean, Map<any, any>>(
    getPreferences,
    (state) => state.getIn(['data', 'available']) as boolean
)

export const isHidingTips = createSelector<RootState, boolean, Map<any, any>>(
    getPreferences,
    (state) => (state.getIn(['data', 'hide_tips']) as boolean) || false
)

export const isActive = createSelector<RootState, boolean, CurrentUserState>(
    getCurrentUserState,
    (state) => state.get('is_active') !== false
)

export const getTimezone = createSelector<
    RootState,
    Maybe<string>,
    CurrentUserState
>(
    getCurrentUserState,
    (state) => (state.get('timezone') as Maybe<string>) || null
)
