import {
    JsonLogicOperator,
    ReportIssueVariable,
    JsonLogicRuleOverVariable,
} from '../../../../../../state/self_service/types'

type ParsedJsonLogicOverVariable = {variable: ReportIssueVariable} & (
    | {
          operator: JsonLogicOperator.EQUALS
          value: null
      }
    | {
          operator: JsonLogicOperator.IS_ONE_OF
          value: string[]
      }
)
export const parseJsonLogicRule = (
    jsonLogicRule: JsonLogicRuleOverVariable
) => {
    const jsonLogicObjectKeys = Object.keys(jsonLogicRule)

    if (jsonLogicObjectKeys.length !== 1) {
        throw new Error('Wrong rule definition provided')
    }

    const operator = jsonLogicObjectKeys[0] as JsonLogicOperator
    const variable = jsonLogicRule[operator]?.[0].var
    const value = jsonLogicRule[operator]?.[1]

    return {operator, variable, value} as ParsedJsonLogicOverVariable
}
