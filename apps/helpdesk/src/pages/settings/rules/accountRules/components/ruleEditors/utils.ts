import type { Literal, Statement } from 'estree'

import type { ActionType, Rule } from 'models/rule/types'
import type { RuleDraft } from 'state/rules/types'

export const getRuleActions = (draft: RuleDraft | Rule): ActionType[] => {
    const traverseNodes = (
        nodes: Statement[] | undefined,
        actions: ActionType[],
    ) => {
        if (!nodes) return actions
        return nodes.reduce((acc, node) => {
            if (node.type === 'ExpressionStatement') {
                const functionCallExpression = node.expression

                if (
                    functionCallExpression.type === 'CallExpression' &&
                    functionCallExpression.arguments.length
                ) {
                    const type = (
                        functionCallExpression.arguments[0] as Literal
                    )?.value as ActionType | undefined

                    if (type) {
                        acc.push(type)
                    }
                }
            } else if (node.type === 'IfStatement' && node.consequent) {
                if (node.consequent.type === 'BlockStatement') {
                    traverseNodes(node.consequent.body, acc)
                }
            }

            return acc
        }, actions)
    }

    const actions: ActionType[] = []

    if (draft && draft.code_ast) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        return traverseNodes(draft.code_ast.body as Statement[], actions)
    }

    return actions
}
