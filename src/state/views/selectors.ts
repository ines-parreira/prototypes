import {fromJS, Map, List} from 'immutable'
import {createSelector} from 'reselect'
import moment from 'moment'

import {createImmutableSelector} from '../../utils'
import * as viewsConfig from '../../config/views'
import {UserSettingType} from '../../config/types/user'
import {ViewType, ViewVisibility} from '../../models/view/types'
import {
    getSettingsByType as getCurrentUserSettingsByType,
    makeGetSettingsByType,
} from '../currentUser/selectors'
import {RootState} from '../types'
import {DEPRECATED_getViewsOrderingSetting} from '../currentAccount/selectors'

import {sortViews} from './utils'
import {ViewsState} from './types'

export const getViewsState = (state: RootState): ViewsState =>
    state.views || fromJS({})

export const getViews = createImmutableSelector<
    RootState,
    List<any>,
    ViewsState
>(getViewsState, (state) => state.get('items', fromJS([])) as List<any>)

export const getActiveView = createImmutableSelector<
    RootState,
    Map<any, any>,
    ViewsState
>(
    getViewsState,
    (state) => (state.get('active') || fromJS({})) as Map<any, any>
)

export const hasActiveView = createSelector<RootState, boolean, Map<any, any>>(
    getActiveView,
    (state) => !state.isEmpty()
)

export const hasActiveViewOfType = (type: string) =>
    createSelector<RootState, boolean, boolean, Map<any, any>>(
        hasActiveView,
        getActiveView,
        (isActive, activeView) => isActive && activeView.get('type') === type
    )

export const isDirty = createSelector<RootState, boolean, Map<any, any>>(
    getActiveView,
    (state) => (state.get('dirty') as boolean) || false
)

export const isActiveViewTrashView = createSelector<
    RootState,
    boolean,
    Map<any, any>
>(
    getActiveView,
    (state) =>
        state.get('category') === 'system' &&
        (state.get('name') as string).toLocaleLowerCase() === 'trash'
)

export const isEditMode = createSelector<RootState, boolean, Map<any, any>>(
    getActiveView,
    (state) => (state.get('editMode') as boolean) || false
)

export const areFiltersValid = createSelector<
    RootState,
    boolean,
    Map<any, any>
>(getActiveView, (view) => {
    const filters = (view.get('filters') as string) || ''
    return ![", '')", ', [])'].some((pattern: string) =>
        filters.includes(pattern)
    )
})

export const getActiveViewOrderDirection = createSelector<
    RootState,
    string,
    Map<any, any>
>(getActiveView, (state) => (state.get('order_dir') as string) || '')

export const getActiveViewOrderBy = createSelector<
    RootState,
    string,
    Map<any, any>
>(getActiveView, (state) => (state.get('order_by') as string) || '')

export const getActiveViewFilters = createSelector<
    RootState,
    string,
    Map<any, any>
>(getActiveView, (state) => (state.get('filters') as string) || '')

export const getActiveViewConfig = createSelector<
    RootState,
    Map<any, any>,
    Map<any, any>
>(getActiveView, (view) => {
    return viewsConfig.getConfigByType(view.get('type'))
})

export const areAllActiveViewItemsSelected = createSelector<
    RootState,
    boolean,
    Map<any, any>
>(getActiveView, (state) => (state.get('allItemsSelected') as boolean) || false)

/**
 * Retrieve the "active" view from views list instead of the one register in "active" property of the state
 * This way we have the pristine view which is currently active, before it has been copied in the "active" property and
 * probably modified
 */
export const getPristineActiveView = createImmutableSelector<
    RootState,
    Map<any, any>,
    List<any>,
    Map<any, any>
>(
    getViews,
    getActiveView,
    (views, activeView) =>
        (views.find(
            (v: Map<any, any>) => v.get('id') === activeView.get('id')
        ) || fromJS({})) as Map<any, any>
)

export const getSelectedItemsIds = createImmutableSelector<
    RootState,
    List<any>,
    ViewsState
>(
    getViewsState,
    (state) =>
        state.getIn(['_internal', 'selectedItemsIds'], fromJS([])) as List<any>
)

export const getNavigation = createImmutableSelector<
    RootState,
    Map<any, any>,
    ViewsState
>(
    getViewsState,
    (state) =>
        (state.getIn(['_internal', 'navigation']) || fromJS({})) as Map<
            any,
            any
        >
)

/**
 * If there is no previous items, it means we're on the first items of the active view.
 */
export const isOnFirstPage = createImmutableSelector<
    RootState,
    boolean,
    Map<any, any>
>(getNavigation, (state) => !state.get('prev_items'))

export const getLastViewId = createSelector<RootState, number, ViewsState>(
    getViewsState,
    (state) => state.getIn(['_internal', 'lastViewId']) as number
)

export const getLoading = createSelector<RootState, Map<any, any>, ViewsState>(
    getViewsState,
    (state) =>
        state.getIn(['_internal', 'loading'], fromJS({})) as Map<any, any>
)

// in props usage
// ex: isMerging: isLoading('merge')(state)
export const isLoading = (name: string) =>
    createSelector<RootState, boolean, Map<any, any>>(
        getLoading,
        (loading) => loading.get(name, false) as boolean
    )

// in component usage
// ex: isLoading: makeIsLoading(state)   then : const isMerging = isLoading('merge')
export const makeIsLoading = (state: RootState) => (name: string) =>
    isLoading(name)(state)

const _getViewsByType = (
    views: List<any>,
    currentUserSettings: Map<any, any>,
    accountSettings: Map<any, any>,
    type: ViewType
) => {
    const filteredViews = views.filter(
        (view: Map<any, any>) => view.get('type') === type
    )
    const publicViews = filteredViews
        .filter(
            (view: Map<any, any>) =>
                view.get('visibility') !== ViewVisibility.Private
        )
        .map((view: Map<any, any>) => {
            const viewId = view.get('id') as number

            const displayOrder = accountSettings.getIn(
                ['data', 'views', viewId.toString(), 'display_order'],
                view.get('display_order', 0)
            ) as number

            // TODO: hide property should be removed down the line once Immutable is removed
            return view.set('hide', false).set('display_order', displayOrder)
        })
        .sort(sortViews) as List<any>

    const privateViews = filteredViews
        .filter(
            (view: Map<any, any>) =>
                view.get('visibility') === ViewVisibility.Private
        )
        .map((view: Map<any, any>) => {
            const viewId = view.get('id') as number
            const viewSetting = currentUserSettings.getIn(
                ['data', viewId.toString()],
                fromJS({})
            ) as Map<any, any>

            const displayOrder = viewSetting.get(
                'display_order',
                view.get('display_order', 0)
            ) as number

            // TODO: hide property should be removed down the line once Immutable is removed
            return view.set('hide', false).set('display_order', displayOrder)
        })
        .sort(sortViews) as List<any>

    return publicViews.concat(privateViews) as List<any>
}

export const makeGetViewsByType = () => {
    const getSettingsByType = makeGetSettingsByType()
    return createImmutableSelector<
        RootState,
        List<any>,
        List<any>,
        Map<any, any>,
        Map<any, any>,
        ViewType
    >(
        getViews,
        (state: RootState) =>
            getSettingsByType(state, UserSettingType.ViewsOrdering),
        (state: RootState) => DEPRECATED_getViewsOrderingSetting(state),
        (state: RootState, type: ViewType) => type,
        _getViewsByType
    )
}

const getViewsByType = (type: ViewType) =>
    createImmutableSelector<
        RootState,
        List<any>,
        List<any>,
        Map<any, any>,
        Map<any, any>
    >(
        getViews,
        getCurrentUserSettingsByType(UserSettingType.ViewsOrdering),
        DEPRECATED_getViewsOrderingSetting,
        (views, currentUserSettings, accountSettings) =>
            _getViewsByType(views, currentUserSettings, accountSettings, type)
    )

export const getViewIdToDisplay = (type: ViewType, urlViewId: Maybe<string>) =>
    createSelector<RootState, Maybe<number>, List<any>>(
        getViewsByType(type),
        (views) => {
            if (urlViewId) {
                // Prevent suggesting a view with the wrong type
                const matchingView = views.find(
                    (view: Map<any, any>) =>
                        view.get('id') === parseInt(urlViewId)
                )
                if (matchingView) {
                    return parseInt(urlViewId)
                }
            }

            if (views.isEmpty()) {
                return null
            }

            return parseInt(
                (views.first() as Map<any, any>).get('id') as string
            )
        }
    )

export const makeGetViewIdToDisplay =
    (state: RootState) => (type: ViewType, urlViewId: Maybe<string>) =>
        getViewIdToDisplay(type, urlViewId)(state)

/**
 * Return view of asked id, if id is 'new' it generates a new view according to config
 */
export const getView = (id: string, configName: Maybe<string> = '') =>
    createImmutableSelector<RootState, Map<any, any>, List<any>>(
        getViews,
        (views) => {
            if (id === 'new' || !id) {
                if (!configName) {
                    console.error(
                        `Can't get new view with config name "${String(
                            configName
                        )}"`
                    )
                    return fromJS({}) as Map<any, any>
                }

                return (
                    viewsConfig
                        .getConfigByName(configName)
                        .get('newView') as () => Map<any, any>
                )()
            }

            return views.find(
                (view: Map<any, any>) => view.get('id') === parseInt(id),
                null,
                fromJS({})
            ) as Map<any, any>
        }
    )

export const makeGetView =
    (state: RootState) => (id: string, configName?: Maybe<string>) =>
        getView(id, configName)(state)

/**
 * Return the count for a given view. Default to 0
 */
export const getViewCount = (viewId: string) =>
    createSelector<RootState, number, ViewsState>(getViewsState, (state) => {
        const counts = state.get('counts', fromJS({})) as Map<any, any>
        return counts.get(viewId.toString(), null) as number
    })

export const makeGetViewCount = (state: RootState) => (viewId: string) =>
    getViewCount(viewId)(state)

export const getRecentViews = createSelector<
    RootState,
    Map<any, any>,
    ViewsState
>(
    getViewsState,
    (state) => (state.get('recent') || fromJS({})) as Map<any, any>
)

export const getViewIdsOrderedByCollapsedSections = () =>
    createSelector<RootState, List<any>, List<any>, List<any>>(
        getViewsByType(ViewType.TicketList),
        getViewsByType(ViewType.CustomerList),
        (ticketViews, userViews) => {
            const hiddenSectionIds: number[] = JSON.parse(
                window.localStorage.getItem('collapsed-view-sections') || '[]'
            )

            return ticketViews
                .concat(userViews)
                .sort(
                    (view1: Map<any, any>, view2: Map<any, any>) =>
                        +hiddenSectionIds.includes(view1.get('section_id')) -
                        +hiddenSectionIds.includes(view2.get('section_id'))
                )
                .map(
                    (view: Map<any, any>) => view.get('id') as number
                ) as List<any>
        }
    )
/**
 * Get id of views which have their counts expired
 */
export const getExpiredViewsCounts = () =>
    createSelector<
        RootState,
        number[],
        Map<string, Map<string, unknown>>,
        (viewId: string) => number
    >(getRecentViews, makeGetViewCount, (recentViews, getViewCount) => {
        return (
            recentViews.entrySeq().toArray() as [string, Map<string, unknown>][]
        )
            .filter(([viewId, recentView]) => {
                const count = getViewCount(viewId)
                const countUpdatedAt = recentView.get('updated_datetime')
                if (countUpdatedAt) {
                    const expireAt = moment(countUpdatedAt as string).add(
                        viewsConfig.getExpirationTimeForCount(count),
                        's'
                    )
                    return expireAt.isBefore(moment.utc())
                }
                return true
            })
            .map(([viewId]) => parseInt(viewId))
    })
