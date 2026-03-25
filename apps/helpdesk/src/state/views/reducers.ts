import { tryLocalStorage } from '@repo/browser-storage'
import type { List, Map } from 'immutable'
import { fromJS } from 'immutable'
import _isNumber from 'lodash/isNumber'
import moment from 'moment'

import { MAX_RECENT_VIEWS } from 'config/views'
import type { View } from 'models/view/types'
import { getCode } from 'utils'

import type { GorgiasAction, RootState } from '../types'
import * as constants from './constants'
import * as selectors from './selectors'
import type { ViewsState } from './types'
import {
    addFilterAST,
    addViewIfMissing,
    recentViewsStorage,
    removeFilterAST,
    updateCustomFieldFilter,
    updateFilterOperator,
    updateFilterValue,
    updateQAScoreFilter,
} from './utils'

export const initialState: ViewsState = fromJS({
    items: [],
    counts: {},
    active: {},
    recent: {},
    loading: false,
    _internal: {
        lastViewId: null,
        selectedItemsIds: [],
        navigation: {},
        loading: {
            fetchList: false,
            fetchListDiscreet: false,
        },
    },
})

export default function reducer(
    state: ViewsState = initialState,
    action: GorgiasAction,
): ViewsState {
    let items
    let code = ''
    let activeView = state.get('active', fromJS({})) as Map<any, any>

    switch (action.type) {
        case constants.ADD_RECENT_VIEW: {
            if (!action.viewId) {
                return state
            }

            // update recent views
            const newState = state.update('recent', (views: Map<any, any>) => {
                const now = moment.utc().toISOString()
                // merge the new view and keep the most recent ones
                return views
                    .mergeDeep(
                        fromJS({
                            [action.viewId as number]: {
                                inserted_datetime: now,
                            },
                        }),
                    )
                    .sortBy(
                        (view: Map<any, any>) =>
                            view.get('inserted_datetime') as string,
                    )
                    .slice(-MAX_RECENT_VIEWS)
            })

            // store recent view on the client
            const recentViews = selectors.getRecentViews({
                views: newState,
            } as RootState)
            const viewIds = recentViews
                .keySeq()
                .map((viewId: string) => parseInt(viewId))
                .toJS()
            recentViewsStorage.set(viewIds)

            return newState
        }

        case constants.UPDATE_RECENT_VIEWS: {
            // update datetime of given recent views
            return state.update('recent', (views: Map<any, any>) => {
                return views.map((view: Map<any, any>, viewId: string) => {
                    if (action.viewIds?.includes(parseInt(viewId))) {
                        return view.set(
                            'updated_datetime',
                            moment.utc().toISOString(),
                        )
                    }
                    return view
                })
            })
        }

        case constants.SET_VIEW_ACTIVE: {
            if (action.view) {
                return state.set('active', action.view)
            }
            return state
        }

        case constants.UPDATE_VIEW: {
            const view = action.view || activeView
            return state.set(
                'active',
                view.set('dirty', true).set('editMode', action.edit),
            )
        }

        case constants.ACTIVATE_VIEW_EDIT_MODE: {
            const view = action.view || activeView
            return state.set('active', view.set('editMode', true))
        }

        case constants.SET_FIELD_VISIBILITY: {
            const visibleFields = activeView.get(
                'fields',
                fromJS([]),
            ) as List<any>

            const fields = action.state
                ? visibleFields.push(action.name)
                : visibleFields.delete(visibleFields.indexOf(action.name))

            if (action.shouldStoreFieldConfig) {
                tryLocalStorage(() => {
                    localStorage.setItem(
                        constants.SEARCH_VIEW_FIELD_CONFIG_STORAGE_KEY,
                        JSON.stringify(fields.toJS()),
                    )
                })
            }

            activeView = activeView.set('fields', fields)

            return state.set('active', activeView)
        }

        case constants.SET_ORDER_DIRECTION: {
            return state.set(
                'active',
                activeView.merge(
                    action.direction
                        ? {
                              order_by: action.fieldPath,
                              order_dir: action.direction,
                          }
                        : {
                              order_by: undefined,
                              order_dir: undefined,
                          },
                ),
            )
        }

        case constants.ADD_VIEW_FIELD_FILTER: {
            // given a filter and our code+ast => generate new code/ast and save it to the state
            const nextAst = addFilterAST(activeView, action.filter as any)
            code = getCode(nextAst.toJS())
            activeView = activeView
                .set('filters_ast', nextAst)
                .set('filters', code)

            // enter edit mode
            activeView = activeView.set('editMode', true)

            return state.set('active', activeView.set('dirty', true))
        }

        case constants.REMOVE_VIEW_FIELD_FILTER: {
            if (action.index == null) {
                return state
            }
            const nextAst = removeFilterAST(activeView, action.index)
            if (nextAst) {
                code = getCode(nextAst.toJS())
            }
            activeView = activeView
                .set('filters_ast', nextAst)
                .set('filters', code)
            return state.set('active', activeView.set('dirty', true))
        }

        case constants.UPDATE_VIEW_FIELD_FILTER: {
            const ast = activeView.get('filters_ast') as Map<any, any>
            if (action.index == null || action.value == null) {
                return state
            }
            const nextAst = updateFilterValue(ast, action.index, action.value)
            code = getCode(nextAst.toJS())
            activeView = activeView
                .set('filters_ast', nextAst)
                .set('filters', code)
            return state.set('active', activeView.set('dirty', true))
        }

        case constants.UPDATE_VIEW_CUSTOM_FIELD_FILTER_ID: {
            const ast = activeView.get('filters_ast') as Map<any, any>
            if (
                action.index == null ||
                action.customFieldId == null ||
                action.customFieldOperator == null
            ) {
                return state
            }
            const nextAst = updateCustomFieldFilter(
                ast,
                action.index,
                action.customFieldId,
                action.customFieldOperator,
            )

            code = getCode(nextAst.toJS())
            activeView = activeView
                .set('filters_ast', nextAst)
                .set('filters', code)

            return state.set('active', activeView.set('dirty', true))
        }

        case constants.UPDATE_VIEW_QA_SCORE_FILTER_DIMENSION: {
            const ast = activeView.get('filters_ast')

            if (action.index == null || action.qaScoreDimension == null) {
                return state
            }

            const nextAst = updateQAScoreFilter(
                ast,
                action.index,
                action.qaScoreDimension,
            )

            code = getCode(nextAst.toJS())

            activeView = activeView
                .set('filters_ast', nextAst)
                .set('filters', code)

            return state.set('active', activeView.set('dirty', true))
        }

        case constants.UPDATE_VIEW_FIELD_FILTER_OPERATOR: {
            const ast = activeView.get('filters_ast') as Map<any, any>
            if (action.index == null || action.operator == null) {
                return state
            }
            const nextAst = updateFilterOperator(
                ast,
                action.index,
                action.operator,
            )
            code = getCode(nextAst.toJS())
            activeView = activeView
                .set('filters_ast', nextAst)
                .set('filters', code)
            return state.set('active', activeView.set('dirty', true))
        }

        case constants.RESET_VIEW: {
            // find the original view from the state and replace the active view
            let original = selectors.getView(
                activeView.get('id'),
                action.configName,
            )({ views: state } as RootState)

            // if it's a new view, it's ID should be 0
            const isUpdate = original.get('id') !== 0

            if (isUpdate) {
                // if is updating an existing view, on reset we close edition panel
                original = original.set('dirty', false).set('editMode', false)
            } else {
                // if creating a new view, on reset we keep the edition panel open
                original = original.set('dirty', true).set('editMode', true)
            }

            return state.set('active', original)
        }

        case constants.SUBMIT_NEW_VIEW_SUCCESS: {
            return state.merge({
                items: addViewIfMissing(
                    state.get('items'),
                    action.resp as { id: number },
                ),
                active: (fromJS(action.resp) as Map<any, any>).set(
                    'dirty',
                    false,
                ),
            })
        }

        case constants.FETCH_VIEW_LIST_START: {
            return state.set('loading', true)
        }

        case constants.FETCH_VIEW_LIST_SUCCESS: {
            items = fromJS((action.resp as { data: View[] }).data) as List<any>

            const isEditMode = activeView.get('editMode')

            // also populate the active view state
            if (action.currentViewId) {
                activeView = items.find(
                    (item: Map<any, any>) =>
                        item.get('id') ===
                        parseInt(action.currentViewId as string),
                    null,
                    fromJS({}),
                )
                isEditMode && (activeView = activeView.set('editMode', true))
            }

            return state.merge({
                items,
                active: activeView,
                loading: false,
            })
        }

        case constants.CREATE_VIEW_SUCCESS: {
            return state.update('items', (items: List<any>) =>
                addViewIfMissing(items, action.resp as { id: number }),
            )
        }

        case constants.UPDATE_VIEW_SUCCESS: {
            let newState = state.update('items', (items: List<any>) =>
                items.map((view: Map<any, any>) => {
                    if (view.get('id') === (action.resp as { id: number }).id) {
                        return fromJS(action.resp) as Map<any, any>
                    }
                    return view
                }),
            )
            // also update the active view if we're on it
            if (
                newState.getIn(['active', 'id']) ===
                (action.resp as { id: number }).id
            ) {
                newState = newState.set('active', fromJS(action.resp))
            }

            // if the view wasn't shared with current user, add it to the list of views
            return newState.update('items', (items) =>
                addViewIfMissing(items, action.resp as any),
            )
        }

        case constants.DELETE_VIEW_SUCCESS: {
            return state.merge({
                items: (state.get('items') as List<any>).filter(
                    (item: Map<any, any>) => item.get('id') !== action.viewId,
                ),
            })
        }

        case constants.FETCH_LIST_VIEW_START: {
            let newState = state
            try {
                // if fetched view is a real view (not new view created, not search, etc.) we save it's id
                if (_isNumber(action.viewId) && action.viewId > 0) {
                    newState = newState.setIn(
                        ['_internal', 'lastViewId'],
                        action.viewId,
                    )
                }

                if (action.discreet) {
                    newState = newState.setIn(
                        ['_internal', 'loading', 'fetchListDiscreet'],
                        true,
                    )
                } else {
                    newState = newState
                        .setIn(['_internal', 'loading', 'fetchList'], true)
                        .setIn(['_internal', 'selectedItemsIds'], fromJS([]))
                }

                // reset total resources count so as to prevent the previous resource count
                // from being displayed while the new count is being fetched
                newState = newState.setIn(
                    ['_internal', 'navigation', 'total_resources'],
                    null,
                )
            } catch {}

            return newState
        }

        case constants.FETCH_LIST_VIEW_SUCCESS: {
            const meta = action.fetched?.meta

            return state
                .setIn(['_internal', 'navigation'], fromJS(meta))
                .setIn(['_internal', 'loading', 'fetchList'], false)
                .setIn(['_internal', 'loading', 'fetchListDiscreet'], false)
        }

        case constants.FETCH_LIST_VIEW_ERROR:
            return state
                .setIn(['_internal', 'loading', 'fetchList'], false)
                .setIn(['_internal', 'loading', 'fetchListDiscreet'], false)

        case constants.UPDATE_PAGE_SELECTION: {
            return state.setIn(['_internal', 'selectedItemsIds'], action.ids)
        }

        case constants.TOGGLE_ID_IN_PAGE_SELECTION: {
            const currentlySelected = state.getIn(
                ['_internal', 'selectedItemsIds'],
                fromJS([]),
            ) as List<any>

            const idx = currentlySelected.indexOf(action.id)

            // if already selected, deselect it
            if (~idx) {
                return state.setIn(
                    ['_internal', 'selectedItemsIds'],
                    currentlySelected.delete(idx),
                )
            }

            // otherwise select it
            return state.setIn(
                ['_internal', 'selectedItemsIds'],
                currentlySelected.push(action.id),
            )
        }

        case constants.TOGGLE_VIEW_SELECTION: {
            return state.updateIn(
                ['active', 'allItemsSelected'],
                (allItemsSelected) => !allItemsSelected,
            )
        }

        case constants.BULK_DELETE_SUCCESS: {
            return state.setIn(['_internal', 'selectedItemsIds'], fromJS([]))
        }

        case constants.SET_PAGE: {
            return state.setIn(['_internal', 'pagination', 'page'], action.page)
        }

        case constants.UPDATE_COUNTS: {
            const viewIds = Object.keys(action.counts || {})
            return (
                state
                    // update view counts
                    .mergeDeep({
                        counts: action.counts,
                    })
                    // update datetime when we receive count for a recent view
                    .update('recent', (views: Map<any, any>) => {
                        return views.map(
                            (view: Map<any, any>, viewId: string) => {
                                if (viewIds.includes(viewId)) {
                                    return view.set(
                                        'updated_datetime',
                                        moment.utc().toISOString(),
                                    )
                                }
                                return view
                            },
                        )
                    })
            )
        }

        default:
            return state
    }
}
