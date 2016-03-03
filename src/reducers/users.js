import * as actions from '../actions/user'
import {Map} from 'immutable'
import {_} from 'lodash'

const usersInitial = Map({
    items: [],
    form: {
        role: 'user',
        name: '',
        email: ''
    },
    loading: true,
    resp: {}
})

export function users(state = usersInitial, action) {
    switch (action.type) {

        case actions.FETCH_USER_LIST_START:
            return Map({
                items: action.extend ? state.get('items') : [],
                form: state.get('form'),
                loading: action.extend ? true : false,
                resp: action.resp
            })

        case actions.FETCH_USER_LIST_SUCCESS:
            return Map({
                items: action.resp.data,
                form: state.get('form'),
                loading: false,
                resp: action.resp
            })

        case actions.CREATE_NEW_USER_SUCCESS:
            const oldItems = state.get('items')
            const newItem = action.resp

            return Map({
                items: _.concat(newItem, oldItems),
                form: state.get('form'),
                loading: false,
                resp: action.resp
            })

        case actions.UPDATE_USER_SUCCESS:
            return state

        case actions.DELETE_USER_SUCCESS:
            const items = state.get('items')

            return Map({
                items: items.filter(function(item) {
                    return item.id !== action.userId
                }),
                form: state.get('form'),
                loading: state.loading,
                resp: action.resp
            })

        case actions.UPDATE_FORM:
            console.log(state.get('form'))
            console.log(Object.assign({}, state.get('form'), action.data))
            return Map({
                items: state.get('items'),
                form: Object.assign({}, state.get('form'), action.data),
                loading: state.get('loading'),
                resp: state.resp
            })

        default:
            return state
    }
}
