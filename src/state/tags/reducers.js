import * as types from './constants'
import {List, fromJS} from 'immutable'

export const initialState = fromJS({
    _internal: {},
    meta: {},
    items: []
})

export default (state = initialState, action) => {
    switch (action.type) {
        case types.FETCH_TAG_LIST_SUCCESS:
            return state.set('items', List().merge(action.resp.data))

        case types.ADD_TAGS:
            return state.set('items', state.get('items').concat(action.tags))

        case types.SELECT_TAG: {
            const selected = !state.getIn(['meta', action.tag.id, 'selected'])
            let selectedState = state.setIn(['meta', action.tag.id, 'selected'], selected)

            if (!selected) {
                selectedState = selectedState.setIn(['_internal', 'selectAll'], false)
            }

            return selectedState
        }

        case types.SELECT_TAG_ALL: {
            const selected = !state.getIn(['_internal', 'selectAll'])
            const _internal = state.get('_internal', fromJS({})).set('selectAll', selected)
            const ids = state.get('items').map((tag) => {
                return tag.get('id')
            })

            let selectAllState = state.set('_internal', _internal)

            ids.forEach((id) => {
                selectAllState = selectAllState.setIn(['meta', id, 'selected'], selected)
            })

            return selectAllState
        }

        case types.EDIT_TAG: {
            const meta = state.get('meta', fromJS({})).map((tag) => {
                return tag.set('edit', false)
            }).setIn([action.tag.id, 'edit'], true)

            return state.set('meta', meta)
        }

        case types.EDIT_TAG_CANCEL:
            return state.setIn(['meta', action.tag.id, 'edit'], false)

        case types.SAVE_TAG:
            return state
            .setIn(['items', state.get('items').findIndex(item => {
                return item.get('id') === action.tag.id
            })], fromJS(action.tag))
            .setIn(['meta', action.tag.id, 'edit'], false)

        case types.CREATE_TAG_START:
            return state.setIn(['_internal', 'creating'], true)

        case types.CREATE_TAG_SUCCESS:
            return state
            .set('items', state.get('items').push(fromJS(action.tag)))
            .setIn(['_internal', 'creating'], false)

        case types.REMOVE_TAG:
            return state
            .set('items', state.get('items').splice(state.get('items').findIndex(item => {
                return item.get('id') === action.id
            }), 1))

        default:
            return state
    }
}
