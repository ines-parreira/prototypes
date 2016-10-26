import * as viewsTypes from '../views/constants'
import {fromJS} from 'immutable'

export const initialState = fromJS({
    items: [],
})

export default (state = initialState, action) => {
    switch (action.type) {
        case viewsTypes.FETCH_LIST_VIEW_SUCCESS: {
            if (action.viewType !== 'ticket-list') {
                return state
            }

            const payload = action.data

            return state.set('items', fromJS(payload.data))
        }

        case viewsTypes.BULK_DELETE_SUCCESS: {
            if (action.viewType !== 'ticket-list') {
                return state
            }

            const newItems = state
                .get('items', fromJS([]))
                .filter(item => !action.ids.includes(item.get('id')))

            return state.set('items', newItems)
        }

        default:
            return state
    }
}
