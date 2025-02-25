import esprima from 'esprima'
import { List, Map } from 'immutable'

import { RuleOperation } from 'state/rules/types'

export type CodeASTType = esprima.Program

export type RuleItemActions = {
    modifyCodeAST: (
        path: List<any>,
        node: Maybe<string | Record<string, unknown>>,
        operation: RuleOperation,
        code_ast?: esprima.Program,
    ) => CodeASTType
    getCondition: (path: List<any>) => Map<any, any>
}
