import {fromJS, List} from 'immutable'

import {ACTION_DEFAULT_STATE} from '../../../../state/rules/constants'
import {updateCallExpression, getObjectExpression} from '../../../../state/rules/utils'
import {getCode, getAST, toJS, toImmutable} from '../../../../utils'

/* Given a WrappingNode construct a list that contains the path of all the leaves inside the tree.

 Ex:
 <WrappingNode ticket>
 <WrappingNode message>
 <WrappingNode from_agent>

 Will result in:
 ['ticket', 'message', 'from_agent']

 This kind of path is useful for use in combination with the schemas (getting the kind of widgets,
 possible values, etc..)

 */
export const getSyntaxTreeLeaves = (syntaxTree) => {
    if (syntaxTree === undefined || syntaxTree.type === undefined) {
        return null
    }

    switch (syntaxTree.type) {
        case 'Identifier':
            return List([syntaxTree.name])
        case 'Literal':
            return List([syntaxTree.value])
        case 'MemberExpression':
            return getSyntaxTreeLeaves(syntaxTree.object).concat(
                getSyntaxTreeLeaves(syntaxTree.property))
        default:
            throw Error('Unknown type', syntaxTree)
    }
}

export const updateCodeAst = (schemas, ast, path, value, operation) => {
    ast = toImmutable(ast)
    path = toImmutable(path)

    let newAst

    if (operation === 'UPDATE') {
        // First set the value directly based on the full path
        newAst = ast.setIn(path.toJS(), value)

        /* When we do an update for a node, the possible choices after that
         * node will be generated with a default value
         * Ex: if(eq(ticket.status,'open')){}
         * When "status" is changed to "channel", the expression is transformed to:
         * if (eq(ticket.channel, 'email')){}
         */

        // Do the updates only in the IfStatement.test
        if (path.contains('test')) {
            const argumentsIndex = path.lastIndexOf('arguments')
            if (~argumentsIndex) {
                const pathParentCallExpression = path.setSize(argumentsIndex)
                // generate a new CallExpression with some default values based on the schema
                newAst = updateCallExpression(
                    newAst,
                    pathParentCallExpression,
                    path,
                    schemas
                )
            }
        } else {
            // Update the arguments for actions when action name is updated
            const argumentsIndex = path.lastIndexOf('arguments')
            const index2 = path.lastIndexOf(0)

            // We check if this update, edit the first argument of a CallExpression
            if (~argumentsIndex && ~index2 && (index2 - argumentsIndex) === 1) {
                const pathParentCallExpression = path.setSize(argumentsIndex)
                const calleeName = newAst.getIn(pathParentCallExpression.push('callee', 'name'))

                if (calleeName === 'Action') {
                    // We override the second argument with the default value of the new action type
                    // This is done so we have a default value for a newly created action
                    newAst = newAst.setIn(
                        pathParentCallExpression.push('arguments', 1),
                        getObjectExpression(ACTION_DEFAULT_STATE[value] || {})
                    )
                }
            }
        }
    }

    if (operation === 'INSERT') {
        const valueP = ast.getIn(path.toJS())

        /*
         * In the case of pathNew = ["code_ast", "body", 0, "alternate", "body"]
         * But in the real code, else part, "alternate" is null.
         * We need to change the code
         * I)  if(x){}
         * to
         * II) if(x){} else{}
         *
         * In the Syntax tree level, it's equivalent to change
         * I)  "alternate": null
         * to
         * II) "alternate": {
         *        "type": "BlockStatement"
         *        "body": []
         *     }
         */

        if ((valueP === undefined) && (path.get(path.size - 2) === 'alternate')) {
            const pathElse = path.pop()
            newAst = ast.setIn(pathElse.toJS(), fromJS({
                type: 'BlockStatement',
                body: [value],
            }))
        } else {
            newAst = ast.updateIn(path.toJS(), list => {
                // add action at the beginning of the body (more readable for user)
                if (value.type === 'ExpressionStatement') {
                    return list.unshift(value)
                }

                // add conditions at the end of the body
                return list.push(value)
            })
        }
    }
    if (operation === 'DELETE') {
        const lastIndex = path.last()
        const pathNew = path.pop()
        newAst = ast.updateIn(pathNew.toJS(), list => list.delete(lastIndex))
    }

    // Add logical AND operation in TEST block of IFSTATEMENT.
    if (operation === 'UPDATE_LOGICAL_OPERATOR') {
        const test = ast.getIn(path.toJS())
        value.left = test.toJS()
        newAst = ast.setIn(path.toJS(), value)
    }

    /*
     * Operating on the syntax tree to delete the binary expression.
     * We assume the statement includes only AND. And the order is
     * enforced like:
     * if (ticket.status == 'channel' && (ticket.status == 'channel' && ticket.status == 'new'))
     *
     * This assumption will stay true since in UPDATE_LOGICAL_OPERATOR, we force this order.
     */

    if (operation === 'DELETE_BINARY_EXPRESSION') {
        const lastIndex = path.last()
        const pathNew = path.pop()

        if (lastIndex === 'left') {
            const right = ast.getIn(pathNew.push('right').toJS())
            newAst = ast.setIn(pathNew.toJS(), right)
        } else if (lastIndex === 'right') {
            const left = ast.getIn(pathNew.push('left').toJS())
            newAst = ast.setIn(pathNew.toJS(), left)
        } else {
            newAst = getAST('')
        }
    }

    // fallback if new ast is null/undefined
    // this should not happen
    if (!newAst) {
        console.warn('New AST was not generated', newAst)
    }

    newAst = toJS(newAst)
    return {
        code: getCode(newAst),
        ast: newAst,
    }
}
