import type esprima from 'esprima'
import type { List, Map } from 'immutable'

import type { RuleOperation } from 'state/rules/types'

export type CodeASTType = esprima.Program

export type RuleItemActions = {
    modifyCodeAST: (
        path: List<any>,
        node: string | Record<string, unknown> | Map<any, any> | null,
        operation: RuleOperation,
        code_ast?: esprima.Program,
        schemaDefinitionKey?: string,
    ) => CodeASTType
    getCondition: (path: List<any>) => Map<any, any>
}
