import Immutable from 'immutable'

/* Get all the name of the leaf nodes (Identifier and Literal nodes) of
 * the syntax tree.
 */
export default function getSyntaxTreeLeaves(syntaxTree) {
    if (syntaxTree === undefined || syntaxTree.type === undefined) {
        return null
    }

    if (syntaxTree.type === 'Identifier') {
        return Immutable.List([syntaxTree.name])
    }

    if (syntaxTree.type === 'Literal') {
        return Immutable.List([syntaxTree.value])
    }


    let ret = Immutable.List([])

    for (let key of Object.keys(syntaxTree)) {
        const r = getSyntaxTreeLeaves(syntaxTree[key])

        if (r !== null) {
            ret = ret.concat(r)
        }
    }

    return ret
}
