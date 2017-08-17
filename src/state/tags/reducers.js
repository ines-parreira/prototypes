import * as types from './constants'
import {fromJS} from 'immutable'

export const initialState = fromJS({
    _internal: {},
    meta: {},
    items: []
})

export default (state = initialState, action) => {
    switch (action.type) {
        case types.FETCH_TAG_LIST_SUCCESS:
            return state
                .set('items', fromJS(action.resp.data))
                .set('meta', fromJS({}))  // reset selection and editing state for all tags
                .setIn(['_internal', 'pagination'], fromJS(action.resp.meta))

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

            let selectAllState = state.set('_internal', _internal)

            state.get('items').forEach((tag) => {
                selectAllState = selectAllState.setIn(['meta', tag.get('id'), 'selected'], selected)
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
        case types.CREATE_TAG_ERROR:
            return state.setIn(['_internal', 'creating'], false)

        case types.REMOVE_TAG: {
            const itemIndex = state.get('items', fromJS([])).findIndex(item => item.get('id') === action.id)
            return state.removeIn(['items', itemIndex])
        }

        case types.SET_TAG_LIST_PAGE: {
            return state.setIn(['_internal', 'pagination', 'page'], action.page)
        }

        default:
            return state
    }
}
