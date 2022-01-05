import {List, Map} from 'immutable'
import esprima from 'esprima'

import {RuleOperation} from '../../../state/rules/types'

export type CodeASTType = ReturnType<typeof esprima.parse>

export type RuleItemActions = {
    modifyCodeAST: (
        path: List<any>,
        node: Maybe<string | Record<string, unknown>>,
        operation: RuleOperation,
        code_ast?: ReturnType<typeof esprima.parse>
    ) => CodeASTType
    getCondition: (path: List<any>) => Map<any, any>
}
