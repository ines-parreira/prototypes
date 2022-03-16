import {fromJS, List, Map} from 'immutable'
import {createSelector} from 'reselect'

import {RootState} from '../types'
import {DEFAULT_PREFERENCES} from '../../config'
import {UserSetting, UserSettingType} from '../../config/types/user'
import {createImmutableSelector} from '../../utils'

import {CurrentUserState} from './types'

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

    // add views and update settings according to views configuration
    views.forEach((view: Map<any, any>) => {
        const viewId: number = view.get('id')
        const viewSetting: Map<any, any> = formattedSettings.getIn(
            ['data', 'views', viewId.toString()],
            fromJS({})
        )

        const displayOrder: number = viewSetting.get(
            'display_order',
            view.get('display_order', 0)
        )

        formattedSettings = formattedSettings
            .setIn(['data', viewId.toString(), 'hide'], false) // TODO: should be removed down the line once Immutable is removed
            .setIn(['data', viewId.toString(), 'display_order'], displayOrder)
    })

    return formattedSettings
}

export const makeGetSettingsByType = () =>
    createImmutableSelector<
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
    createImmutableSelector<RootState, Map<any, any>, List<any>, List<any>>(
        typeSafeGetViews,
        getSettings,
        (views, settings) => _getSettingsByType(views, settings, type)
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
    return (
        fromJS({
            type: 'preferences',
            data: DEFAULT_PREFERENCES,
        }) as Map<any, any>
    ).mergeDeep(
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

export const has2FaEnabled = createSelector<
    RootState,
    boolean,
    CurrentUserState
>(getCurrentUserState, (state) => !!state.get('has_2fa_enabled'))

export const getTimezone = createSelector<
    RootState,
    string | null,
    CurrentUserState
>(
    getCurrentUserState,
    (state) => (state.get('timezone') as Maybe<string>) || null
)

const createUserSettingSelector = (type: UserSettingType) =>
    createSelector<RootState, Maybe<UserSetting>, CurrentUserState>(
        getCurrentUserState,
        (state) =>
            ((state.get('settings') as List<any>).toJS() as UserSetting[]).find(
                (item) => item.type === type
            )
    )

export const getViewsOrderingUserSetting = createUserSettingSelector(
    UserSettingType.ViewsOrdering
)

export const getLoadingState = createSelector<
    RootState,
    Map<any, any>,
    CurrentUserState
>(
    getCurrentUserState,
    (state: CurrentUserState) =>
        (state.getIn(['_internal', 'loading']) as Map<any, any>) || fromJS({})
)

export const isLoading = (name: string | string[]) =>
    createSelector<RootState, boolean, Map<any, any>>(
        getLoadingState,
        (loadingState: Map<any, any>) =>
            loadingState.getIn(
                typeof name === 'string' ? [name] : name,
                false
            ) as boolean
    )
