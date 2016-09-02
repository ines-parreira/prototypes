/**
 * In Order traversal the SYNTAXTREE from CURRENTPATH. Return a list
 * of possible paths to leaves.
 */
export function inOrderGetLeaves(syntaxTree, currentPath) {
    const currentNode = syntaxTree.getIn(currentPath)

    if (currentNode.get('type') === 'Identifier') {
        return List([]).push(currentPath.push('name'))
    }

    if (currentNode.get('type') === 'Literal') {
        return List([]).push(currentPath.push('value'))
    }

    if (currentNode.get('type') === 'CallExpression') {
        const pathCallee = currentPath.push('callee')
        const pathArgument0 = currentPath.push('arguments', 0)
        const pathArgument1 = currentPath.push('arguments', 1)

        const leavesCallee = inOrderGetLeaves(syntaxTree, pathCallee)
        const leavesArgument0 = inOrderGetLeaves(syntaxTree, pathArgument0)
        const leavesArgument1 = inOrderGetLeaves(syntaxTree, pathArgument1)


        return leavesArgument0.push(...leavesCallee).push(...leavesArgument1)
    }

    if (currentNode.get('type') === 'BinaryExpression' || currentNode.get('type') === 'LogicalExpression') {
        const pathOperator = currentPath.push('operator')
        const pathLeft = currentPath.push('left')
        const pathRight = currentPath.push('right')

        const leavesOperator = List([]).push(pathOperator)
        const leavesLeft = inOrderGetLeaves(syntaxTree, pathLeft)
        const leavesRight = inOrderGetLeaves(syntaxTree, pathRight)

        return leavesLeft.push(...leavesOperator).push(...leavesRight)
    }

    if (currentNode.get('type') === 'MemberExpression') {
        const pathObject = currentPath.push('object')
        const pathProperty = currentPath.push('property')

        const leavesObject = inOrderGetLeaves(syntaxTree, pathObject)
        const leavesProperty = inOrderGetLeaves(syntaxTree, pathProperty)

        return leavesObject.push(...leavesProperty)
    }
}

export function getObjectExpression(actionDict) {
    let properties = []

    for (const keyItem in actionDict) {
        if (!actionDict.hasOwnProperty(keyItem)) {
            continue
        }

        const property = {
            type: 'Property',
            key: {
                type: 'Identifier',
                name: keyItem
            },
            computed: false,
            value: {
                type: 'Literal',
                value: '',
                raw: '\'\''
            },
            kind: 'init',
            method: false,
            shorthand: false
        }

        properties.push(property)
    }

    return {
        type: 'ObjectExpression',
        properties: properties
    }
}