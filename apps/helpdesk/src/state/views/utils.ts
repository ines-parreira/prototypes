import { tryLocalStorage } from '@repo/browser-storage'
import { isTimedelta } from '@repo/utils'
import { Syntax } from 'esprima'
import type { BaseCallExpression, BaseNode } from 'estree'
import type { List, Map, Seq } from 'immutable'
import { fromJS } from 'immutable'
import _isArray from 'lodash/isArray'
import _isInteger from 'lodash/isInteger'
import _isNumber from 'lodash/isNumber'
import _isObject from 'lodash/isObject'
import _isString from 'lodash/isString'
import moment from 'moment'

import type { User } from '@gorgias/helpdesk-queries'

import { fromAST } from 'common/utils'
import { QaScoreDimensions } from 'pages/common/components/ViewTable/Filters/utils/qaScoreDimensions'

import { TIMEDELTA_OPERATOR_DEFAULT_VALUE, UNARY_OPERATORS } from '../../config'
import { UserRole } from '../../config/types/user'
import { ViewType, ViewVisibility } from '../../models/view/types'
import {
    getAST,
    getCode,
    getFirstExpressionOfAST,
    hasRole,
    toJS,
} from '../../utils'
import type { Agents } from '../agents/types'
import {
    CollectionOperator,
    DatetimeOperator,
    TimedeltaOperator,
} from '../rules/types'
import type { ViewFilter } from './types'

export const rawify = (data: Maybe<string | number | boolean>): string => {
    if (typeof data === 'string') {
        // escape ' and \ chars so that it's a valid string
        return `'${data.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`
    }

    if (typeof data === 'number' || typeof data === 'boolean') {
        return `${data}`
    }

    return "''"
}

/**
 * Resolve the right argument of a filter being added or updated.
 */
function resolveSecondArg(
    callee: string,
    rightValue: Maybe<Record<string, unknown>>,
): Maybe<string> {
    const isTimedeltaCallee = Object.values(TimedeltaOperator).includes(
        callee as any,
    )
    const isDatetimeCallee = Object.values(DatetimeOperator).includes(
        callee as any,
    )
    const isUnaryCallee = Object.keys(UNARY_OPERATORS).includes(callee)
    const isCollectionOperator = Object.values(CollectionOperator).includes(
        callee as any,
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
                (rightValue.elements as { raw: string }[])
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
    return fromAST(getAST(newCode)) as Map<any, any>
}

// traverse filters_ast, remove the call expressions and return a new tree
export function removeFilterAST(
    view: Map<any, any>,
    index: number,
): Maybe<Map<any, any>> {
    // As always, we assume that we only have && operators
    const codeSplit = (view.get('filters') as string).split('&&')
    codeSplit.splice(index, 1)
    return fromAST(getAST(codeSplit.join('&&'))) as Maybe<Map<any, any>>
}

// Update a node (CallExpression) in the ast
function setIn(
    ast: Map<any, any>,
    index: number,
    path: Array<string | number>,
    value: unknown,
): Map<any, any> {
    let count = 0

    function walker(node: Map<any, any>): Map<any, any> {
        switch (node.get('type')) {
            case 'Program':
                return node.setIn(
                    ['body', 0],
                    walker(node.getIn(['body', 0], fromJS({}))),
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
export function getIn(
    ast: Map<any, any>,
    index: number,
    path: Array<string | number>,
): Maybe<Map<any, any>> | string {
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
    operator: string,
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
            args.push(secondArg),
        )
    }

    return updateAstLoc(setIn(ast, index, [], filter))
}

function updateAstLoc(ast: Map<any, any>) {
    return fromAST(getAST(getCode(ast.toJS()))) as Map<any, any>
}

export function updateFilterValue(
    ast: Map<any, any>,
    index: number,
    value: string | number | Array<string | number> | null,
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
            setIn(ast, index, ['arguments', 1], arrayExpression),
        )
    }
    const raw = rawify(value)
    return updateAstLoc(
        setIn(
            ast,
            index,
            ['arguments', 1],
            getFirstExpressionOfAST(getAST(raw)),
        ),
    )
}

/**
 * Update the custom field used, and set a new null value.
 * It's used when adding a new TF filter to the expression,
 * or when changing the custom field used in an existing filter.
 *
 * After the initial filter add - the custom field MemberExpression
 * is further segmented in the AST after being parsed through `updateAstLoc`,
 * namely, custom_fields[customFieldId].value rather than being one Identifier,
 * becomes a Member expression, where all of its parts are separate nodes.
 * It will update the custom field ID, reset to a fresh value,
 * and update the operator of the expression itself.
 */
export function updateCustomFieldFilter(
    ast: Map<any, any>,
    index: number,
    customFieldId: number,
    customFieldOperator: string,
) {
    const isInitialAstWithoutLiteral =
        getIn(ast, index, ['arguments', 0, 'property', 'name']) !== 'value'
    const path = isInitialAstWithoutLiteral
        ? ['arguments', 0, 'property', 'name']
        : ['arguments', 0, 'object', 'property', 'value']
    const value = isInitialAstWithoutLiteral
        ? `custom_fields[${customFieldId}].value`
        : customFieldId

    let newAst = setIn(ast, index, path, value)

    const rightRaw = resolveSecondArg(customFieldOperator, null)
    const clearArg = getFirstExpressionOfAST(getAST(rightRaw || "''"))
    newAst = setIn(newAst, index, ['arguments', 1], clearArg)
    newAst = updateFilterOperator(newAst, index, customFieldOperator)

    return updateAstLoc(newAst)
}

export function updateQAScoreFilter(
    ast: Map<any, any>,
    index: number,
    qaScoreDimension: string,
) {
    const operator = getIn(ast, index, ['callee', 'name'])
    const previousDimension = getIn(ast, index, [
        'arguments',
        0,
        'object',
        'property',
        'value',
    ])

    const isInitialAstWithoutLiteral =
        getIn(ast, index, ['arguments', 0, 'property', 'name']) !== 'prediction'

    const path = isInitialAstWithoutLiteral
        ? ['arguments', 0, 'property', 'name']
        : ['arguments', 0, 'object', 'property', 'value']

    const value = isInitialAstWithoutLiteral
        ? `qa_score_dimensions["${qaScoreDimension}"].prediction`
        : qaScoreDimension

    let newAst = setIn(ast, index, path, value)

    if (
        typeof operator === 'string' &&
        operator &&
        [previousDimension, qaScoreDimension].includes(
            QaScoreDimensions.RESOLUTION_COMPLETENESS,
        )
    ) {
        const rightRaw = resolveSecondArg(operator, null)
        const clearArg = getFirstExpressionOfAST(getAST(rightRaw || "''"))
        newAst = setIn(newAst, index, ['arguments', 1], clearArg)
        newAst = updateFilterOperator(newAst, index, operator)
    }

    return updateAstLoc(newAst)
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

export function agentsViewingMessage(agents: User[]): string {
    const agentsNames = agents.map((agent) => agent.name).join(', ')
    return `${agentsNames} ${agents.length > 1 ? 'are' : 'is'} viewing`
}

export function agentsTypingMessage(agents: Agents): string {
    const agentsNames = agents
        .map((agent: Map<any, any>) => agent.get('name') as string)
        .join(', ')
    return `${agentsNames} ${agents.size > 1 ? 'are' : 'is'} typing`
}

// Class responsible for getting and storing recent views
export type StoredView = { inserted_datetime: string; updated_datetime: string }
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
        [key: string]: { inserted_datetime: string; updated_datetime: string }
    }> {
        if (!this.storage) {
            return
        }

        let recentViews = null

        try {
            recentViews = JSON.parse(
                this.storage.getItem(this.storageKey) as string,
            )
        } catch (error) {
            console.error(error)
            return
        }

        if (!_isArray(recentViews)) {
            return
        }

        const views: {
            [key: string]: {
                inserted_datetime: string
                updated_datetime: string
            }
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
    viewType: ViewType,
): Maybe<{ detail: string; list: string }> {
    const typeMap = {
        [ViewType.TicketList]: {
            detail: 'ticket',
            list: 'tickets',
        },
        [ViewType.CustomerList]: {
            detail: 'customer',
            list: 'customers',
        },
        [ViewType.All]: null,
        [ViewType.CallList]: null,
    }

    return typeMap[viewType]
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
    navigation: Map<any, any>,
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
    newView: { id: number },
): List<any> {
    const existing = views.find(
        (view: Map<any, any>) => view.get('id') === newView.id,
    )
    return existing ? views : views.push(fromJS(newView))
}

export function isViewSharedWithUser(
    view: {
        visibility: string
        shared_with_users: Array<{ id: number }>
        shared_with_teams: Array<{ id: number }>
    },
    user: Map<any, any>,
    teams: List<Map<any, any>> | Seq.Indexed<Map<any, any>>,
): boolean {
    const isAgent = hasRole(user, UserRole.Agent)
    const userId = user.get('id')
    const userTeams = teams.filter((team) =>
        (team!.get('members', []) as List<any>).some(
            (member: Map<any, any>) => member.get('id') === userId,
        ),
    )

    const isViewPublic = view.visibility === ViewVisibility.Public
    const isViewShared = view.visibility === ViewVisibility.Shared
    const isViewPrivate = view.visibility === ViewVisibility.Private

    const isSharedWithUser = view.shared_with_users.some(
        (sharedWithUser) => sharedWithUser.id === userId,
    )

    const isSharedWithTeam = view.shared_with_teams.some((sharedWithTeam) =>
        userTeams.some((userTeam) => userTeam!.get('id') === sharedWithTeam.id),
    )

    return (
        isViewPublic ||
        (isViewShared && (isAgent || isSharedWithUser || isSharedWithTeam)) ||
        (isViewPrivate && isSharedWithUser)
    )
}

export function getViewFilters(node: BaseNode = {} as BaseNode) {
    const findCallExpressions = (nodeObj: BaseNode): BaseCallExpression[] =>
        Object.entries(nodeObj).reduce(
            (acc, [key, value]) =>
                key === 'arguments'
                    ? acc.concat(nodeObj as BaseCallExpression)
                    : _isObject(value)
                      ? acc.concat(findCallExpressions(value as BaseNode))
                      : acc,
            [] as BaseCallExpression[],
        )

    const callExpressions = findCallExpressions(node)

    const args = callExpressions.reduce((acc, expression) => {
        const [firstExpression, secondExpression] = expression.arguments

        if (!firstExpression || !secondExpression) return acc

        if (
            firstExpression.type === Syntax.MemberExpression &&
            (secondExpression.type === Syntax.Literal ||
                secondExpression.type === Syntax.ArrayExpression)
        ) {
            // first check is for composite fields - e.g. ticket.integration.id
            const objectName =
                firstExpression.object.type === Syntax.MemberExpression &&
                firstExpression.object.object.type === Syntax.Identifier &&
                firstExpression.object.property.type === Syntax.Identifier
                    ? `${firstExpression.object.object.name}.${firstExpression.object.property.name}`
                    : firstExpression.object.type === Syntax.Identifier
                      ? `${firstExpression.object.name}`
                      : ''

            const fieldName = `${objectName}.${
                firstExpression.property.type === Syntax.Identifier
                    ? firstExpression.property.name
                    : ''
            }`

            const fieldValue =
                (secondExpression.type === Syntax.Literal &&
                    secondExpression.value) ||
                (secondExpression.type === Syntax.ArrayExpression &&
                    secondExpression.elements.map(
                        (element) => 'value' in element && element.value,
                    ))

            return acc.concat({
                left: fieldName,
                right:
                    _isString(fieldValue) || _isNumber(fieldValue)
                        ? fieldValue
                        : JSON.stringify(fieldValue),
                operator:
                    'name' in expression.callee ? expression.callee.name : '',
            })
        }

        return acc
    }, [] as ViewFilter[])

    return args
}
