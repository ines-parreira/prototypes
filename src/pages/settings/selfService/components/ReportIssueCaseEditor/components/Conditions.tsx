import React, {useMemo} from 'react'
import produce from 'immer'

import {
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    UncontrolledDropdown,
} from 'reactstrap'

import shopify from '../../../../../../../img/integrations/shopify.png'

import {
    ReportIssueVariable,
    JsonLogicRuleOverVariable,
    JsonLogicOrBlock,
    ReportIssueRulesLogic,
} from '../../../../../../models/selfServiceConfiguration/types'

import {parseJsonLogicRule} from './utils'

import ConditionRow from './ConditionRow'

import css from './Conditions.less'

interface ConditionsProps {
    logicExpression: ReportIssueRulesLogic
    onChange: (logicExpression: ReportIssueRulesLogic) => void
}
const MAX_NUMBER_OF_CONDITIONS_PER_VARIABLE = 2

const isOrBlock = (rule: any): rule is JsonLogicOrBlock => {
    return 'or' in rule
}
const findOrBlock = (logicExpression: ReportIssueRulesLogic) => {
    return logicExpression.and.find(isOrBlock)
}
const findOrBlockIndex = (logicExpression: ReportIssueRulesLogic) => {
    return logicExpression.and.findIndex(isOrBlock)
}

const isFinancialStatusRule = (
    rule: any
): rule is JsonLogicRuleOverVariable<ReportIssueVariable.FINANCIAL_STATUS> => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return rule?.in?.[0]?.var === ReportIssueVariable.FINANCIAL_STATUS
}
const findFinancialStatusRule = (logicExpression: ReportIssueRulesLogic) => {
    return logicExpression.and.find(isFinancialStatusRule)
}
const findFinancialStatusRuleIndex = (
    logicExpression: ReportIssueRulesLogic
) => {
    return logicExpression.and.findIndex(isFinancialStatusRule)
}
const getShouldShowConditionButton = (
    variableToCheck: ReportIssueVariable,
    orConditions: JsonLogicRuleOverVariable[] | undefined
): boolean => {
    if (!orConditions) {
        return true
    }

    const foundConditions = orConditions.filter((condition) => {
        const {variable} = parseJsonLogicRule(condition)

        return variable === variableToCheck
    })

    return foundConditions.length < MAX_NUMBER_OF_CONDITIONS_PER_VARIABLE
}

const Conditions = ({logicExpression, onChange}: ConditionsProps) => {
    const handleOrGroupConditionChange = (
        index: number
    ): React.ComponentProps<typeof ConditionRow>['onChange'] => (
        jsonLogicRule
    ) => {
        const newLogicExpression = produce(
            logicExpression,
            (draftLogicExpression: any) => {
                const conditions = findOrBlock(draftLogicExpression)?.or

                if (conditions) {
                    conditions[index] = jsonLogicRule
                }
            }
        )

        onChange(newLogicExpression)
    }

    const handleOrGroupConditionDelete = (index: number) => () => {
        const newLogicExpression = produce(
            logicExpression,
            (draftLogicExpression) => {
                const conditions = findOrBlock(draftLogicExpression)?.or

                if (conditions) {
                    conditions.splice(index, 1)

                    if (!conditions.length) {
                        const orBlockIndex = findOrBlockIndex(
                            draftLogicExpression
                        )
                        draftLogicExpression.and.splice(orBlockIndex, 1)
                    }
                }
            }
        )

        onChange(newLogicExpression)
    }

    const handleFinancialStatusChange: React.ComponentProps<
        typeof ConditionRow
    >['onChange'] = (jsonLogicRule) => {
        const newLogicExpression = produce(
            logicExpression,
            (draftLogicExpression) => {
                const financialStatusRuleIndex = findFinancialStatusRuleIndex(
                    draftLogicExpression
                )

                if (financialStatusRuleIndex !== -1) {
                    draftLogicExpression.and[
                        financialStatusRuleIndex
                    ] = jsonLogicRule as JsonLogicRuleOverVariable<
                        ReportIssueVariable.FINANCIAL_STATUS
                    >
                }
            }
        )

        onChange(newLogicExpression)
    }

    const handleFinancialStatusDelete = () => {
        const newLogicExpression = produce(
            logicExpression,
            (draftLogicExpression) => {
                const financialStatusRuleIndex = findFinancialStatusRuleIndex(
                    draftLogicExpression
                )

                if (financialStatusRuleIndex !== -1) {
                    draftLogicExpression.and.splice(financialStatusRuleIndex, 1)
                }
            }
        )

        onChange(newLogicExpression)
    }

    const handleStatusAddClick = (variable: ReportIssueVariable) => () => {
        const newLogicExpression = produce(
            logicExpression,
            (draftLogicExpression) => {
                if (
                    [
                        ReportIssueVariable.FULFILLMENT_STATUS,
                        ReportIssueVariable.SHIPMENT_STATUS,
                        ReportIssueVariable.ORDER_STATUS,
                    ].includes(variable)
                ) {
                    let orBlock = findOrBlock(draftLogicExpression)
                    if (!orBlock) {
                        orBlock = {
                            or: [],
                        }
                        draftLogicExpression.and.push(orBlock)
                    }

                    const conditions = orBlock.or
                    conditions.push({
                        in: [{var: variable}, []],
                    })
                }

                if (variable === ReportIssueVariable.FINANCIAL_STATUS) {
                    draftLogicExpression.and.push({
                        in: [{var: variable}, []],
                    })
                }
            }
        )

        onChange(newLogicExpression)
    }

    const orConditions = useMemo(() => {
        return findOrBlock(logicExpression)?.or
    }, [logicExpression])
    const financialStatusCondition = useMemo(() => {
        return findFinancialStatusRule(logicExpression)
    }, [logicExpression])

    const shouldShowShipmentStatusAddButton = useMemo(() => {
        return getShouldShowConditionButton(
            ReportIssueVariable.SHIPMENT_STATUS,
            orConditions
        )
    }, [orConditions])
    const shouldShowFulfillmentStatusAddButton = useMemo(() => {
        return getShouldShowConditionButton(
            ReportIssueVariable.FULFILLMENT_STATUS,
            orConditions
        )
    }, [orConditions])
    const shouldShowAddOrderStatusButton = useMemo(() => {
        return getShouldShowConditionButton(
            ReportIssueVariable.ORDER_STATUS,
            orConditions
        )
    }, [orConditions])
    const shouldShowFinancialStatusAddButton = !financialStatusCondition
    const shouldShowAddCondtionDropdown =
        shouldShowFinancialStatusAddButton ||
        shouldShowFulfillmentStatusAddButton ||
        shouldShowShipmentStatusAddButton

    return (
        <>
            {orConditions && orConditions.length > 0 && (
                <div
                    className={financialStatusCondition ? css.group : undefined}
                >
                    {orConditions.map(
                        (
                            condition: JsonLogicRuleOverVariable,
                            index: number
                        ) => {
                            return (
                                <ConditionRow
                                    key={index}
                                    jsonLogicRule={condition}
                                    onDeleteClick={handleOrGroupConditionDelete(
                                        index
                                    )}
                                    onChange={handleOrGroupConditionChange(
                                        index
                                    )}
                                    connectingOperator={
                                        index > 0 ? 'OR' : undefined
                                    }
                                />
                            )
                        }
                    )}
                </div>
            )}

            {financialStatusCondition && (
                <ConditionRow
                    jsonLogicRule={financialStatusCondition}
                    connectingOperator={
                        orConditions && orConditions.length > 0
                            ? 'AND'
                            : undefined
                    }
                    onDeleteClick={handleFinancialStatusDelete}
                    onChange={handleFinancialStatusChange}
                />
            )}

            {shouldShowAddCondtionDropdown && (
                <UncontrolledDropdown className={css.addConditionButton}>
                    <DropdownToggle caret>Add condition</DropdownToggle>

                    <DropdownMenu>
                        <DropdownItem
                            text
                            className={css.addConditionMenuHeader}
                        >
                            <img src={shopify} alt="shopify logo" />
                            Shopify variables
                        </DropdownItem>
                        {shouldShowAddOrderStatusButton && (
                            <DropdownItem
                                onClick={handleStatusAddClick(
                                    ReportIssueVariable.ORDER_STATUS
                                )}
                            >
                                Order status
                            </DropdownItem>
                        )}

                        {shouldShowFulfillmentStatusAddButton && (
                            <DropdownItem
                                onClick={handleStatusAddClick(
                                    ReportIssueVariable.FULFILLMENT_STATUS
                                )}
                            >
                                Fulfillment status
                            </DropdownItem>
                        )}
                        {shouldShowShipmentStatusAddButton && (
                            <DropdownItem
                                onClick={handleStatusAddClick(
                                    ReportIssueVariable.SHIPMENT_STATUS
                                )}
                            >
                                Shipment status
                            </DropdownItem>
                        )}
                        {shouldShowFinancialStatusAddButton && (
                            <DropdownItem
                                onClick={handleStatusAddClick(
                                    ReportIssueVariable.FINANCIAL_STATUS
                                )}
                            >
                                Financial status
                            </DropdownItem>
                        )}
                    </DropdownMenu>
                </UncontrolledDropdown>
            )}
        </>
    )
}

export default Conditions
