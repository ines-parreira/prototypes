// @flow
import {fromJS} from 'immutable'
import drop from 'lodash/drop'
import {OBJECT_DEFINITIONS} from './constants'
import {getAST} from '../../utils'

import type {Map, List} from 'immutable'
import type {schemasType} from '../../types'
type argPathType = Array<?string>

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
 *
 * @param memberExpression
 * @param stopPath
 * @returns {Array}
 */
function partialPath(memberExpression: ?Map<*,*>, stopPath: List<*>): Array<?string> {
    const objectPath = []
    let fullStop = false


    function walk(expr: ?Map<*,*>, path: argPathType) {
        if (fullStop || stopPath.equals(fromJS(path))) {
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
                console.error(`Unexpected node ${expr.get('type')}`)
                break
        }
    }

    walk(memberExpression, [])
    return objectPath
}

/**
 * Since we only have paths like: `ticket.requester` we need to resolve them to the path in the `schemas`
 *
 * @param leftPath - firstArg path
 * @param schemas - OpenAPI schema
 * @returns {Array}
 */
const resolveArgSchema = (leftPath: argPathType, schemas: schemasType): argPathType => {
    const path = []
    let left = leftPath

    // TODO(@ghinda): Flow will throw an error for this,
    // remove when sure.
    if (!(Array.isArray(left) && left.length)) {
        // $FlowFixMe
        throw Error(`leftPath is expected to be {Array}, instead got ${leftPath}`)
    }

    if (left[0] !== 'definitions') {
        left = ['definitions', ...left]
    }

    if (OBJECT_DEFINITIONS.hasOwnProperty(left[1])) {
        left[1] = OBJECT_DEFINITIONS[left[1]]
    }

    // Counts how much we have to remove from the right side of the `leftPath`
    let pathLen = 0
    for (const item of left) {
        path.push(item)
        pathLen += 1

        let schema = schemas.getIn(path)
        if (schema && schema.get('type') === 'object' && !~path.indexOf('properties') && !~left.indexOf('properties')) {
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
                return resolveArgSchema(newLeft.concat(newRight), schemas)
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
 *
 * @param props - Properties of a definition
 * @param firstArg - Path of the first argument of the callExpresion []
 * @param schemas - OpenAPI schemas
 * @returns {Array}
 */
function resolveProperties(props: {}, firstArg: argPathType, schemas: schemasType): ?argPathType {
    if (fullStop) {
        return [null, null]
    }

    for (const key of Object.keys(props)) {
        const prop = fromJS(props[key])
        if (typeof prop === 'object' && prop.getIn(['meta', 'operators'])) {
            const newFirstArg = [...firstArg, key]
            // we found an arg, so we perform a fullStop for the recursive function
            fullStop = true
            // TODO flow can't understand Array<Array<string> | string>
            // because Array<string> and string are not compatible.
            // $FlowFixMe
            return [newFirstArg, schemas]
        }
    }

    // This part is for deeper nested props
    for (const key of Object.keys(props)) {
        const prop = fromJS(props[key])

        let ref = ''
        if (prop.get('type') === 'array') {
            ref = prop.getIn(['items', '$ref'])
        } else if (prop.has('$ref')) {
            ref = prop.get('$ref')
        }

        if (ref) {
            const def = ref.split('/')[2]
            const path = ['definitions', def, 'properties']
            const defProps = schemas.getIn(path, {}).toJS()
            return resolveProperties(defProps, [...firstArg, key], schemas)
        }
    }
}

/**
 * Since eq(ticket.sender, '') is valid CallExpression, but can't be used for comparison because it's an object, we
 * need to generate a valid `firstArg` by looking at the schema and selecting the first valid property that supports
 * operations.
 * Ex: `ticket.sender` -> `ticket.sender.channel`
 *
 * @param firstArg - Partial argument path
 * @param schemas - OpenAPI schemas
 * @returns {Array}
 */
function resolveFirstArgSchema(firstArg: argPathType, schemas: schemasType): [argPathType, null] {
    // Based on the first arg, try to get our schema
    const schemaPath = resolveArgSchema(firstArg, schemas)
    const firstArgSchema = schemas.getIn(schemaPath)

    if (firstArgSchema) {
        // if the schemas supports operators all good, return the schema and the path
        const operators = firstArgSchema.getIn(['meta', 'operators'])
        if (operators) {
            return [firstArg, firstArgSchema]
        }


        // no operators means we have to dig deeper into it's properties
        const props = firstArgSchema.toJS()
        const args = resolveProperties(props, firstArg, schemas)
        // $FlowFixMe
        return resolveFirstArgSchema(...args)
    }
    return [firstArg, null]
}

/**
 * Figure out the first argument of the `callExpression` and it's schema.
 *
 * @param callExpression - the callExpression that will be changed
 * @param stopPath - when we need to stop the iteration
 * @param schemas - OpenAPI schemas
 * @returns {Array} a new firstArg and it's schema
 */
function resolveFirstArg(callExpression: Map<*,*>, stopPath: List<*>, schemas: schemasType) {
    const memberExpression = callExpression.getIn(['arguments', 0])

    // Get a partial path of the `memberExpression` based on the stopPath.
    // Ex: `ticket.requester.email` -> `ticket.sender` (meaning that `requester` prop changed)
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
 *
 * @param callExpression - callExpression that we need to change
 * @param firstArgSchema - schema of the first argument of the callExpression that is used to get possible vals
 * @returns {String} The new callee.
 */
function resolveCallee(callExpression: Map<*,*>, firstArgSchema: schemasType): string {
    const oldCallee = callExpression.getIn(['callee', 'name'], '')
    let callee = oldCallee
    if (firstArgSchema && firstArgSchema.getIn(['meta', 'operators'])) {
        const operators = Object.keys(firstArgSchema.getIn(['meta', 'operators']).toJS())
        callee = operators[0]
        for (const op of operators) {
            // just leave the same operator as before
            if (op === oldCallee) {
                return op
            }
        }
    }
    return callee
}

/**
 * Figure out the second argument of the `callExpression`.
 *
 * What happens here is we try to keep the old value if we can. Otherwise we look into possible
 * values based on `firstArgSchema`
 *
 * @param callExpression - callExpression that we need to change
 * @param firstArgSchema - schema of the first argument of the callExpression that is used to get possible vals
 * @returns {String} The new value of the second argument.
 */
function resolveSecondArg(callExpression: Map<*,*>, firstArgSchema: schemasType) {
    const def = '\'\''
    const oldLiteral = callExpression.getIn(['arguments', 1], fromJS({}))
    const oldLiteralValue = oldLiteral.get('value')

    if (firstArgSchema) {
        switch (firstArgSchema.get('type')) {
            case 'string':
                if (firstArgSchema.getIn(['meta', 'enum'])) {
                    const possibleLiterals = firstArgSchema.getIn(['meta', 'enum']).toJS()
                    const firstLit = possibleLiterals[0]
                    for (const lit of possibleLiterals.slice(1)) {
                        // just leave the same value as before
                        if (lit === oldLiteralValue) {
                            return `'${lit}'`
                        }
                    }
                    return `'${firstLit}'`
                }
                return def
            case 'bool':
                return 'true'
            default:
                return def
        }
    }
    return def
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
 *
 * @param state - redux state
 * @param callExpressionPath - the path of our callExpression that we'll need to modify
 * @param fullPath - full path of the place where the change happened
 * @param schemas - OpenAPI schemas
 * @returns {*}
 */
export function updateCallExpression(state: Map<*,*>, callExpressionPath: Map<*,*>, fullPath: List<*>, schemas: schemasType) {
    // nothing to do if it's just a value change, just return the same state
    if (fullPath.last() === 'value') {
        return state
    }

    const callExpression = state.getIn(callExpressionPath.toJS()) || fromJS({})
    const stopPath = fullPath.takeLast(fullPath.size - (callExpressionPath.size + 2))

    const [firstArg, firstArgSchema] = resolveFirstArg(callExpression, stopPath, schemas)
    const callee = resolveCallee(callExpression, firstArgSchema)
    const secondArg = resolveSecondArg(callExpression, firstArgSchema)

    // generate the new CallExpression and replace the old one
    const rawCallExpression = `${callee}(${firstArg.join('.')}, ${secondArg})`

    // getAST will give us the whole Program, but we're only interested in the first CallExpression
    const newCallExpression = fromJS(getAST(rawCallExpression)).getIn(['body', 0, 'expression'])
    return state.setIn(callExpressionPath, newCallExpression)
}

type objectPropertyType = {
    type: 'Property',
    key: {
        type: 'Identifier',
        name: string
    },
    computed: false,
    value: {
        type: 'Literal',
        value: string,
        raw: string
    },
    kind: 'init',
    method: false,
    shorthand: false
}
type objectExpressionType = {
    type: 'ObjectExpression',
    properties: Array<objectPropertyType>
}

export function getObjectExpression(actionDict: {}): objectExpressionType {
    const properties = Object.keys(actionDict).map((keyItem) => ({
        type: 'Property',
        key: {
            type: 'Identifier',
            name: keyItem
        },
        computed: false,
        value: {
            type: 'Literal',
            value: `${actionDict[keyItem]}`,
            raw: `\'${actionDict[keyItem]}\'`
        },
        kind: 'init',
        method: false,
        shorthand: false
    }))

    return {type: 'ObjectExpression', properties}
}
