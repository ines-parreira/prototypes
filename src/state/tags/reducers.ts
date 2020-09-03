import {fromJS, Map, List} from 'immutable'

import {PaginationMeta} from '../../models/api/types'
import {GorgiasAction} from '../types'

import * as constants from './constants.js'
import {TagsState, Tag} from './types'

export const initialState: TagsState = fromJS({
    _internal: {},
    meta: {},
    items: [],
})

export default function reducer(
    state: TagsState = initialState,
    action: GorgiasAction
): TagsState {
    switch (action.type) {
        case constants.FETCH_TAG_LIST_SUCCESS:
            return state
                .set('items', fromJS((action.resp as {data: Tag[]}).data))
                .set('meta', fromJS({})) // reset selection and editing state for all tags
                .setIn(
                    ['_internal', 'pagination'],
                    fromJS((action.resp as {meta: PaginationMeta}).meta)
                )

        case constants.ADD_TAGS:
            return state.set(
                'items',
                (state.get('items') as List<any>).concat(action.tags)
            )

        case constants.SELECT_TAG: {
            const selected = !state.getIn(['meta', action.tag?.id, 'selected'])
            let selectedState = state.setIn(
                ['meta', action.tag?.id, 'selected'],
                selected
            )

            if (!selected) {
                selectedState = selectedState.setIn(
                    ['_internal', 'selectAll'],
                    false
                )
            }

            return selectedState
        }

        case constants.SELECT_TAG_ALL: {
            const selected = !state.getIn(['_internal', 'selectAll'])
            const _internal = (state.get('_internal', fromJS({})) as Map<
                any,
                any
            >).set('selectAll', selected)

            let selectAllState = state.set('_internal', _internal)
            ;(state.get('items') as List<any>).forEach((tag: Map<any, any>) => {
                selectAllState = selectAllState.setIn(
                    ['meta', tag.get('id'), 'selected'],
                    selected
                )
            })

            return selectAllState
        }

        case constants.EDIT_TAG: {
            const meta = ((state.get('meta', fromJS({})) as Map<any, any>).map(
                (tag: Map<any, any>) => {
                    return tag.set('edit', false)
                }
            ) as Map<any, any>).setIn([action.tag?.id, 'edit'], true)

            return state.set('meta', meta)
        }

        case constants.EDIT_TAG_CANCEL:
            return state.setIn(['meta', action.tag?.id, 'edit'], false)

        case constants.SAVE_TAG:
            return state
                .setIn(
                    [
                        'items',
                        (state.get('items') as List<any>).findIndex(
                            (item: Map<any, any>) => {
                                return item.get('id') === action.tag?.id
                            }
                        ),
                    ],
                    fromJS(action.tag)
                )
                .setIn(['meta', action.tag?.id, 'edit'], false)

        case constants.CREATE_TAG_START:
            return state.setIn(['_internal', 'creating'], true)

        case constants.CREATE_TAG_SUCCESS:
            return state
                .setIn(['_internal', 'creating'], false)
                .update('items', (items: List<any>) =>
                    items.push(fromJS(action.tag))
                )

        case constants.CREATE_TAG_ERROR:
            return state.setIn(['_internal', 'creating'], false)

        case constants.REMOVE_TAG: {
            const itemIndex = (state.get('items', fromJS([])) as List<
                any
            >).findIndex((item: Map<any, any>) => item.get('id') === action.id)
            return state.removeIn(['items', itemIndex])
        }

        case constants.SET_TAG_LIST_PAGE: {
            return state.setIn(['_internal', 'pagination', 'page'], action.page)
        }

        default:
            return state
    }
}
