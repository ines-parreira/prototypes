import * as types from './constants'
import { fromJS } from 'immutable'
import _ from 'lodash'

export const initialState = fromJS({
    items: [],
    meta: {}
})

export default (state = initialState, action) => {
    switch (action.type) {
        case types.FETCH_WIDGETS_SUCCESS:
            for (const widget of action.resp.data) {
                widget.fields = _.sortBy(widget.fields, v => v.order)
            }

            return fromJS({
                items: action.resp.data,
                meta: action.resp.meta
            })
        default:
            return state
    }
}
