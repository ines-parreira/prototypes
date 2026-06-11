import type { Expression } from 'estree'

export function resolvePunctuators(
    type: Expression['type'],
    string: string,
): string {
    switch (type) {
        case 'Identifier':
            return `.${string}`
        case 'Literal':
            return `[${string}]`
        default:
            throw Error(`Unsupported type: ${type}`)
    }
}
