import {fromJS, Map, List} from 'immutable'
import drop from 'lodash/drop'
import _isUndefined from 'lodash/isUndefined'
import _isArray from 'lodash/isArray'
import _isString from 'lodash/isString'
import _isInteger from 'lodash/isInteger'
import moment from 'moment-timezone'

import {getAST, getFirstExpressionOfAST} from '../../utils'
import {Schemas} from '../../types'
import {UNARY_OPERATORS, TIMEDELTA_OPERATOR_DEFAULT_VALUE} from '../../config'
import {isTimedelta} from '../../utils/ast'

import {OBJECT_DEFINITIONS} from './constants.js'
import {
    CollectionOperator,
    DatetimeOperator,
    DeprecatedOperator,
    ObjectExpression,
    ObjectExpressionProperty,
    RuleDraft,
    TimedeltaOperator,
} from './types'

/**
 * Generate a path until the stop path was reached.
 *
 *  Example:
 *
 *  If original expression is:
 *
 *      `ticket.source.from.address`
 *
 *  and we change the property:
 *
 *      `from` to `to`
 *
 *  then the resulting expression will be:
 *
 *      `ticket.source.to`
 *
 *  This is done by traversing the `memberExpression` and stopping at the `stopPath` thus keeping the first part.
 */
function partialPath(
    memberExpression: Maybe<Map<any, any>>,
    stopPath: List<any>
): Array<Maybe<string>> {
    const objectPath: Maybe<string>[] = []
    let fullStop = false

    function walk(expr: Maybe<Map<any, any>>, path: Maybe<string>[]) {
        if (fullStop || (stopPath.size && stopPath.equals(fromJS(path)))) {
            fullStop = true
            return
        }

        if (!expr) {
            return
        }

        switch (expr.get('type')) {
            case 'MemberExpression': {
                walk(expr.get('object'), [...path, 'object'])
                walk(expr.get('property'), [...path, 'property'])
                break
            }
            case 'Identifier': {
                objectPath.push(expr.get('name'))
                walk(null, [...path, 'name'])
                break
            }
            default:
                console.error(`Unexpected node ${expr.get('type') as string}`)
                break
        }
    }

    walk(memberExpression, [])
    return objectPath
}

/**
 * Since we only have paths like: `ticket.customer` we need to resolve them to the path in the `schemas`
 */
const resolveArgSchema = (
    leftPath: Maybe<string>[],
    schemas: Schemas
): Maybe<string>[] => {
    const path = []
    let left = leftPath

    if (!(Array.isArray(left) && left.length)) {
        throw Error(
            `leftPath is expected to be {Array}, instead got ${
                leftPath as unknown as string
            }`
        )
    }

    if (left[0] !== 'definitions') {
        left = ['definitions', ...left]
    }

    if (
        left[1] != null &&
        Object.prototype.hasOwnProperty.call(OBJECT_DEFINITIONS, left[1])
    ) {
        left[1] = OBJECT_DEFINITIONS[left[1] as keyof typeof OBJECT_DEFINITIONS]
    }

    // Counts how much we have to remove from the right side of the `leftPath`
    let pathLen = 0
    for (const item of left) {
        path.push(item)
        pathLen += 1

        let schema = schemas.getIn(path) as Map<any, any>
        if (
            schema &&
            schema.get('type') === 'object' &&
            !~path.indexOf('properties') &&
            !~left.indexOf('properties')
        ) {
            path.push('properties')
            schema = schemas.getIn(path)
        }

        if (schema) {
            let ref = ''
            if (schema.get('type') === 'array') {
                ref = schema.getIn(['items', '$ref'])
            } else if (schema.has('$ref')) {
                ref = schema.get('$ref')
            }

            if (ref) {
                const def = ref.split('/')[2]
                // get the remaining path
                const newLeft = ['definitions', def, 'properties']
                const newRight = drop(left, pathLen)
                return resolveArgSchema(
                    newLeft.concat(newRight as string[]),
                    schemas
                )
            }
        }
    }
    return path
}

// This is to stop the iteration of `resolveProperties` so that it doesn't recurse too much
let fullStop = false

/**
 * Here we're trying to find a valid property given a partial path and it's corresponding schema.
 *
 * Ex: message.source -> message.source.from.address
 *
 * Because there can be multiple levels of definitions (EX: refs) we're recurse to find the
 * shortest valid property that has `meta.operators`.
 */
function resolveProperties(
    props: Record<string, unknown>,
    firstArg: Maybe<string>[],
    schemas: Schemas
): Array<Maybe<Maybe<string>[] | Map<any, any>>> | undefined {
    if (fullStop) {
        return [null, null]
    }

    for (const key of Object.keys(props)) {
        const prop = fromJS(props[key]) as Map<any, any>
        if (typeof prop === 'object' && prop.getIn(['meta', 'operators'])) {
            const newFirstArg = [...firstArg, key]
            // we found an arg, so we perform a fullStop for the recursive function
            fullStop = true
            return [newFirstArg, schemas]
        }
    }

    // This part is for deeper nested props
    for (const key of Object.keys(props)) {
        const prop = fromJS(props[key]) as Map<any, any>

        let ref = ''
        if (prop.get('type') === 'array') {
            ref = prop.getIn(['items', '$ref'])
        } else if (prop.has('$ref')) {
            ref = prop.get('$ref')
        }

        if (ref) {
            const def = ref.split('/')[2]
            const path = ['definitions', def, 'properties']
            const defProps = (schemas.getIn(path, {}) as Map<any, any>).toJS()
            return resolveProperties(defProps, [...firstArg, key], schemas)
        }
    }
}

/**
 * Since eq(ticket.sender, '') is valid CallExpression, but can't be used for comparison because it's an object, we
 * need to generate a valid `firstArg` by looking at the schema and selecting the first valid property that supports
 * operations.
 * Ex: `ticket.sender` -> `ticket.sender.channel`
 */
function resolveFirstArgSchema(
    firstArg: Maybe<string>[],
    schemas: Schemas
): [Maybe<string>[], Maybe<Map<any, any>>] {
    // Based on the first arg, try to get our schema
    const schemaPath = resolveArgSchema(firstArg, schemas)
    const firstArgSchema = schemas.getIn(schemaPath) as Map<any, any>

    if (firstArgSchema) {
        // if the schemas supports operators all good, return the schema and the path
        const operators = firstArgSchema.getIn(['meta', 'operators']) as string
        if (operators) {
            return [firstArg, firstArgSchema]
        }

        // no operators means we have to dig deeper into it's properties
        const props = firstArgSchema.toJS() as Record<string, unknown>
        const args = resolveProperties(props, firstArg, schemas)
        return resolveFirstArgSchema(
            ...(args as ArgumentsOf<typeof resolveFirstArgSchema>)
        )
    }
    return [firstArg, null]
}

/**
 * Figure out the first argument of the `callExpression` and it's schema.
 */
function resolveFirstArg(
    callExpression: Map<any, any>,
    stopPath: List<any>,
    schemas: Schemas
) {
    const memberExpression = callExpression.getIn(['arguments', 0]) as Map<
        any,
        any
    >

    // Get a partial path of the `memberExpression` based on the stopPath.
    // Ex: `ticket.customer.email` -> `ticket.sender` (meaning that `customer` prop changed)
    const firstArg = partialPath(memberExpression, stopPath)
    // Since eq(ticket.sender, '') is valid, but doesn't make any sense, we need to generate a sane `firstArg` by
    // looking at the schema and selecting the first valid property that supports operations.
    // Ex: `ticket.sender` -> `ticket.sender.channel`
    fullStop = false
    return resolveFirstArgSchema(firstArg, schemas)
}

/**
 * Figure out the second argument of the `callExpression`.
 *
 * We're trying to keep the existing callee if the `firstArgSchema` allows it, otherwise default to the first one found.
 */
export function resolveCallee(
    callExpression: Map<any, any>,
    firstArgSchema: Schemas
): string {
    const oldCallee = callExpression.getIn(['callee', 'name'], '') as string
    let callee: Maybe<string> = oldCallee

    if (firstArgSchema && firstArgSchema.getIn(['meta', 'operators'])) {
        const operators = Object.keys(
            (
                firstArgSchema.getIn(['meta', 'operators']) as Map<any, any>
            ).toJS()
        )

        callee = operators.find((operator) => operator === oldCallee)

        const defaultOperator = firstArgSchema.getIn([
            'meta',
            'defaultOperator',
        ]) as string
        if (
            !callee &&
            defaultOperator &&
            !Object.values(DeprecatedOperator).includes(defaultOperator as any)
        ) {
            callee = operators.find((operator) => operator === defaultOperator)
        }

        if (!callee) {
            callee = operators.filter(
                (op) => !Object.values(DeprecatedOperator).includes(op as any)
            )[0]
        }
    }

    return callee
}

/**
 * Figure out the second argument of the `callExpression`.
 *
 * What happens here is we try to keep the old value if we can. Otherwise we look into possible
 * values based on `firstArgSchema`
 */
export function resolveSecondArg(
    callExpression: Map<any, any>,
    firstArgSchema: Schemas,
    callee: string,
    reset: boolean
): Maybe<string> {
    // empty operators have only one argument
    if (Object.keys(UNARY_OPERATORS).includes(callee)) {
        return null
    }

    const hasEnum = <T>(enumType: T) => Object.values(enumType).includes(callee)
    const isCollectionCallee = hasEnum(CollectionOperator)
    const isTimedeltaCallee = hasEnum(TimedeltaOperator)
    const isDatetimeCallee = hasEnum(DatetimeOperator)

    const args = (callExpression.getIn(['arguments', 1]) || fromJS({})) as Map<
        any,
        any
    >
    let curDefault = ''
    let curValue: Maybe<string[] | string> = undefined

    // define the current default and value
    switch (args.get('type')) {
        case 'ArrayExpression':
            curDefault = '[]'
            curValue = (args.get('elements') as List<any>)
                .map((elem: Map<any, any>) => elem.get('value') as string)
                .toJS() as string[]
            break
        case 'Literal':
            curDefault = "''"
            curValue = args.get('value') as string
            break
        default:
    }

    const useCurValue = !reset && !_isUndefined(curValue) && curValue !== ''

    if (isCollectionCallee) {
        // property has changed, so we have to reset the second argument
        if (!useCurValue) {
            return '[]'
        }

        // current value is an array so we just create the raw value
        if (_isArray(curValue)) {
            return `[${
                (args.get('elements') as List<any>)
                    .map((elem: Map<any, any>) => elem.get('raw') as string)
                    .toJS() as string
            }]`
        }

        // argument is not an array but new callee needs one
        // so we transform the current value to an array
        return `[${args.get('raw') as string}]`
    } else if (isTimedeltaCallee && !isTimedelta(curValue)) {
        return `'${TIMEDELTA_OPERATOR_DEFAULT_VALUE}'`
    } else if (
        isDatetimeCallee &&
        !moment(curValue, 'YYYY-MM-DDTHH:mm:ss', true).isValid()
    ) {
        return `'${moment().format()}'`
    }

    if (firstArgSchema) {
        switch (firstArgSchema.get('type')) {
            case 'string':
                if (firstArgSchema.getIn(['meta', 'enum'])) {
                    const possibleLiterals = (
                        firstArgSchema.getIn(['meta', 'enum']) as List<any>
                    ).toJS() as unknown[]
                    const firstLit = possibleLiterals[0]

                    if (!reset) {
                        for (const lit of possibleLiterals.slice(1)) {
                            // just leave the same value as before
                            if (lit === curValue) {
                                return `'${lit as string}'`
                            }
                        }
                    }
                    return `'${firstLit as string}'`
                }

                return useCurValue && _isString(curValue)
                    ? `'${curValue}'`
                    : "''"

            case 'integer':
                return useCurValue && _isInteger(curValue)
                    ? (args.get('raw') as string)
                    : "''"

            case 'boolean':
                return 'true'
            default:
        }
    }

    return curDefault
}

/**
 *
 * Generate a new CallExpression that will be used to replace the existing one.
 *
 * Example:
 *
 * Original expression:
 *
 *      eq(message.source.from.address, 'alex@gorgias.io')
 *
 * Now we want to change the `message.source` to `event.type`
 *
 * Desired expression:
 *
 *      eq(event.type, 'ticket-message-created')
 *
 * Because of the tree nature of the AST the 'simplest' way to generate the desired expression is to create an entirely
 * new CallExpression and replace the old one.
 *
 * To do this we need to figure out each of the 3 parts of the CallExpression (callee, first argument, second argument).
 * In our case: `callee` is 'eq', `first argument` is 'event.type' and `'ticket-message-created'` is the `second arg`
 *
 * First argument resolution:
 *
 * Because we're changing object types: `message` to `event`, we need to figure out if `event` supports
 * any operators (it does not).
 * If it doesn't we need to traverse it's properties (from it's openapi schema) and find one that does.
 *
 * Callee resolution:
 *
 * By default we try to keep the existing callee from the previous CallExpression because the user usually wants this.
 * If the operator is not present in the list of possible operators of our first argument, then we just take the first
 * one that is valid.
 *
 * Second argument resolution:
 *
 * Again, we try to keep the existing second argument if it's valid for the new `first argument`.
 * If it's not we'll have to look in the schemas for possible values (enum, object type, etc..)
 */
export function updateCallExpression(
    state: Map<any, any>,
    path: List<any>,
    schemas: Schemas
) {
    // nothing to do if it's just a value change, just return the same state
    // `value`: value of an AST Literal
    // `elements`: values of an AST ArrayExpression
    if (['value', 'elements'].includes(path.last())) {
        return state
    }

    const argumentsIndex = path.lastIndexOf('arguments')
    const calleeIndex = path.lastIndexOf('callee')
    let callExpressionPath = path
    let stopPath = fromJS({}) as List<any>
    // Property is the first argument of a call expression.
    // E.g: message.from_agent, ticket.subject, etc...
    const hasPropertyChanged = (~argumentsIndex &&
        path.get(argumentsIndex + 1) === 0) as boolean

    if (~argumentsIndex) {
        // an argument has changed
        callExpressionPath = path.setSize(argumentsIndex)
        stopPath = path.takeLast(
            path.size - callExpressionPath.size - 2
        ) as List<any>
    } else if (~calleeIndex) {
        // callee has changed
        callExpressionPath = path.setSize(calleeIndex)
        stopPath = path.takeLast(
            path.size - callExpressionPath.size
        ) as List<any>
    }

    const callExpression = (state.getIn(callExpressionPath.toJS()) ||
        fromJS({})) as Map<any, any>
    const [firstArg, firstArgSchema] = resolveFirstArg(
        callExpression,
        stopPath,
        schemas
    )
    const callee = resolveCallee(
        callExpression,
        firstArgSchema as Map<any, any>
    )
    const secondArg = resolveSecondArg(
        callExpression,
        firstArgSchema as Map<any, any>,
        callee,
        hasPropertyChanged
    )
    // generate the new CallExpression and replace the old one
    let rawCallExpression = `${callee}(${firstArg.join('.')}`

    if (secondArg) {
        rawCallExpression += `, ${secondArg}`
    }
    rawCallExpression += ')'
    // getAST will give us the whole Program, but we're only interested in the first CallExpression
    const newCallExpression = getFirstExpressionOfAST(getAST(rawCallExpression))
    return state.setIn(callExpressionPath, newCallExpression)
}

export function getObjectExpression(
    actionDict: Record<string, unknown>
): ObjectExpression {
    const properties: ObjectExpressionProperty[] = Object.keys(actionDict).map(
        (keyItem) => ({
            type: 'Property',
            key: {
                type: 'Identifier',
                name: keyItem,
            },
            computed: false,
            value: {
                type: 'Literal',
                value: `${actionDict[keyItem] as string}`,
                raw: `\'${actionDict[keyItem] as string}\'`,
            },
            kind: 'init',
            method: false,
            shorthand: false,
        })
    )

    return {type: 'ObjectExpression', properties}
}

export function getEmptyRule(): RuleDraft {
    return {
        name: 'New rule',
        description: '',
        code: '',
        code_ast: getAST(''),
        event_types: 'ticket-created',
        deactivated_datetime: null,
    } as RuleDraft
}
