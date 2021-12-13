import React, {ReactElement, useMemo} from 'react'
import {Input} from 'reactstrap'
import classNames from 'classnames'

import shopify from 'assets/img/integrations/shopify.png'

import MultiSelectOptionsField from '../../../../../common/forms/MultiSelectOptionsField/MultiSelectOptionsField'
import {Option} from '../../../../../common/forms/MultiSelectOptionsField/types'
import {
    JsonLogicOperator,
    JsonLogicRuleOverVariable,
    ReportIssueVariable,
} from '../../../../../../models/selfServiceConfiguration/types'
import {
    FINANCIAL_STATUSES_OPTIONS,
    FULFILLEMENT_STATUSES_OPTIONS,
    ORDER_STATUSES_OPTIONS,
    SHIPMENT_STATUSES_OPTIONS,
} from '../constants'

import {parseJsonLogicRule} from './utils'
import css from './ConditionRow.less'

type ConditionRowProps = {
    jsonLogicRule: JsonLogicRuleOverVariable
    connectingOperator?: string
    onChange: (newJsonLogicRule: JsonLogicRuleOverVariable) => void
    onDeleteClick: () => void
}

const getOperatorHumanReadableName = (
    operator: JsonLogicOperator,
    value: string[] | null
) => {
    if (operator === JsonLogicOperator.EQUALS && value === null) {
        return 'is empty'
    }

    if (operator === JsonLogicOperator.IS_ONE_OF) {
        return 'is one of'
    }
}

const OptionsByVariableMap: Record<ReportIssueVariable, Option[]> = {
    [ReportIssueVariable.FINANCIAL_STATUS]: FINANCIAL_STATUSES_OPTIONS,
    [ReportIssueVariable.FULFILLMENT_STATUS]: FULFILLEMENT_STATUSES_OPTIONS,
    [ReportIssueVariable.SHIPMENT_STATUS]: SHIPMENT_STATUSES_OPTIONS,
    [ReportIssueVariable.ORDER_STATUS]: ORDER_STATUSES_OPTIONS,
} as const

const NameByVariableMap: Record<ReportIssueVariable, string> = {
    [ReportIssueVariable.FINANCIAL_STATUS]: 'Financial status',
    [ReportIssueVariable.FULFILLMENT_STATUS]: 'Fulfillment status',
    [ReportIssueVariable.SHIPMENT_STATUS]: 'Shipment status',
    [ReportIssueVariable.ORDER_STATUS]: 'Order status',
} as const

const ConditionRow = ({
    jsonLogicRule,
    onChange,
    onDeleteClick,
    connectingOperator,
}: ConditionRowProps): ReactElement => {
    const {operator, variable, value} = parseJsonLogicRule(jsonLogicRule)

    const handleIsEmptyClick = () => {
        onChange({
            '===': [{var: variable}, null],
        })
    }

    const handleIsOneOfClick = () => {
        const valueToWrite = Array.isArray(value) ? value : []
        onChange({
            in: [{var: variable}, valueToWrite],
        })
    }

    const handleDeleteClick = () => {
        onDeleteClick()
    }

    const handleValuesChange = (selectedOptions: Option[]) => {
        onChange({
            in: [
                {var: variable},
                selectedOptions.map((option) => option.value as string),
            ],
        })
    }

    const selectedOptions = useMemo(() => {
        if (!Array.isArray(value)) {
            return []
        }

        const options: Option[] = []
        for (const element of value) {
            const matchingOption = OptionsByVariableMap[variable].find(
                (option) => option.value === element
            )

            if (matchingOption) {
                options.push(matchingOption)
            }
        }

        return options
    }, [value, variable])

    return (
        <div className={css.wrapper}>
            {connectingOperator && (
                <div className={css.connectingOperator}>
                    {connectingOperator}
                </div>
            )}

            <div className={css.variable}>
                <img
                    src={shopify}
                    className={css.shopifyLogo}
                    alt="shopify logo"
                />
                {NameByVariableMap[variable]}
            </div>

            {variable !== ReportIssueVariable.FINANCIAL_STATUS ? (
                <Input
                    className={classNames(css.operatorDropdown)}
                    style={{width: 'auto'}}
                    type="select"
                    value={operator}
                    bsSize="sm"
                    onChange={(e) => {
                        const operator = e.target.value

                        if (operator === JsonLogicOperator.EQUALS) {
                            handleIsEmptyClick()
                        }
                        if (operator === JsonLogicOperator.IS_ONE_OF) {
                            handleIsOneOfClick()
                        }
                    }}
                >
                    <option value={JsonLogicOperator.IS_ONE_OF}>
                        {getOperatorHumanReadableName(
                            JsonLogicOperator.IS_ONE_OF,
                            []
                        )}
                    </option>

                    <option value={JsonLogicOperator.EQUALS}>
                        {getOperatorHumanReadableName(
                            JsonLogicOperator.EQUALS,
                            null
                        )}
                    </option>
                </Input>
            ) : (
                <span className={css.operatorText}>is one of</span>
            )}

            {operator === JsonLogicOperator.IS_ONE_OF &&
                Array.isArray(value) && (
                    <MultiSelectOptionsField
                        plural="statuses"
                        singular="status"
                        onChange={handleValuesChange}
                        options={OptionsByVariableMap[variable]}
                        selectedOptions={selectedOptions}
                    />
                )}

            <button
                type="button"
                className={css.deleteButton}
                onClick={handleDeleteClick}
            >
                <span className="icon material-icons">clear</span>
            </button>
        </div>
    )
}

export default ConditionRow
