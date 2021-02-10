import {fromJS, List, Map} from 'immutable'
import moment from 'moment'
import _isArray from 'lodash/isArray'
import _isInteger from 'lodash/isInteger'

import {UNARY_OPERATORS, TIMEDELTA_OPERATOR_DEFAULT_VALUE} from '../../config'
import {UserRole} from '../../config/types/user'
import {ViewType, ViewVisibility} from '../../models/view/types'
import {tryLocalStorage} from '../../services/common/utils'
import {
    getAST,
    getFirstExpressionOfAST,
    toJS,
    hasRole,
    getCode,
} from '../../utils'
import {isTimedelta} from '../../utils/ast'
import {Agents} from '../agents/types'
import {
    CollectionOperator,
    TimedeltaOperator,
    DatetimeOperator,
} from '../rules/types'

import {ViewFilter} from './types'

export const rawify = (data: Maybe<string | number>): string => {
    if (typeof data === 'string') {
        // escape ' and \ chars so that it's a valid string
        return `'${data.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`
    }

    if (typeof data === 'number') {
        return `${data}`
    }

    return "''"
}

/**
 * Resolve the right argument of a filter being added or updated.
 */
function resolveSecondArg(
    callee: string,
    rightValue: Maybe<Record<string, unknown>>
): Maybe<string> {
    const isTimedeltaCallee = Object.values(TimedeltaOperator).includes(
        callee as any
    )
    const isDatetimeCallee = Object.values(DatetimeOperator).includes(
        callee as any
    )
    const isUnaryCallee = Object.keys(UNARY_OPERATORS).includes(callee)
    const isCollectionOperator = Object.values(CollectionOperator).includes(
        callee as any
    )
    const currentRawValue =
        rightValue && rightValue.raw ? (rightValue.raw as string) : null

    if (isTimedeltaCallee && !isTimedelta(currentRawValue, true)) {
        return `\'${TIMEDELTA_OPERATOR_DEFAULT_VALUE}\'`
    } else if (
        !isTimedeltaCallee &&
        isDatetimeCallee &&
        isTimedelta(currentRawValue, true)
    ) {
        return "''"
    } else if (isUnaryCallee) {
        return null
    } else if (isCollectionOperator) {
        if (rightValue && rightValue.type === 'ArrayExpression') {
            return (
                '[' +
                (rightValue.elements as {raw: string}[])
                    .map((elem) => elem.raw)
                    .join(', ') +
                ']'
            )
        }
        return '[]'
    }
    return currentRawValue || "''"
}

function buildRawCallExpression(filter: ViewFilter) {
    if (filter.right === null) {
        return `${filter.operator}(${filter.left})`
    }

    return `${filter.operator}(${filter.left}, ${filter.right as string})`
}

// traverse filters_ast, find all the call expressions and return a new tree
export function addFilterAST(view: Map<any, any>, filter: ViewFilter) {
    // generate a new call expression for the new filter as a string
    filter.right = resolveSecondArg(filter.operator, null) as string
    const newCallExprCode = buildRawCallExpression(filter)
    // since we only ever have AND operators just concatenate existing expressions
    const oldCode = view.get('filters')
        ? `${view.get('filters') as string} && `
        : ''
    const newCode = `${oldCode}${newCallExprCode}`
    return fromJS(getAST(newCode)) as Map<any, any>
}

// traverse filters_ast, remove the call expressions and return a new tree
export function removeFilterAST(
    view: Map<any, any>,
    index: number
): Maybe<Map<any, any>> {
    // As always, we assume that we only have && operators
    const codeSplit = (view.get('filters') as string).split('&&')
    codeSplit.splice(index, 1)
    return fromJS(getAST(codeSplit.join('&&'))) as Maybe<Map<any, any>>
}

// Update a node (CallExpression) in the ast
function setIn(
    ast: Map<any, any>,
    index: number,
    path: Array<string | number>,
    value: unknown
): Map<any, any> {
    let count = 0

    function walker(node: Map<any, any>): Map<any, any> {
        switch (node.get('type')) {
            case 'Program':
                return node.setIn(
                    ['body', 0],
                    walker(node.getIn(['body', 0], fromJS({})))
                )
            case 'ExpressionStatement':
                return node.set('expression', walker(node.get('expression')))
            case 'LogicalExpression':
                return node
                    .set('left', walker(node.get('left')))
                    .set('right', walker(node.get('right')))
            case 'CallExpression':
                count++
                if (count - 1 === index) {
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
function getIn(
    ast: Map<any, any>,
    index: number,
    path: Array<string | number>
): Maybe<Map<any, any>> {
    let count = 0

    function walker(node: Map<any, any>): Map<any, any> | typeof undefined {
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
                if (count - 1 === index) {
                    return node.getIn(path) as Map<any, any>
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
export function updateFilterOperator(
    ast: Map<any, any>,
    index: number,
    operator: string
): Map<any, any> {
    let filter = getIn(ast, index, []) as Map<any, any>
    const rightArgs = filter.getIn(['arguments', 1])
    const rightRaw = resolveSecondArg(operator, toJS(rightArgs))

    filter = filter
        .setIn(['callee', 'name'], operator)
        .update('arguments', (args: List<any>) => args.delete(1))

    if (rightRaw) {
        const secondArg = getFirstExpressionOfAST(getAST(rightRaw))
        filter = filter.update('arguments', (args: List<any>) =>
            args.push(secondArg)
        )
    }

    return updateAstLoc(setIn(ast, index, [], filter))
}

function updateAstLoc(ast: Map<any, any>) {
    return fromJS(getAST(getCode(ast.toJS()))) as Map<any, any>
}

export function updateFilterValue(
    ast: Map<any, any>,
    index: number,
    value: string | number | Array<string | number> | null
): Map<any, any> {
    if (_isArray(value)) {
        const astLiterals = value.map((item) => ({
            type: 'Literal',
            value: item,
            raw: rawify(item),
        }))

        const arrayExpression = {
            type: 'ArrayExpression',
            elements: astLiterals,
        }

        return updateAstLoc(
            setIn(ast, index, ['arguments', 1], arrayExpression)
        )
    }
    const raw = rawify(value)
    return updateAstLoc(
        setIn(
            ast,
            index,
            ['arguments', 1],
            getFirstExpressionOfAST(getAST(raw))
        )
    )
}

/**
 * Sort view by `hide` and `display_order` property.
 * hidden views are at the bottom.
 */
export function sortViews(view1: Map<any, any>, view2: Map<any, any>): number {
    const isView1Hidden = view1.get('hide', false)
    const isView2Hidden = view2.get('hide', false)

    if (isView1Hidden && !isView2Hidden) {
        return 1
    } else if (!isView1Hidden && isView2Hidden) {
        return -1
    }

    return view1.get('display_order', 0) - view2.get('display_order', 0)
}

export function agentsViewingMessage(agents: Agents): string {
    const agentsNames = agents
        .map((agent: Map<any, any>) => agent.get('name') as string)
        .join(', ')
    return `${agentsNames} ${agents.size > 1 ? 'are' : 'is'} viewing`
}

export function agentsTypingMessage(agents: Agents): string {
    const agentsNames = agents
        .map((agent: Map<any, any>) => agent.get('name') as string)
        .join(', ')
    return `${agentsNames} ${agents.size > 1 ? 'are' : 'is'} typing`
}

// Class responsible for getting and storing recent views
export type StoredView = {inserted_datetime: string; updated_datetime: string}
export class RecentViewsStorage {
    storage: Maybe<Storage>
    storageKey: string

    constructor() {
        this.storage = null
        this.storageKey = 'recentViews'

        tryLocalStorage(() => {
            this.storage = window.localStorage
        })
    }

    get(): Maybe<{
        [key: string]: {inserted_datetime: string; updated_datetime: string}
    }> {
        if (!this.storage) {
            return
        }

        let recentViews = null

        try {
            recentViews = JSON.parse(
                this.storage.getItem(this.storageKey) as string
            )
        } catch (error) {
            console.error(error)
            return
        }

        if (!_isArray(recentViews)) {
            return
        }

        const views: {
            [key: string]: {inserted_datetime: string; updated_datetime: string}
        } = {}
        const now = moment.utc().toISOString()

        recentViews.forEach((viewId: number) => {
            if (_isInteger(viewId)) {
                views[viewId] = {
                    inserted_datetime: now,
                    updated_datetime: now,
                }
            }
        })

        return views
    }

    set(views: Array<number>) {
        if (this.storage) {
            tryLocalStorage(() => {
                localStorage.setItem(this.storageKey, JSON.stringify(views))
            })
        }
    }
}

export const recentViewsStorage = new RecentViewsStorage()

function getViewTypeUrl(
    viewType: ViewType
): Maybe<{detail: string; list: string}> {
    const typeMap = {
        'ticket-list': {
            detail: 'ticket',
            list: 'tickets',
        },
        'customer-list': {
            detail: 'customer',
            list: 'customers',
        },
    }

    return typeMap[viewType] || null
}

/**
 * Map view type to individual item route
 */
export function activeViewUrl(
    view: Map<any, any>,
    currentLocation: {
        pathname: string
        search: string
    },
    navigation: Map<any, any>
): string {
    const viewType = view.get('type', '')
    const viewId = view.get('id')
    const viewSearch = view.get('search')
    const typeUrl = getViewTypeUrl(viewType)
    const cursor = navigation.get('current_cursor')
    const query = []
    // default to index route
    let url = '/app'

    if (typeUrl) {
        // check if we're on a view-type item page
        if (currentLocation.pathname.includes(`/${typeUrl.detail}/`)) {
            url += `/${typeUrl.list}`
            if (viewSearch) {
                query.push(`q=${viewSearch as string}`)

                url += '/search'
            } else {
                url += `/${viewId as string}`
            }

            if (cursor) {
                query.push(`cursor=${cursor as string}`)
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

export function addViewIfMissing(
    views: List<any>,
    newView: {id: number}
): List<any> {
    const existing = views.find(
        (view: Map<any, any>) => view.get('id') === newView.id
    )
    return existing ? views : views.push(fromJS(newView))
}

export function isViewSharedWithUser(
    view: {
        visibility: string
        shared_with_users: Array<{id: number}>
        shared_with_teams: Array<{id: number}>
    },
    user: Map<any, any>,
    teams: List<any>
): boolean {
    const isAgent = hasRole(user, UserRole.Agent)
    const userId = user.get('id')
    const userTeams = teams.filter((team: Map<any, any>) =>
        (team.get('members', []) as List<any>).some(
            (member: Map<any, any>) => member.get('id') === userId
        )
    )

    const isViewPublic = view.visibility === ViewVisibility.Public
    const isViewShared = view.visibility === ViewVisibility.Shared
    const isViewPrivate = view.visibility === ViewVisibility.Private

    const isSharedWithUser = view.shared_with_users.some(
        (sharedWithUser) => sharedWithUser.id === userId
    )

    const isSharedWithTeam = view.shared_with_teams.some((sharedWithTeam) =>
        userTeams.some(
            (userTeam: Map<any, any>) =>
                userTeam.get('id') === sharedWithTeam.id
        )
    )

    return (
        isViewPublic ||
        (isViewShared && (isAgent || isSharedWithUser || isSharedWithTeam)) ||
        (isViewPrivate && isSharedWithUser)
    )
}
