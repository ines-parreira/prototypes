// @flow
import esprima from 'esprima'
import {fromJS} from 'immutable'
import moment from 'moment'
import _isArray from 'lodash/isArray'
import _isInteger from 'lodash/isInteger'

import {EMPTY_OPERATORS} from '../../config'

import type {Map} from 'immutable'
import type {filterType, viewsStateType} from './types'
import type {agentsType} from '../agents/types'
import {isCurrentlyOnView} from '../../utils'

type viewType = Map<*,*>
type astType = Map<*,*>
type pathType = Array<string | number>
type nodeType = Map<*,*>

// traverse filters_ast, find all the call expressions and return a new tree
export function addFilterAST(view: viewType, filter: filterType): Map<*,*> {
    // generate a new call expression for the new filter as a string
    const newCallExprCode = `${filter.operator}(${filter.left}, ${filter.right})`
    // since we only ever have AND operators just concatenate existing expressions
    const oldCode = view.get('filters') ? `${view.get('filters')} && ` : ''
    const newCode = `${oldCode}${newCallExprCode}`
    return fromJS(esprima.parse(newCode))
}

// traverse filters_ast, remove the call expressions and return a new tree
export function removeFilterAST(view: viewType, index: number): ?Map<*,*> {
    // As always, we assume that we only have && operators
    const codeSplit = view.get('filters').split('&&')
    codeSplit.splice(index, 1)
    if (codeSplit.length !== 0) {
        return fromJS(esprima.parse(codeSplit.join('&&')))
    }
    return null
}

// Update a node (CallExpression) in the ast
function setIn(ast: astType, index: number, path: pathType, value: any): nodeType {
    let count = 0

    function walker(node: nodeType): nodeType {
        switch (node.get('type')) {
            case 'Program':
                return node.setIn(['body', 0], walker(node.getIn(['body', 0], fromJS({}))))
            case 'ExpressionStatement':
                return node.set('expression', walker(node.get('expression')))
            case 'LogicalExpression':
                return node.set('left', walker(node.get('left'))).set('right', walker(node.get('right')))
            case 'CallExpression':
                count++
                if ((count - 1) === index) {
                    return node.setIn(path, value)
                }

                return node
            default:
                return node
        }
    }

    return walker(ast)
}

// Get a node (CallExpression)
function getIn(ast: astType, index: number, path: pathType): any {
    let count = 0

    function walker(node: Map<*,*>) {
        switch (node.get('type')) {
            case 'Program':
                return walker(node.getIn(['body', 0], fromJS({})))
            case 'ExpressionStatement':
                return walker(node.get('expression'))
            case 'LogicalExpression': {

                let _node = walker(node.get('left'))
                if (_node) {
                    return _node
                }

                _node = walker(node.get('right'))
                if (_node) {
                    return _node
                }
                break
            }
            case 'CallExpression':
                count++
                if ((count - 1) === index) {
                    return node.getIn(path)
                }
                break
            default:
                return node
        }
    }

    return walker(ast)
}


// traverse filters_ast and replace the callee name of the CallExpression found at `index
// once replaced, we return the new AST
export function updateFilterOperator(ast: astType, index: number, operator: string): nodeType {
    let filter = getIn(ast, index, [])
    filter = filter.setIn(['callee', 'name'], operator)

    if (Object.keys(EMPTY_OPERATORS).includes(operator)) {
        // remove the second arguments (value) if the operator is an empty operator
        filter = filter.update('arguments', args => args.delete(1))
    } else if (filter.get('arguments').size !== 2) {
        // add a second argument (value)
        // if there is one arguments and the operator is NOT an empty operator
        filter = filter.update('arguments', args => args.push(fromJS({
            'raw': '\'\'',
            'value': '',
            'type': 'Literal'
        })))
    }
    return setIn(ast, index, [], filter)
}

export function updateFilterValue(ast: astType, index: number, value: any): nodeType {
    return setIn(ast, index, ['arguments', 1, 'value'], value)
}

/**
 * Sort view by `hide` and `display_order` property.
 * hidden views are at the bottom.
 * @param {Map} view1
 * @param {Map} view2
 * @returns {number}
 */
export function sortViews(view1: viewType, view2: viewType): number {
    const isView1Hidden = view1.get('hide', false)
    const isView2Hidden = view2.get('hide', false)

    if (isView1Hidden && !isView2Hidden) {
        return 1
    } else if (!isView1Hidden && isView2Hidden) {
        return -1
    }

    return view1.get('display_order', 0) - view2.get('display_order', 0)
}

export function agentsViewingMessage(agents: agentsType): string {
    const agentsNames = agents.map(agent => agent.get('name')).join(', ')
    return `${agentsNames} ${agents.size > 1 ? 'are' : 'is'} viewing`
}

export function agentsTypingMessage(agents: agentsType): string {
    const agentsNames = agents.map(agent => agent.get('name')).join(', ')
    return `${agentsNames} ${agents.size > 1 ? 'are' : 'is'} typing`
}

// Class responsible for getting and storing recent views
class RecentViewsStorage {
    storage: ?Object
    storageKey: string

    constructor() {
        this.storage = null
        this.storageKey = 'recentViews'

        if (window.localStorage) {
            this.storage = window.localStorage
        }
    }

    get(): ?Object {
        if (!this.storage) {
            return
        }

        let recentViews = null

        try {
            recentViews = JSON.parse(this.storage.getItem(this.storageKey))
        } catch (error) {
            console.log(error)
            return
        }

        if (!_isArray(recentViews)) {
            return
        }

        const views = {}
        const now = moment.utc().toISOString()

        recentViews.forEach(viewId => {
            if (_isInteger(viewId)) {
                views[viewId] = {
                    inserted_datetime: now,
                    updated_datetime: now
                }
            }
        })

        return views
    }

    set(views: Array<number>) {
        if (this.storage) {
            try {
                localStorage.setItem(this.storageKey, JSON.stringify(views))
            } catch (error) {
                console.log(error)
            }
        }
    }
}

export const recentViewsStorage = new RecentViewsStorage()

/**
 * Return true if view should be updated (refetched)
 * @param viewId
 * @param viewsState
 * @returns {boolean}
 */
export const shouldUpdateView = (viewId: string, viewsState: viewsStateType): boolean => {
    return !['search', 'new', '0', 0].includes(viewId) && isCurrentlyOnView(viewId, viewsState)
}
