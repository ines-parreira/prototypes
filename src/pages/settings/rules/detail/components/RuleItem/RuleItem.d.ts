import {Map, List} from 'immutable'

import {modifyCodeAST} from '../../../../../../state/rules/actions'
import {RuleOperation} from '../../../../../../state/rules/types'

//$TsFixMe remove once RuleItem is migrated
export type RuleItemActions = {
    modifyCodeAST: (
        path: List<any>,
        value: Maybe<string | Record<string, unknown>>,
        operation: RuleOperation
    ) => ReturnType<ReturnType<typeof modifyCodeAST>>
    getCondition: (path: List<any>) => Map<any, any>
}
