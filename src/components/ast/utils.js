import { List } from 'immutable'

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
export default function getSyntaxTreeLeaves(syntaxTree) {
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
            console.warn('Unknown type', syntaxTree)
    }
}
