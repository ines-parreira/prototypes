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
                count++
                if ((count - 1) === index) {
                    return node.setIn(key, value)
                }

                return node
            default:
                return node
        }
    }

    return walker(ast)
}

// traverse filters_ast and replace the callee name of the CallExpression found at `index
// once replaced, we return the new AST
export function updateFilterOperator(ast, index, operator) {
    return walk(ast, index, ['callee', 'name'], operator)
}

export function updateFilterValue(ast, index, value) {
    return walk(ast, index, ['arguments', 1, 'value'], value)
}

/**
 * Sort view by `hide` and `display_order` property.
 * hidden views are at the bottom.
 * @param {Map} view1
 * @param {Map} view2
 * @returns {number}
 */
export function sortViews(view1, view2) {
    const isView1Hidden = view1.get('hide', false)
    const isView2Hidden = view2.get('hide', false)

    if (isView1Hidden && !isView2Hidden) {
        return 1
    } else if (!isView1Hidden && isView2Hidden) {
        return -1
    }

    return view1.get('display_order', 0) - view2.get('display_order', 0)
}

export function agentsViewingMessage(agents) {
    const agentsNames = agents.map(agent => agent.get('name')).join(', ')
    return `${agentsNames} ${agents.size > 1 ? 'are' : 'is'} viewing`
}

export function agentsTypingMessage(agents) {
    const agentsNames = agents.map(agent => agent.get('name')).join(', ')
    return `${agentsNames} ${agents.size > 1 ? 'are' : 'is'} typing`
}
