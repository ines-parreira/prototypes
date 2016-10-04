import {fromJS} from 'immutable'
import esprima from 'esprima'

// traverse filters_ast, find all the call expressions and return a new tree
export function addFilterAST(view, filter) {
    // generate a new call expression for the new filter as a string
    const newCallExprCode = `${filter.operator}(${filter.left}, ${filter.right})`
    // since we only ever have AND operators just concatenate existing expressions
    const oldCode = view.get('filters') ? `${view.get('filters')} && ` : ''
    const newCode = `${oldCode}${newCallExprCode}`
    return fromJS(esprima.parse(newCode))
}

// traverse filters_ast, remove the call expressions and return a new tree
export function removeFilterAST(view, index) {
    // As always, we assume that we only have && operators
    const codeSplit = view.get('filters').split('&&')
    codeSplit.splice(index, 1)
    if (codeSplit.length !== 0) {
        return fromJS(esprima.parse(codeSplit.join('&&')))
    }
    return ''
}

// walk and edit the ast tree
function walk(ast, index, key, value) {
    let count = 0

    function walker(node) {
        switch (node.get('type')) {
            case 'Program':
                return node.setIn(['body', 0], walker(node.getIn(['body', 0])))
            case 'ExpressionStatement':
                return node.set('expression', walker(node.get('expression')))
            case 'LogicalExpression':
                return node.set('left', walker(node.get('left'))).set('right', walker(node.get('right')))
            case 'CallExpression':
                if (count === index) {
                    return node.setIn(key, value)
                }

                count++
                return node
            default:
                return node
        }
    }

    return walker(ast)
}

// traverse filters_ast and replace the callee name of the CallExpression found at `index
// once replaced, we return the new AST
export function updateFilterOperator(view, index, operator) {
    const ast = view.get('filters_ast')
    return walk(ast, index, ['callee', 'name'], operator)
}

export function updateFilterValue(view, index, value) {
    const ast = view.get('filters_ast')
    return walk(ast, index, ['arguments', 1, 'value'], value)
}
