import { Box, Button, Icon, ListItem, SelectField, Text } from '@gorgias/axiom'

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
import { MultiSelectOptionsField } from 'pages/common/forms/MultiSelectOptionsField/MultiSelectOptionsField'
import type { Option } from 'pages/common/forms/MultiSelectOptionsField/types'

type OperatorOption = {
    label: string
    value: JsonLogicOperator
}

type Props<T extends ReportIssueVariable = ReportIssueVariable> = {
    value: JsonLogicRuleOverVariable<T>
    onChange: (nextValue: JsonLogicRuleOverVariable<T>) => void
    onDelete: () => void
    conjunction?: 'OR' | 'AND'
}

const IS_ONE_OF_OPERATOR_OPTION: OperatorOption = {
    label: 'is one of',
    value: JsonLogicOperator.IS_ONE_OF,
}

const FULL_OPERATOR_OPTIONS: OperatorOption[] = [
    IS_ONE_OF_OPERATOR_OPTION,
    { label: 'is empty', value: JsonLogicOperator.EQUALS },
]

const OPERATORS_OPTIONS_BY_VARIABLE: Record<
    ReportIssueVariable,
    OperatorOption[]
> = {
    [ReportIssueVariable.FINANCIAL_STATUS]: [IS_ONE_OF_OPERATOR_OPTION],
    [ReportIssueVariable.FULFILLMENT_STATUS]: FULL_OPERATOR_OPTIONS,
    [ReportIssueVariable.SHIPMENT_STATUS]: FULL_OPERATOR_OPTIONS,
    [ReportIssueVariable.ORDER_STATUS]: FULL_OPERATOR_OPTIONS,
}

const STATUSES_OPTIONS_BY_VARIABLE: Record<ReportIssueVariable, Option[]> = {
    [ReportIssueVariable.FINANCIAL_STATUS]: FINANCIAL_STATUSES_OPTIONS,
    [ReportIssueVariable.FULFILLMENT_STATUS]: FULFILLMENT_STATUSES_OPTIONS,
    [ReportIssueVariable.SHIPMENT_STATUS]: SHIPMENT_STATUSES_OPTIONS,
    [ReportIssueVariable.ORDER_STATUS]: ORDER_STATUSES_OPTIONS,
}

const VARIABLE_LABELS: Record<ReportIssueVariable, string> = {
    [ReportIssueVariable.ORDER_STATUS]: 'order status',
    [ReportIssueVariable.FULFILLMENT_STATUS]: 'fulfillment status',
    [ReportIssueVariable.SHIPMENT_STATUS]: 'shipment status',
    [ReportIssueVariable.FINANCIAL_STATUS]: 'financial status',
}

export const ScenarioConditionRule = <
    T extends ReportIssueVariable = ReportIssueVariable,
>({
    value,
    onChange,
    onDelete,
    conjunction,
}: Props<T>) => {
    const rule = (value[JsonLogicOperator.IS_ONE_OF] ??
        value[JsonLogicOperator.EQUALS]) as NonNullable<
        JsonLogicRuleOverVariable<T>[keyof JsonLogicRuleOverVariable<T>]
    >
    const variable = rule[0].var
    const operatorValue = Object.keys(value)[0] as JsonLogicOperator
    const operatorsOptions = OPERATORS_OPTIONS_BY_VARIABLE[variable]
    const statusesOptions = STATUSES_OPTIONS_BY_VARIABLE[variable]
    const selectedOperatorOption =
        operatorsOptions.find((opt) => opt.value === operatorValue) ?? undefined
    const statusesSelectedOptions =
        operatorValue === JsonLogicOperator.IS_ONE_OF
            ? statusesOptions.filter((statusOption) =>
                  (rule[1] as string[] | null)?.includes(statusOption.value),
              )
            : []

    const handleStatusesChange = (nextOptions: Option[]) => {
        onChange({
            [JsonLogicOperator.IS_ONE_OF]: [
                { var: variable },
                nextOptions.map((option) => option.value as string),
            ],
        } as JsonLogicRuleOverVariable<T>)
    }

    const handleOperatorChange = (option: OperatorOption | null) => {
        if (!option || option.value === operatorValue) return
        switch (option.value) {
            case JsonLogicOperator.EQUALS:
                onChange({
                    [JsonLogicOperator.EQUALS]: [{ var: variable }, null],
                } as JsonLogicRuleOverVariable<T>)
                break
            case JsonLogicOperator.IS_ONE_OF:
                onChange({
                    [JsonLogicOperator.IS_ONE_OF]: [{ var: variable }, []],
                } as JsonLogicRuleOverVariable<T>)
                break
        }
    }

    return (
        <Box alignItems="center" gap="xs" flexWrap="wrap">
            {conjunction && (
                <Text size="sm" variant="medium">
                    {conjunction}
                </Text>
            )}
            <Button variant="secondary" size="sm">
                <Box alignItems="center" gap="xxxs">
                    <img
                        src={shopify}
                        width={16}
                        height={16}
                        alt="Shopify logo"
                    />
                    <span>{VARIABLE_LABELS[variable]}</span>
                </Box>
            </Button>
            {operatorsOptions.length === 1 ? (
                <Text size="sm">{selectedOperatorOption?.label}</Text>
            ) : (
                <SelectField<OperatorOption>
                    items={operatorsOptions}
                    value={selectedOperatorOption}
                    onChange={handleOperatorChange}
                    keyName="value"
                    aria-label={`Operator for ${variable}`}
                >
                    {(option: OperatorOption) => (
                        <ListItem id={option.value} label={option.label} />
                    )}
                </SelectField>
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
            <Button
                variant="tertiary"
                size="sm"
                aria-label="Remove condition"
                onClick={onDelete}
            >
                <Icon name="close" size="sm" />
            </Button>
        </Box>
    )
}
