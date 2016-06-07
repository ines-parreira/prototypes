import * as actions from '../actions/macro'
import {fromJS, Map, List} from 'immutable'
import {DEFAULT_ACTIONS} from '../constants'
import {createFilter} from 'react-search-input'


const actionInitial = Map({
    type: 'user',
    name: '',
    title: '',
    arguments: Map()
})

const initialDefaultActions = Map({
    setStatus: actionInitial.merge({
        name: 'setStatus',
        arguments: Map({status: 'new'})
    }),
    addTags: actionInitial.merge({
        name: 'addTags',
        arguments: List()
    }),
    setResponseText: actionInitial.merge({
        name: 'setResponseText',
        arguments: Map({
            body_text: '',
            body_html: ''
        })
    }),
    assignUser: actionInitial.merge({
        name: 'assignUser',
        arguments: Map({
            assignee_user: null
        })
    }),
    setPriority: actionInitial.merge({
        name: 'setPriority',
        arguments: Map({
            priority: 'normal'
        })
    }),
    http: actionInitial.merge({
        execution: 'back',
        name: 'http',
        arguments: Map({
            method: 'GET',
            url: '',
            headers: List(),
            params: List(),
            contentType: 'application/json'
        })
    }),
    httpIntegration: actionInitial.merge({
        execution: 'back',
        name: 'http_integration',
        arguments: Map({
            integrationId: null
        })
    }),
    notify: actionInitial.merge({
        execution: 'back',
        name: 'notify',
        arguments: Map({
            email: '',
            subject: '{ticket.subject}',
            content: '{ticket.last_message.body_text}'
        })
    })
})

const macroInitial = Map({
    id: 'new',
    name: 'New macro',
    actions: List([
        initialDefaultActions.get('setResponseText')
    ])
})

const macrosInitial = fromJS({
    state: {
        query: ''
    },
    visible: true,
    selected: {},
    isModalOpen: false,
    modalSelected: macroInitial,
    appliedMacro: null,
    items: {},
    actions: initialDefaultActions
})

export function macros(state = macrosInitial, action) {
    let items
    let actionIndex

    switch (action.type) {
        case actions.CLOSE_MODAL:
            return state.set('isModalOpen', false)

        case actions.OPEN_MODAL:
            return state.set('isModalOpen', true)

        case actions.ADD_NEW_MACRO:
            return state.set('modalSelected', macroInitial)

        case actions.CREATE_MACRO_SUCCESS:
        case actions.UPDATE_MACRO_SUCCESS:
            return state.setIn(['items', action.resp.id], fromJS(action.resp))

        case actions.DELETE_MACRO_SUCCESS:
            return state.set('items', state.get('items').delete(action.macroId)).set('modalSelected', state.get('items').first())

        case actions.PREVIEW_MACRO:
            return state.set('selected', state.getIn(['items', action.id]))

        case actions.PREVIEW_MACRO_IN_MODAL:
            return state.set('modalSelected', state.getIn(['items', action.macroId])).set('isModalOpen', true)

        case actions.APPLY_MACRO:
            return state.set('visible', false).set('appliedMacro', action.macro)

        case actions.SET_MACROS_VISIBILITY:
            return state.set('visible', action.visible)

        case actions.PREVIEW_ADJACENT_MACRO: {
            const selectedMacro = state.get('selected')
            items = state.get('items').toIndexedSeq().toJS()
            items = fromJS(items.filter(createFilter(state.getIn(['state', 'query']), ['name'])))

            const curIdx = selectedMacro ? items.findIndex(item => item.get('id') === selectedMacro.get('id')) : 0

            if (action.direction === 'next') {
                return state.set('selected', curIdx + 1 <= items.size - 1 ? items.get(curIdx + 1) : items.get(0))
            } else if (action.direction === 'prev') {
                return state.set('selected', curIdx - 1 >= 0 ? items.get(curIdx - 1) : items.get(items.size - 1))
            }

            return state
        }

        case actions.FETCH_MACRO_LIST_SUCCESS: {
            items = Map()
            for (const macro of action.resp.data) {
                items = items.set(macro.id, fromJS(macro))
            }
            return state.merge({
                visible: !!items.size,
                items
            })
        }

        case actions.UPDATE_ACTION_ARGS:
            return state.setIn(['modalSelected', 'actions', action.actionIndex, 'arguments'], action.value)

        case actions.UPDATE_ACTION_ARGS_ON_APPLIED:
            return state.setIn(['appliedMacro', 'actions', action.actionIndex, 'arguments'], action.value)

        case actions.DELETE_ACTION_ON_APPLIED:
            return state.setIn(
                ['appliedMacro', 'actions'],
                state.getIn(['appliedMacro', 'actions']).delete(action.actionIndex)
            )

        case actions.UPDATE_ACTION_TITLE:
            return state.setIn(['modalSelected', 'actions', action.actionIndex, 'title'], action.title)

        case actions.SET_NAME:
            return state.setIn(['modalSelected', 'name'], action.name)

        case actions.DELETE_ACTION:
            actionIndex = state.getIn(['modalSelected', 'actions']).findIndex(
                curAction => curAction.get('id') === action.actionId
            )

            return state.setIn(
                ['modalSelected', 'actions'],
                state.getIn(['modalSelected', 'actions']).delete(actionIndex)
            )

        case actions.ADD_ACTION:
            if (DEFAULT_ACTIONS.indexOf(action.actionType) === -1) {
                return state
            }

            return state.setIn(
                ['modalSelected', 'actions'],
                state.getIn(['modalSelected', 'actions']).push(state.getIn(['actions', action.actionType]))
            )

        case actions.SAVE_SEARCH: {
            let newState = state.setIn(['state', 'query'], action.query)

            const selectedMacro = newState.get('selected')
            items = newState.get('items').toIndexedSeq().toJS()
            items = fromJS(items.filter(createFilter(newState.getIn(['state', 'query']), ['name'])))

            if (!selectedMacro) {
                newState = newState.set('selected', items.first())
            } else if (items.findIndex(item => item.get('id') === selectedMacro.get('id')) === -1) {
                newState = newState.set('selected', items.first())
            }

            return newState
        }

        default:
            return state
    }
}
