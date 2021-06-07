import esprima from 'esprima'
import escodegen from 'escodegen'
import {fromJS, Map, List} from 'immutable'
import _set from 'lodash/set'
import _get from 'lodash/get'

import {
    CollectionOperator,
    ObjectExpressionPropertyKey,
    Rule,
} from '../../state/rules/types'

import {UNARY_OPERATORS} from '../../config'

import {RuleObject, IdentifierCategoryKey} from './types'

const unaryOperatorsNames = Object.keys(UNARY_OPERATORS)
const collectionOperatorsNames = Object.values(CollectionOperator)

export function getAstPath<T>(
    property: ObjectExpressionPropertyKey,
    object: RuleObject | ObjectExpressionPropertyKey
): string[] {
    if ((object as ObjectExpressionPropertyKey).name) {
        return [(object as ObjectExpressionPropertyKey).name, property.name]
    }
    return getAstPath(
        (object as RuleObject).property,
        (object as RuleObject).object
    ).concat([property.name])
}

function generateExpression([currentValue, ...other]: string[]): RuleObject {
    return {
        computed: false,
        object:
            other.length > 1
                ? generateExpression(other)
                : {
                      name: other[0],
                      type: 'Identifier',
                  },
        property: {
            name: currentValue,
            type: 'Identifier',
        },
        type: 'MemberExpression',
    } as RuleObject
}

export function getFormattedRule(
    rule: Map<any, any>,
    value: string,
    path: List<any>
) {
    const {code_ast, ...other} = rule.toJS() as Rule
    const formattedPath = (path.toJS() as (string | number)[]).map((property) =>
        typeof property === 'number' ? property.toString() : property
    )
    _set(
        code_ast,
        formattedPath,
        generateExpression(value.split('.').reverse())
    )
    const operatorName: string = _get(
        code_ast,
        formattedPath.slice(0, -2).concat(['callee', 'name'])
    )

    if (!unaryOperatorsNames.includes(operatorName)) {
        const value = collectionOperatorsNames.includes(operatorName as any)
            ? {elements: [], type: 'ArrayExpression'}
            : {raw: "'null'", type: 'Literal', value: null}
        _set(code_ast, formattedPath.slice(0, -1).concat(['1']), value)
    }
    const code = escodegen.generate(code_ast, {format: {semicolons: false}})

    return fromJS({
        ...other,
        code,
        code_ast: esprima.parse(code, {loc: true}),
    }) as Map<any, any>
}

export function getCategoryFromPath(path: string[]): IdentifierCategoryKey {
    const jointPath = path.slice(0, path.length - 1).join('.')

    if (jointPath.includes('shopify.last_order')) {
        return IdentifierCategoryKey.ShopifyLastOrder
    } else if (jointPath.includes('shopify.customer')) {
        return IdentifierCategoryKey.ShopifyCustomer
    } else if (jointPath.includes('magento2.last_order')) {
        return IdentifierCategoryKey.Magento2LastOrder
    } else if (jointPath.includes('magento2.customer')) {
        return IdentifierCategoryKey.Magento2Customer
    } else if (jointPath.includes('recharge.last_subscription')) {
        return IdentifierCategoryKey.RechargeLastSubscription
    } else if (jointPath.includes('recharge.customer')) {
        return IdentifierCategoryKey.RechargeCustomer
    } else if (jointPath.includes('integrations.smile.customer')) {
        return IdentifierCategoryKey.SmileCustomer
    } else if (jointPath.includes('ticket.customer')) {
        return IdentifierCategoryKey.Customer
    }
    return path[0] as IdentifierCategoryKey
}
