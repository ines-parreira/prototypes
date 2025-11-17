import React, { useRef, useState } from 'react'

import { LegacyButton as Button } from '@gorgias/axiom'

import shopify from 'assets/img/integrations/shopify.png'
import {
    FINANCIAL_STATUSES_OPTIONS,
    FULFILLMENT_STATUSES_OPTIONS,
    ORDER_STATUSES_OPTIONS,
    SHIPMENT_STATUSES_OPTIONS,
} from 'models/selfServiceConfiguration/constants'
import type { JsonLogicRuleOverVariable } from 'models/selfServiceConfiguration/types'
import {
    JsonLogicOperator,
    ReportIssueVariable,
} from 'models/selfServiceConfiguration/types'
import IconButton from 'pages/common/components/button/IconButton'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import SelectInputBox, {
    SelectInputBoxContext,
} from 'pages/common/forms/input/SelectInputBox'
import MultiSelectOptionsField from 'pages/common/forms/MultiSelectOptionsField/MultiSelectOptionsField'
import type { Option } from 'pages/common/forms/MultiSelectOptionsField/types'

import css from './ReportOrderIssueScenarioConditionRule.less'

type Props<T extends ReportIssueVariable = ReportIssueVariable> = {
    value: JsonLogicRuleOverVariable<T>
    onChange: (nextValue: JsonLogicRuleOverVariable<T>) => void
    onDelete: () => void
    conjunction?: 'OR' | 'AND'
}

const IS_ONE_OF_OPERATOR_OPTION = {
    label: 'is one of',
    value: JsonLogicOperator.IS_ONE_OF,
}

const FULL_OPERATOR_OPTIONS = [
    IS_ONE_OF_OPERATOR_OPTION,
    {
        label: 'is empty',
        value: JsonLogicOperator.EQUALS,
    },
]

const OPERATORS_OPTIONS_BY_VARIABLE = {
    [ReportIssueVariable.FINANCIAL_STATUS]: [IS_ONE_OF_OPERATOR_OPTION],
    [ReportIssueVariable.FULFILLMENT_STATUS]: FULL_OPERATOR_OPTIONS,
    [ReportIssueVariable.SHIPMENT_STATUS]: FULL_OPERATOR_OPTIONS,
    [ReportIssueVariable.ORDER_STATUS]: FULL_OPERATOR_OPTIONS,
}
const STATUSES_OPTIONS_BY_VARIABLE = {
    [ReportIssueVariable.FINANCIAL_STATUS]: FINANCIAL_STATUSES_OPTIONS,
    [ReportIssueVariable.FULFILLMENT_STATUS]: FULFILLMENT_STATUSES_OPTIONS,
    [ReportIssueVariable.SHIPMENT_STATUS]: SHIPMENT_STATUSES_OPTIONS,
    [ReportIssueVariable.ORDER_STATUS]: ORDER_STATUSES_OPTIONS,
}

type JsonLogicRule<T extends ReportIssueVariable> =
    JsonLogicRuleOverVariable<T>[keyof JsonLogicRuleOverVariable<T>]

const ReportOrderIssueScenarioConditionRule = <
    T extends ReportIssueVariable = ReportIssueVariable,
>({
    value,
    onChange,
    onDelete,
    conjunction,
}: Props<T>) => {
    const [isOperatorSelectOpen, setIsOperatorSelectOpen] = useState(false)
    const operatorTargetRef = useRef<HTMLDivElement>(null)
    const operatorFloatingRef = useRef<HTMLDivElement>(null)

    const rule = (value[JsonLogicOperator.IS_ONE_OF] ??
        value[JsonLogicOperator.EQUALS]) as NonNullable<JsonLogicRule<T>>
    const variable = rule[0].var

    const operatorsOptions = OPERATORS_OPTIONS_BY_VARIABLE[variable]
    const statusesOptions = STATUSES_OPTIONS_BY_VARIABLE[variable]

    const operatorValue = Object.keys(value)[0] as JsonLogicOperator
    const operatorLabel = operatorsOptions.find(
        (option) => option.value === operatorValue,
    )?.label

    const statusesSelectedOptions =
        operatorValue === JsonLogicOperator.IS_ONE_OF
            ? statusesOptions.filter((statusOption) =>
                  rule[1]!.includes(statusOption.value),
              )
            : []

    const handleStatusesChange = (nextOptions: Option[]) => {
        onChange({
            [JsonLogicOperator.IS_ONE_OF]: [
                { var: variable },
                nextOptions.map((option) => option.value as string),
            ],
        })
    }
    const handleOperatorChange = (nextOperator: JsonLogicOperator) => {
        if (nextOperator === operatorValue) {
            return
        }

        switch (nextOperator) {
            case JsonLogicOperator.EQUALS:
                onChange({
                    [JsonLogicOperator.EQUALS]: [{ var: variable }, null],
                })
                break
            case JsonLogicOperator.IS_ONE_OF:
                onChange({
                    [JsonLogicOperator.IS_ONE_OF]: [{ var: variable }, []],
                })
                break
        }
    }

    return (
        <div className={css.container}>
            {conjunction && (
                <Button className={css.conjunctionButton}>{conjunction}</Button>
            )}
            <Button intent="secondary">
                <img
                    src={shopify}
                    className={css.shopifyLogo}
                    width={20}
                    height={20}
                    alt="shopify logo"
                />
                {variable.replace('_', ' ')}
            </Button>
            {operatorsOptions.length === 1 ? (
                <span className={css.operatorLabel}>{operatorLabel}</span>
            ) : (
                <SelectInputBox
                    className={css.operatorSelectInput}
                    floating={operatorFloatingRef}
                    label={operatorLabel}
                    onToggle={setIsOperatorSelectOpen}
                    ref={operatorTargetRef}
                >
                    <SelectInputBoxContext.Consumer>
                        {(context) => (
                            <Dropdown
                                isOpen={isOperatorSelectOpen}
                                onToggle={() => context!.onBlur()}
                                ref={operatorFloatingRef}
                                target={operatorTargetRef}
                                value={operatorValue}
                            >
                                <DropdownBody>
                                    {operatorsOptions.map((option) => (
                                        <DropdownItem
                                            key={option.value}
                                            option={option}
                                            onClick={handleOperatorChange}
                                            shouldCloseOnSelect
                                        />
                                    ))}
                                </DropdownBody>
                            </Dropdown>
                        )}
                    </SelectInputBoxContext.Consumer>
                </SelectInputBox>
            )}
            {operatorValue === JsonLogicOperator.IS_ONE_OF && (
                <MultiSelectOptionsField
                    plural="statuses"
                    singular="status"
                    onChange={handleStatusesChange}
                    options={statusesOptions}
                    selectedOptions={statusesSelectedOptions}
                />
            )}
            <IconButton
                className={css.clearIconButton}
                fillStyle="ghost"
                intent="destructive"
                size="small"
                onClick={onDelete}
            >
                clear
            </IconButton>
        </div>
    )
}

export default ReportOrderIssueScenarioConditionRule
