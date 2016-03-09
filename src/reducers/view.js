import * as actions from '../actions/view'
import { getCode, getAST } from './rule'
import Immutable, {Map} from 'immutable'
import { _ } from 'lodash'
import { codeToSimpleRules, simpleRulesToCode } from '../SimpleRules'


function ensureAttributes(view) {
    view.dirty = false
    view.filters = getCode(view.filters_ast)
    view.simpleRules = codeToSimpleRules(view.filters)
    return view
}

function updateFilterLogic(view, simpleRules) {
    view.dirty = !_.isEqual(view.simpleRules, simpleRules)
    view.simpleRules = simpleRules
    view.filters = simpleRulesToCode(simpleRules)
    view.filters_ast = getAST(view.filters)
}

export function views(state = Map(), action) {
    switch (action.type) {
        case actions.NEW_VIEW:
            return state
        case actions.FETCH_VIEW_LIST_START:
            return state
        case actions.FETCH_VIEW_LIST_SUCCESS:
            return Map(_.keyBy(_.map(action.resp.data, ensureAttributes), 'slug'))
        case actions.UPDATE_SIMPLE_RULES:
            // TODO: Really use ImmutableJS for this
            let views = state.toJS()
            let view = views[action.slug]
            const newRules = _.assign({}, view.simpleRules, action.data)
            updateFilterLogic(view, newRules)
            return Map(views)
        case actions.UPDATE_VIEW_START:
            // TODO: Use ImmutableJS throughout
            let newState = state.toJS()
            newState[action.slug] = _.assign({}, newState[action.slug], action.data)
            return Map(newState)
        case actions.UPDATE_VIEW_SUCCESS:
            let viewState = state.toJS()
            viewState[action.slug].dirty = false
            return Map(viewState)
        default:
            return state
    }
}
