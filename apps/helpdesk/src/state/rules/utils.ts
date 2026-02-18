import { isTimedelta } from '@repo/utils'
import type { List, Map } from 'immutable'
import { fromJS } from 'immutable'
import drop from 'lodash/drop'
import _isArray from 'lodash/isArray'
import _isInteger from 'lodash/isInteger'
import _isString from 'lodash/isString'
import _isUndefined from 'lodash/isUndefined'
import moment from 'moment-timezone'

import { TIMEDELTA_OPERATOR_DEFAULT_VALUE, UNARY_OPERATORS } from '../../config'
import type { Schemas } from '../../types'
import { getAST, getFirstExpressionOfAST } from '../../utils'
import { OBJECT_DEFINITIONS } from './constants'
import type {
    ObjectExpression,
    ObjectExpressionProperty,
    RuleDraft,
} from './types'
import {
    CollectionOperator,
    DatetimeOperator,
    DeprecatedOperator,
    TimedeltaOperator,
} from './types'

/**
 * Convert a path array to a valid JavaScript expression
 * Handles custom field IDs with bracket notation
 */
function pathToJavaScript(path: Array<Maybe<string>>): string {
    if (!path || path.length === 0) {
        return ''
    }

    let result = ''
    for (let i = 0; i < path.length; i++) {
        const part = path[i]
        if (!part) continue

        // Check if this part is a number (custom field ID)
        const isNumber = !isNaN(Number(part as string)) && part !== ''

        if (i === 0) {
            result = part
        } else if (isNumber) {
            // For custom field IDs, use bracket notation
            result += `['${part}']`
        } else {
            // For regular properties, use dot notation
            result += `.${part}`
        }
    }
    return result
}

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
    stopPath: List<any>,
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
            case 'Literal': {
                // Handle Literal nodes (like the custom field ID)
                const value = expr.get('value')
                if (typeof value === 'string' || typeof value === 'number') {
                    // For custom field IDs, we just push the value as a string
                    // The system will handle the bracket notation when generating the final JavaScript
                    objectPath.push(String(value))
                }
                walk(null, [...path, 'value'])
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
    schemas: Schemas,
): Maybe<string>[] => {
    const path = []
    let left = leftPath

    if (!(Array.isArray(left) && left.length)) {
        throw Error(
            `leftPath is expected to be {Array}, instead got ${
                leftPath as unknown as string
            }`,
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
                    schemas,
                )
            }
        }
    }
    if (path.includes('custom_fields')) {
        return path.slice(0, path.length - 2) // drop the custom field value
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
    schemas: Schemas,
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

    return undefined
}

/**
 * Since eq(ticket.sender, '') is valid CallExpression, but can't be used for comparison because it's an object, we
 * need to generate a valid `firstArg` by looking at the schema and selecting the first valid property that supports
 * operations.
 * Ex: `ticket.sender` -> `ticket.sender.channel`
 */
function resolveFirstArgSchema(
    firstArg: Maybe<string>[],
    schemas: Schemas,
    schemaDefinitionKey?: string,
): [Maybe<string>[], Maybe<Map<any, any>>, Maybe<string>[] | undefined] {
    // Based on the first arg, try to get our schema
    const schemaPath = resolveArgSchema(firstArg, schemas)
    const firstArgSchema = schemas.getIn(schemaPath) as Map<any, any>

    if (firstArgSchema) {
        const path = firstArg.includes('custom_fields')
            ? ['meta', 'operators', schemaDefinitionKey]
            : ['meta', 'operators']
        // if the schemas supports operators all good, return the schema and the path
        const operators = firstArgSchema.getIn(path) as Map<any, any>

        if (operators) {
            return [firstArg, firstArgSchema, path]
        }

        // no operators means we have to dig deeper into it's properties
        const props = firstArgSchema.toJS() as Record<string, unknown>
        const resolveResult = resolveProperties(props, firstArg, schemas)
        if (resolveResult) {
            const [nextFirstArg] = resolveResult as [Maybe<string>[]]
            return resolveFirstArgSchema(
                nextFirstArg,
                schemas,
                schemaDefinitionKey,
            )
        }
        return [firstArg, null, undefined]
    }
    return [firstArg, null, undefined]
}

/**
 * Figure out the first argument of the `callExpression` and it's schema.
 */
function resolveFirstArg(
    callExpression: Map<any, any>,
    stopPath: List<any>,
    schemas: Schemas,
    schemaDefinitionKey?: string,
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
    return resolveFirstArgSchema(firstArg, schemas, schemaDefinitionKey)
}

/**
 * Figure out the second argument of the `callExpression`.
 *
 * We're trying to keep the existing callee if the `firstArgSchema` allows it, otherwise default to the first one found.
 */
export function resolveCallee(
    callExpression: Map<any, any>,
    firstArgSchema: Schemas,
    path: Maybe<string>[] = ['meta', 'operators'],
): string {
    const oldCallee = callExpression.getIn(['callee', 'name'], '') as string
    let callee: Maybe<string> = oldCallee

    if (firstArgSchema && firstArgSchema.getIn(path)) {
        const operators = Object.keys(
            (firstArgSchema.getIn(path) as Map<any, any>).toJS(),
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
                (op) => !Object.values(DeprecatedOperator).includes(op as any),
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
    callee: string,
    reset: boolean,
    firstArgSchema?: Schemas,
    schemaDefinitionKey?: string, // present if this is a custom field argument
): Maybe<string> {
    // empty operators have only one argument
    if (Object.keys(UNARY_OPERATORS).includes(callee)) {
        return null
    }

    const hasEnum = <T extends object>(enumType: T) =>
        Object.values(enumType).includes(callee)
    const isCollectionCallee = hasEnum(CollectionOperator)
    const isTimedeltaCallee = hasEnum(TimedeltaOperator) && !schemaDefinitionKey
    const isDatetimeCallee = hasEnum(DatetimeOperator) && !schemaDefinitionKey

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
    schemas: Schemas,
    schemaDefinitionKey?: string,
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
            path.size - callExpressionPath.size - 2,
        ) as List<any>
    } else if (~calleeIndex) {
        // callee has changed
        callExpressionPath = path.setSize(calleeIndex)
        stopPath = path.takeLast(
            path.size - callExpressionPath.size,
        ) as List<any>
    }

    const callExpression = (state.getIn(callExpressionPath.toJS()) ||
        fromJS({})) as Map<any, any>

    const [firstArg, firstArgSchema, pathToOperators] = resolveFirstArg(
        callExpression,
        stopPath,
        schemas,
        schemaDefinitionKey,
    )

    // get firstArgSchema for custom fields
    let callee = null
    let secondArg = null
    if (firstArg && firstArg.includes('self_service_flow')) {
        // TODO(@VictorXunS): Remove this when self_service_flow variables are in schemas
        callee = callExpression.getIn(['callee', 'name'], '') as string
        secondArg = "''"
    } else {
        callee = resolveCallee(
            callExpression,
            firstArgSchema as Map<any, any>,
            pathToOperators,
        )
        secondArg = resolveSecondArg(
            callExpression,
            callee,
            hasPropertyChanged,
            firstArgSchema as Map<any, any>,
            schemaDefinitionKey,
        )
    }

    // generate the new CallExpression and replace the old one
    let rawCallExpression = `${callee}(${pathToJavaScript(firstArg)}`

    if (secondArg) {
        rawCallExpression += `, ${secondArg}`
    }
    rawCallExpression += ')'
    // getAST will give us the whole Program, but we're only interested in the first CallExpression
    const newCallExpression = getFirstExpressionOfAST(getAST(rawCallExpression))
    return state.setIn(callExpressionPath, newCallExpression)
}

export function getObjectExpression(
    actionDict: Record<string, unknown>,
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
        }),
    )

    return { type: 'ObjectExpression', properties }
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
