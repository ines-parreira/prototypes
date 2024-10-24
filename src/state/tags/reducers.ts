import {Tag} from '@gorgias/api-queries'
import {fromJS, Map, List} from 'immutable'

import {PaginationMeta} from 'models/api/types'
import {GorgiasAction} from 'state/types'

import * as constants from './constants'
import {TagsState} from './types'

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
            const {tags, value} = action.payload as {
                tags: Tag[]
                value?: boolean
            }
            const newValue = value ?? !state.getIn(['_internal', 'selectAll'])

            let newState = state.setIn(['_internal', 'selectAll'], newValue)

            if (newValue === false) {
                return newState.delete('meta')
            }
            tags.forEach((tag) => {
                newState = newState.setIn(
                    ['meta', tag.id, 'selected'],
                    newValue
                )
            })

            return newState
        }

        case constants.EDIT_TAG: {
            const meta = (
                (state.get('meta', fromJS({})) as Map<any, any>).map(
                    (tag: Map<any, any>) => {
                        return tag.set('edit', false)
                    }
                ) as Map<any, any>
            ).setIn([action.tag?.id, 'edit'], true)

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
            const itemIndex = (
                state.get('items', fromJS([])) as List<any>
            ).findIndex((item: Map<any, any>) => item.get('id') === action.id)
            return state.removeIn(['items', itemIndex])
        }

        case constants.RESET_META:
            return state.set('meta', fromJS({}))

        default:
            return state
    }
}
