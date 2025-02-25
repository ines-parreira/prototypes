import { Expression } from 'estree'

import resolvePunctuators from './resolvePunctuators'

export default function resolveObjectPath(node: Expression): string {
    switch (node.type) {
        case 'MemberExpression':
            return `${resolveObjectPath(
                node.object as Expression,
            )}${resolvePunctuators(
                node.property.type,
                resolveObjectPath(node.property),
            )}`
        case 'Identifier':
            return node.name
        case 'Literal':
            return `${node.value}`
        default:
            throw Error(`Unknown type: ${node.type}`)
    }
}
