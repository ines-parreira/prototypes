import React, { useRef, useState } from 'react'

import { LegacyButton as Button } from '@gorgias/axiom'

import shopify from 'assets/img/integrations/shopify.png'
import type {
    JsonLogicOrBlock,
    JsonLogicRuleOverVariable,
    ReportIssueRulesLogic,
    SelfServiceReportIssueCase,
} from 'models/selfServiceConfiguration/types'
import {
    JsonLogicOperator,
    ReportIssueVariable,
} from 'models/selfServiceConfiguration/types'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownHeader from 'pages/common/components/dropdown/DropdownHeader'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'

import { SCENARIO_MAX_NUMBER_OF_CONDITIONS_PER_VARIABLE } from '../constants'
import ReportOrderIssueScenarioConditionOrBlock from './ReportOrderIssueScenarioConditionOrBlock'
import ReportOrderIssueScenarioConditionRule from './ReportOrderIssueScenarioConditionRule'
import { usePropagateError } from './ReportOrderIssueScenarioFormContext'

import css from './ReportOrderIssueScenarioConditions.less'

type Props = {
    value: SelfServiceReportIssueCase['conditions']
    onChange: (nextValue: SelfServiceReportIssueCase['conditions']) => void
}

const VARIABLES_OPTIONS = [
    {
        label: 'Order status',
        value: ReportIssueVariable.ORDER_STATUS,
    },
    {
        label: 'Fulfillment status',
        value: ReportIssueVariable.FULFILLMENT_STATUS,
    },
    {
        label: 'Shipment status',
        value: ReportIssueVariable.SHIPMENT_STATUS,
    },
    {
        label: 'Financial status',
        value: ReportIssueVariable.FINANCIAL_STATUS,
    },
]

const isOrBlock = (
    condition: ReportIssueRulesLogic['and'][number],
): condition is JsonLogicOrBlock => 'or' in condition
const isFinancialStatusRule = (
    condition: ReportIssueRulesLogic['and'][number],
): condition is JsonLogicRuleOverVariable<ReportIssueVariable.FINANCIAL_STATUS> =>
    !('or' in condition)

const ReportOrderIssueScenarioConditions = ({ value, onChange }: Props) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const buttonRef = useRef<HTMLButtonElement>(null)

    const conditions = value?.and ?? []
    const hasError = !conditions.length
    usePropagateError('conditions', hasError)

    const orBlock = conditions.find(isOrBlock)
    const financialStatusRule = conditions.find(isFinancialStatusRule)

    const variablesOptions = VARIABLES_OPTIONS.filter((option) => {
        switch (option.value) {
            case ReportIssueVariable.FINANCIAL_STATUS:
                return !financialStatusRule
            default:
                if (!orBlock) {
                    return true
                }

                return (
                    orBlock.or.filter((ruleOverVariable) => {
                        const rule =
                            ruleOverVariable[JsonLogicOperator.IS_ONE_OF] ??
                            ruleOverVariable[JsonLogicOperator.EQUALS]

                        return rule?.[0]?.var === option.value
                    }).length < SCENARIO_MAX_NUMBER_OF_CONDITIONS_PER_VARIABLE
                )
        }
    })

    const handleOrBlockChange = (nextValue: JsonLogicOrBlock) => {
        const index = conditions.findIndex(isOrBlock)

        if (index !== -1) {
            const nextConditions = [...conditions]

            if (nextValue.or.length) {
                nextConditions[index] = nextValue
            } else {
                nextConditions.splice(index, 1)
            }

            onChange({ and: nextConditions })
        }
    }
    const handleFinancialStatusRuleChange = (
        nextValue: JsonLogicRuleOverVariable<ReportIssueVariable.FINANCIAL_STATUS>,
    ) => {
        const index = conditions.findIndex(isFinancialStatusRule)

        if (index !== -1) {
            const nextConditions = [...conditions]

            nextConditions[index] = nextValue

            onChange({ and: nextConditions })
        }
    }
    const handleFinancialStatusRuleDelete = () => {
        const index = conditions.findIndex(isFinancialStatusRule)

        if (index !== -1) {
            const nextConditions = [...conditions]

            nextConditions.splice(index, 1)

            onChange({ and: nextConditions })
        }
    }
    const handleAddCondition = (variable: ReportIssueVariable) => {
        const nextConditions = [...conditions]

        switch (variable) {
            case ReportIssueVariable.FINANCIAL_STATUS:
                nextConditions.push({
                    [JsonLogicOperator.IS_ONE_OF]: [{ var: variable }, []],
                })
                break
            default: {
                const index = conditions.findIndex(isOrBlock)
                const newRuleOverVariable: JsonLogicRuleOverVariable = {
                    [JsonLogicOperator.IS_ONE_OF]: [{ var: variable }, []],
                }

                if (index !== -1) {
                    nextConditions[index] = {
                        or: [...orBlock!.or, newRuleOverVariable],
                    }
                } else {
                    nextConditions.push({ or: [newRuleOverVariable] })
                }
            }
        }

        onChange({ and: nextConditions })
    }

    return (
        <div className={css.container}>
            {(orBlock || financialStatusRule) && (
                <div className={css.conditionsContainer}>
                    {orBlock && (
                        <ReportOrderIssueScenarioConditionOrBlock
                            value={orBlock}
                            isElevated={Boolean(financialStatusRule)}
                            onChange={handleOrBlockChange}
                        />
                    )}
                    {financialStatusRule && (
                        <ReportOrderIssueScenarioConditionRule
                            value={financialStatusRule}
                            onChange={handleFinancialStatusRuleChange}
                            onDelete={handleFinancialStatusRuleDelete}
                            conjunction={orBlock ? 'AND' : undefined}
                        />
                    )}
                </div>
            )}
            {variablesOptions.length > 0 && (
                <>
                    <Button
                        className={css.addConditionButton}
                        ref={buttonRef}
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        intent="secondary"
                        trailingIcon="arrow_drop_down"
                    >
                        Add Condition
                    </Button>
                    <Dropdown
                        isOpen={isDropdownOpen}
                        onToggle={setIsDropdownOpen}
                        target={buttonRef}
                    >
                        <DropdownHeader
                            prefix={
                                <img
                                    src={shopify}
                                    className={css.shopifyLogo}
                                    width={14}
                                    height={14}
                                    alt="shopify logo"
                                />
                            }
                        >
                            Shopify variables
                        </DropdownHeader>
                        <DropdownBody>
                            {variablesOptions.map((option) => (
                                <DropdownItem
                                    key={option.value}
                                    option={option}
                                    onClick={handleAddCondition}
                                    shouldCloseOnSelect
                                />
                            ))}
                        </DropdownBody>
                    </Dropdown>
                </>
            )}
        </div>
    )
}

export default ReportOrderIssueScenarioConditions
