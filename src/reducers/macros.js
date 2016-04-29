import * as actions from '../actions/macro'
import * as ticketActions from '../actions/ticket'
import Immutable, { Map, List } from 'immutable'

import { DEFAULT_ACTIONS } from '../constants'


const actionInitial = Map({
    type: 'user',
    name: '',
    title: '',
    arguments: Map()
})

const initialDefaultActions = {
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
    })
}
const macroInitial = Map({
    id: 'new',
    name: 'New macro',
    actions: List([
        initialDefaultActions.setResponseText
    ])
})

const macrosInitial = Map({
    visible: true,
    selected: Map(),
    isModalOpen: false,
    modalSelected: macroInitial,
    items: Map(),
})

export function macros(state = macrosInitial, action) {
    let items
    let newState = state
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
            return state.setIn(['items', action.resp.id], Immutable.fromJS(action.resp))

        case actions.DELETE_MACRO_SUCCESS:
            return state.set('items', state.get('items').delete(action.macroId)).set('modalSelected', state.get('items').first())

        case actions.PREVIEW_MACRO:
            return state.set('selected', state.getIn(['items', action.id]))

        case actions.PREVIEW_MACRO_IN_MODAL:
            return state.set('modalSelected', state.getIn(['items', action.macroId])).set('isModalOpen', true)

        case actions.APPLY_MACRO:
            return state.set('visible', false)

        case actions.SET_MACROS_VISIBILITY:
            return state.set('visible', action.visible)

        case actions.PREVIEW_ADJACENT_MACRO:
            let prev = null
            const selectedMacro = state.get('selected')
            items = state.get('items')

            for (const current of items.toIndexedSeq()) {
                const toSelect = action.direction === 'prev' ? prev : current
                const toCompare = action.direction === 'prev' ? current : prev
                if (selectedMacro === toCompare) {
                    return prev ? state.set('selected', toSelect) : state
                }
                prev = current
            }
            return state

        case actions.FETCH_MACRO_LIST_SUCCESS:
            items = Immutable.Map()
            for (const macro of action.resp.data) {
                items = items.set(macro.id, Immutable.fromJS(macro))
            }
            return state.merge({
                visible: !!items.size,
                items
            })

        case actions.ADD_TAG:
            actionIndex = state.getIn(['modalSelected', 'actions']).findIndex(
                curAction => curAction.get('name') === ticketActions.ADD_TICKET_TAGS
            )

            action.tags.map(tag => {
                newState = newState.setIn(
                    ['modalSelected', 'actions', actionIndex, 'arguments'],
                    newState.getIn(['modalSelected', 'actions', actionIndex, 'arguments']).push(tag)
                )
            })

            return newState

        case actions.DELETE_TAG:
            actionIndex = state.getIn(['modalSelected', 'actions']).findIndex(
                curAction => curAction.get('name') === ticketActions.ADD_TICKET_TAGS
            )

            return state.setIn(
                ['modalSelected', 'actions', actionIndex, 'arguments'],
                state.getIn(['modalSelected', 'actions', actionIndex, 'arguments']).delete(action.index)
            )

        case actions.SET_STATUS:
            actionIndex = state.getIn(['modalSelected', 'actions']).findIndex(
                curAction => curAction.get('name') === ticketActions.SET_STATUS
            )

            return state.setIn(['modalSelected', 'actions', actionIndex, 'arguments', 'status'], action.status)

        case actions.SET_NAME:
            return state.setIn(['modalSelected', 'name'], action.name)

        case actions.SET_RESPONSE_TEXT:
            actionIndex = state.getIn(['modalSelected', 'actions']).findIndex(
                curAction => curAction.get('name') === ticketActions.SET_RESPONSE_TEXT
            )

            return state.setIn(
                ['modalSelected', 'actions', actionIndex, 'arguments', 'body_html'],
                action.responseText
            )

        case actions.SET_ASSIGNEE:
            actionIndex = state.getIn(['modalSelected', 'actions']).findIndex(
                curAction => curAction.get('name') === ticketActions.SET_ASSIGNEE
            )

            return state.setIn(
                ['modalSelected', 'actions', actionIndex, 'arguments', 'assignee_user'],
                Map(action.assignee)
            )

        case actions.TOGGLE_PRIORITY:
            actionIndex = state.getIn(['modalSelected', 'actions']).findIndex(
                curAction => curAction.get('name') === ticketActions.TOGGLE_PRIORITY
            )

            const path = ['modalSelected', 'actions', actionIndex, 'arguments', 'priority']

            return state.setIn(path, state.getIn(path) === 'normal' ? 'high' : 'normal')

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
                state.getIn(['modalSelected', 'actions']).push(initialDefaultActions[action.actionType])
            )

        default:
            return state
    }
}
