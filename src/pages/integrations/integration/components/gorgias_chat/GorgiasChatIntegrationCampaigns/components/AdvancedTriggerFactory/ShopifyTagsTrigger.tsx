import React, {useEffect, useMemo, useState} from 'react'

import Button from 'pages/common/components/button/Button'
import {Value} from 'pages/common/forms/SelectField/types'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import MultiSelectOptionsField from 'pages/common/forms/MultiSelectOptionsField/MultiSelectOptionsField'
import {Option} from 'pages/common/forms/MultiSelectOptionsField/types'

import {useShopifyTags} from 'models/integration/queries'
import {ShopifyTags} from 'models/integration/types'

import {SHOPIFY_TAGS_OPERATORS} from '../../constants/operators'

import {useIntegrationContext} from '../../containers/IntegrationProvider'

import {AdvancedTriggerBaseProps} from '../../types/AdvancedTriggerBaseProps'
import {
    ShopifyTagsOperators,
    isShopifyTagsOperators,
} from '../../types/enums/ShopifyTagsOperators.enum'

import css from './style.less'

type Props = AdvancedTriggerBaseProps

export const ShopifyTagsTrigger = ({id, trigger, onUpdateTrigger}: Props) => {
    const [innerOperator, setInnerOperator] = useState<ShopifyTagsOperators>(
        trigger.operator as ShopifyTagsOperators
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

    const handleChangeOperator = (operator: Value) => {
        if (isShopifyTagsOperators(operator.toString())) {
            setInnerOperator(operator as ShopifyTagsOperators)
            onUpdateTrigger(id, {operator: operator as ShopifyTagsOperators})
        }
    }

    const handleChangeValue = (value: Option[]) => {
        setInnerValue(value)
        onUpdateTrigger(id, {
            value: value.map((v) => v.value as string).toString(),
        })
    }

    useEffect(() => {
        setInnerOperator(trigger.operator as ShopifyTagsOperators)
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
                options={SHOPIFY_TAGS_OPERATORS}
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
