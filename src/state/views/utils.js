// @flow
import esprima from 'esprima'
import {fromJS, Map} from 'immutable'
import moment from 'moment'
import _isArray from 'lodash/isArray'
import _isInteger from 'lodash/isInteger'

import {EMPTY_OPERATORS, TIMEDELTA_OPERATOR_DEFAULT_VALUE} from '../../config'

import type {filterType, viewsStateType} from './types'
import type {agentsType} from '../agents/types'
import {getAST, getFirstExpressionOfAST, isCurrentlyOnView} from '../../utils'
import {datetimeOperators, timedeltaOperators} from '../../config/rules'
import {isTimedelta} from '../../utils/ast'

type viewType = Map<*,*>
type astType = Map<*,*>
type pathType = Array<string | number>
type nodeType = Map<*,*>

type currentLocationType = {
    pathname: string,
    search: string
}


function rawify(data: string | number | null) : string {
    if (typeof data === 'string') {
        return `'${data}'`
    }

    if (typeof data === 'number') {
        return `${data}`
    }

    return '\'\''
}


/**
 * Resolve the right argument of a filter being added or updated.
 * @param callee: the operator of the filter
 * @param currentRawValue: the current raw value of the filter, if any
 * @returns {*}: the `right` value to set in the filter. If null, it means the filter should not have a `right` value
 */
function resolveSecondArg(callee: string, currentRawValue: string) : string | null {
    const isTimedeltaCallee = timedeltaOperators.includes(callee)
    const isDatetimeCallee = datetimeOperators.includes(callee)
    const isEmptyCallee = Object.keys(EMPTY_OPERATORS).includes(callee)

    if (isTimedeltaCallee && !isTimedelta(currentRawValue, true)) {
        return `\'${TIMEDELTA_OPERATOR_DEFAULT_VALUE}\'`
    } else if (!isTimedeltaCallee && isDatetimeCallee && isTimedelta(currentRawValue, true)) {
        return '\'\''
    } else if (isEmptyCallee) {
        return null
    }

    return currentRawValue || '\'\''
}

function buildRawCallExpression(filter: filterType) {
    if (filter.right === null) {
        return `${filter.operator}(${filter.left})`
    }

    return `${filter.operator}(${filter.left}, ${filter.right})`
}

// traverse filters_ast, find all the call expressions and return a new tree
export function addFilterAST(view: viewType, filter: filterType): Map<*,*> {
    // generate a new call expression for the new filter as a string
    filter.right = resolveSecondArg(filter.operator, filter.right)
    const newCallExprCode = buildRawCallExpression(filter)
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
    return fromJS(esprima.parse(codeSplit.join('&&')))
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

    function walker(node: Map<*,*>) : Map<*,*> | typeof undefined {
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
    const rightRaw = resolveSecondArg(operator, filter.getIn(['arguments', 1, 'raw']))

    filter = filter
        .setIn(['callee', 'name'], operator)
        .update('arguments', (args) => args.delete(1))

    if (rightRaw) {
        const secondArg = getFirstExpressionOfAST(getAST(rightRaw))
        filter = filter.update('arguments', (args) => args.push(secondArg))
    }

    return setIn(ast, index, [], filter)
}

export function updateFilterValue(ast: astType, index: number, value: string | number | null): nodeType {
    let raw = rawify(value)
    return setIn(ast, index, ['arguments', 1], getFirstExpressionOfAST(getAST(raw)))
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
    const agentsNames = agents.map((agent) => agent.get('name')).join(', ')
    return `${agentsNames} ${agents.size > 1 ? 'are' : 'is'} viewing`
}

export function agentsTypingMessage(agents: agentsType): string {
    const agentsNames = agents.map((agent) => agent.get('name')).join(', ')
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

        recentViews.forEach((viewId) => {
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

function getViewTypeUrl(viewType: string): ?{detail: string, list: string} {
    const typeMap = {
        'ticket-list': {
            detail: 'ticket',
            list: 'tickets',
        },
        'customer-list': {
            detail: 'customer',
            list: 'customers',
        }
    }

    return typeMap[viewType] || null
}

/**
 * Map view type to individual item route
 * @param view
 * @param currentLocation
 * @param pagination
 * @returns {string}
 */
export function activeViewUrl(view: viewType, currentLocation: currentLocationType, pagination: Map<*,*>): string {
    const viewType = view.get('type', '')
    const viewId = view.get('id')
    const viewSearch = view.get('search')
    const typeUrl = getViewTypeUrl(viewType)
    const page = pagination.get('page', 1)
    const query = []
    // default to index route
    let url = '/app'

    if (typeUrl) {
        // check if we're on a view-type item page
        if (currentLocation.pathname.includes(`/${typeUrl.detail}/`)) {
            url += `/${typeUrl.list}`
            if (viewSearch) {
                query.push(`q=${viewSearch}`)

                url += '/search'
            } else {
                url += `/${viewId}`
            }

            if (page > 1) {
                query.push(`page=${page}`)
            }

            if (query.length) {
                url += `?${query.join('&')}`
            }
        } else {
            // we're on an unsupported view-type item,
            // or on a different page type (eg. list).
            // stay where you are
            url = `${currentLocation.pathname}${currentLocation.search}`
        }
    }

    return url
}
