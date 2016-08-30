import {createFilter} from 'react-search-input'
import * as types from './constants'
import {fromJS, Map, List} from 'immutable'
import {DEFAULT_ACTIONS, ACTION_TEMPLATES} from '../../config'


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
        query: '',
        modalQuery: ''
    },
    visible: true,
    selected: {},
    isModalOpen: false,
    modalSelected: null,
    appliedMacro: null,
    items: {},
    actions: initialDefaultActions
})

export function getMacrosWithoutExternalActions(currentMacros) {
    return currentMacros.filter(
        macro => macro.get('actions').filter(
            action => fromJS(ACTION_TEMPLATES).getIn([action.get('name'), 'execution']) === 'back'
        ).isEmpty()
    )
}

export function macros(state = macrosInitial, action) {
    let items
    let newState = state

    switch (action.type) {
        case types.CLOSE_MODAL:
            return state.set('isModalOpen', false)

        case types.OPEN_MODAL:
            return state.set('isModalOpen', true)

        case types.ADD_NEW_MACRO:
            return state.set('modalSelected', macroInitial)

        case types.CREATE_MACRO_SUCCESS:
        case types.UPDATE_MACRO_SUCCESS:
            return state.setIn(['items', action.resp.id], fromJS(action.resp))

        case types.DELETE_MACRO_SUCCESS:
            newState = state.set('items', newState.get('items').delete(action.macroId))
            return newState.set('modalSelected', newState.get('items').first())

        case types.PREVIEW_MACRO:
            return state.set('selected', state.getIn(['items', action.id]))

        case types.PREVIEW_MACRO_IN_MODAL:
            return state.set('modalSelected', state.getIn(['items', action.macroId])).set('isModalOpen', true)

        case types.APPLY_MACRO:
            return state.set('visible', false).set('appliedMacro', action.macro)

        case types.SET_MACROS_VISIBILITY:
            return state.set('visible', action.visible)

        case types.PREVIEW_ADJACENT_MACRO: {
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

        case types.PREVIEW_ADJACENT_MACRO_IN_MODAL: {
            const selectedMacro = state.get('modalSelected')

            items = state.get('items')

            if (action.noExternal) {
                items = getMacrosWithoutExternalActions(items)
            }

            items = items.toIndexedSeq().toJS()

            items = fromJS(items.filter(createFilter(state.getIn(['state', 'modalQuery']), ['name'])))

            const curIdx = selectedMacro ? items.findIndex(item => item.get('id') === selectedMacro.get('id')) : 0

            if (action.direction === 'next') {
                return state.set('modalSelected', curIdx + 1 <= items.size - 1 ? items.get(curIdx + 1) : items.get(0))
            } else if (action.direction === 'prev') {
                return state.set('modalSelected', curIdx - 1 >= 0 ? items.get(curIdx - 1) : items.get(items.size - 1))
            }

            return state
        }

        case types.FETCH_MACRO_LIST_SUCCESS: {
            items = Map()
            for (const macro of action.resp.data) {
                items = items.set(macro.id, fromJS(macro))
            }

            return state.merge({
                visible: !!items.size,
                items
            })
        }

        case types.UPDATE_ACTION_ARGS:
            return state.setIn(['modalSelected', 'actions', action.actionIndex, 'arguments'], action.value)

        case types.UPDATE_ACTION_ARGS_ON_APPLIED:
            return state.setIn(['appliedMacro', 'actions', action.actionIndex, 'arguments'], action.value)

        case types.DELETE_ACTION_ON_APPLIED:
            return state.setIn(
                ['appliedMacro', 'actions'],
                state.getIn(['appliedMacro', 'actions']).delete(action.actionIndex)
            )

        case types.UPDATE_ACTION_TITLE:
            return state.setIn(['modalSelected', 'actions', action.actionIndex, 'title'], action.title)

        case types.SET_NAME:
            return state.setIn(['modalSelected', 'name'], action.name)

        case types.DELETE_ACTION:
            return state.setIn(
                ['modalSelected', 'actions'],
                state.getIn(['modalSelected', 'actions']).delete(action.actionIndex)
            )

        case types.ADD_ACTION:
            if (!~DEFAULT_ACTIONS.indexOf(action.actionType)) {
                return state
            }

            return state.setIn(
                ['modalSelected', 'actions'],
                state.getIn(['modalSelected', 'actions']).push(state.getIn(['actions', action.actionType]))
            )

        case types.SAVE_SEARCH: {
            const queryField = state.get('isModalOpen') ? 'modalQuery' : 'query'
            const selectedField = state.get('isModalOpen') ? 'modalSelected' : 'selected'

            newState = state.setIn(['state', queryField], action.query)

            const selectedMacro = newState.get(selectedField)
            items = newState.get('items').toIndexedSeq().toJS()
            items = fromJS(items.filter(createFilter(newState.getIn(['state', queryField]), ['name'])))

            if (!selectedMacro) {
                newState = newState.set(selectedField, items.first())
            } else if (!~items.findIndex(item => item.get('id') === selectedMacro.get('id'))) {
                newState = newState.set(selectedField, items.first())
            }

            return newState
        }

        default:
            return state
    }
}
