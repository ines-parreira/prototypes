import React, {useEffect, useState} from 'react'

import Button from 'pages/common/components/button/Button'
import {Value} from 'pages/common/forms/SelectField/types'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import InputField from 'pages/common/forms/input/InputField'
import getShopifyMoneySymbol from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/shopify/shared/helpers'

import {useIntegrationContext} from 'pages/convert/campaigns/containers/IntegrationProvider'

import {convertTriggerOperatorsToSelectOptions} from '../../utils/convertTriggerOperatorsToSelectOptions'
import {AdvancedTriggerBaseProps} from '../../types/AdvancedTriggerBaseProps'
import {CampaignTriggerOperator} from '../../types/enums/CampaignTriggerOperator.enum'
import {handleTriggerOperatorChange} from '../../utils/handleTriggerOperatorChange'
import css from './style.less'

type Props = AdvancedTriggerBaseProps

export const CartValueTrigger = ({
    id,
    isAllowedToEdit = false,
    trigger,
    onUpdateTrigger,
}: Props): JSX.Element => {
    const [innerOperator, setInnerOperator] = useState<CampaignTriggerOperator>(
        trigger.operator
    )
    const [innerValue, setInnerValue] = useState<string>(
        trigger.value as string
    )

    const {shopifyIntegration} = useIntegrationContext()

    const handleChangeOperator = (operator: Value) =>
        handleTriggerOperatorChange(
            operator,
            id,
            trigger,
            setInnerOperator,
            onUpdateTrigger
        )

    const handleChangeValue = (value: string) => {
        if (!isAllowedToEdit) return

        setInnerValue(value)
    }

    const handleBlurValue = () => {
        onUpdateTrigger(id, {
            ...trigger,
            value: innerValue,
        })
    }

    const currencySymbol = getShopifyMoneySymbol(
        shopifyIntegration?.meta?.currency ?? 'USD',
        true
    )

    useEffect(() => {
        setInnerOperator(trigger.operator)
        setInnerValue(trigger.value as string)
    }, [trigger.operator, trigger.value])

    return (
        <>
            <div>
                <Button
                    role="button"
                    aria-label="Amount added to cart"
                    intent="secondary"
                    className="btn-frozen"
                >
                    Amount Added To Cart
                </Button>
            </div>
            <SelectField
                value={innerOperator}
                onChange={handleChangeOperator}
                options={convertTriggerOperatorsToSelectOptions(trigger.type)}
            />
            <div
                data-testid="cart-amount-value"
                style={{display: 'flex', flexGrow: 1}}
            >
                <InputField
                    className={css.fullWidth}
                    prefix={currencySymbol}
                    value={innerValue}
                    type="number"
                    min={0}
                    onChange={handleChangeValue}
                    onBlur={handleBlurValue}
                />
            </div>
        </>
    )
}
