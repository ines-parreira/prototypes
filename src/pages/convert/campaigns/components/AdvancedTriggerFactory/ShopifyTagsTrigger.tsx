import React, {useEffect, useMemo, useState} from 'react'

import Button from 'pages/common/components/button/Button'
import {Value} from 'pages/common/forms/SelectField/types'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import MultiSelectOptionsField from 'pages/common/forms/MultiSelectOptionsField/MultiSelectOptionsField'
import {Option} from 'pages/common/forms/MultiSelectOptionsField/types'

import {useShopifyTags} from 'models/integration/queries'
import {ShopifyTags} from 'models/integration/types'

import {useIntegrationContext} from '../../containers/IntegrationProvider'

import {AdvancedTriggerBaseProps} from '../../types/AdvancedTriggerBaseProps'

import {convertTriggerOperatorsToSelectOptions} from '../../utils/convertTriggerOperatorsToSelectOptions'
import {handleTriggerOperatorChange} from '../../utils/handleTriggerOperatorChange'
import {CampaignTriggerOperator} from '../../types/enums/CampaignTriggerOperator.enum'
import css from './style.less'

type Props = AdvancedTriggerBaseProps

export const ShopifyTagsTrigger = ({id, trigger, onUpdateTrigger}: Props) => {
    const [innerOperator, setInnerOperator] = useState<CampaignTriggerOperator>(
        trigger.operator
    )
    const [innerValue, setInnerValue] = useState<Option[]>([])

    const {shopifyIntegration} = useIntegrationContext()
    const {data} = useShopifyTags(
        shopifyIntegration?.id ?? -1,
        ShopifyTags.customers
    )

    const shopifyCustomerTags = useMemo(() => {
        return data?.map((tag) => ({label: tag, value: tag})) ?? []
    }, [data])

    const handleChangeOperator = (operator: Value) =>
        handleTriggerOperatorChange(
            operator,
            id,
            trigger,
            setInnerOperator,
            onUpdateTrigger
        )

    const handleChangeValue = (value: Option[]) => {
        setInnerValue(value)
        onUpdateTrigger(id, {
            ...trigger,
            value: value.map((v) => v.value as string).toString(),
        })
    }

    useEffect(() => {
        setInnerOperator(trigger.operator)
        if (trigger.value) {
            setInnerValue(
                (trigger.value as string)
                    .split(',')
                    .map((v) => ({value: v, label: v}))
            )
        }
    }, [trigger.operator, trigger.value])

    return (
        <>
            <div>
                <Button
                    intent="secondary"
                    role="button"
                    aria-label="Customer shopify tags"
                    className="btn-frozen"
                >
                    Customer shopify tags
                </Button>
            </div>
            <SelectField
                value={innerOperator}
                onChange={handleChangeOperator}
                options={convertTriggerOperatorsToSelectOptions(trigger.type)}
            />
            <MultiSelectOptionsField
                matchInput
                className={css.fullWidth}
                plural="customer tags"
                singular="customer tag"
                options={shopifyCustomerTags}
                selectedOptions={innerValue}
                onChange={handleChangeValue}
            />
        </>
    )
}
