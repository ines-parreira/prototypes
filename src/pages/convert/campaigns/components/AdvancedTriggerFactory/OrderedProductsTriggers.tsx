import React, {useEffect, useMemo, useState} from 'react'
import _debounce from 'lodash/debounce'

import {useProductsFromShopifyIntegration} from 'models/integration/queries'

import Button from 'pages/common/components/button/Button'
import {Value} from 'pages/common/forms/SelectField/types'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import MultiSelectOptionsField from 'pages/common/forms/MultiSelectOptionsField/MultiSelectOptionsField'
import {Option} from 'pages/common/forms/MultiSelectOptionsField/types'

import {useIntegrationContext} from '../../containers/IntegrationProvider'

import {AdvancedTriggerBaseProps} from '../../types/AdvancedTriggerBaseProps'
import {
    PurchasedProductValue,
    isPurchasedProductValue,
} from '../../types/CampaignValue'

import {convertTriggerOperatorsToSelectOptions} from '../../utils/convertTriggerOperatorsToSelectOptions'
import {handleTriggerOperatorChange} from '../../utils/handleTriggerOperatorChange'
import {CampaignTriggerOperator} from '../../types/enums/CampaignTriggerOperator.enum'
import css from './style.less'

type Props = AdvancedTriggerBaseProps

export const OrderedProductsTriggers = ({
    id,
    trigger,
    onUpdateTrigger,
}: Props) => {
    const [innerOperator, setInnerOperator] = useState<CampaignTriggerOperator>(
        trigger.operator
    )
    const [innerValue, setInnerValue] = useState<Option[]>([])
    const [innerFilter, setInnerFilter] = useState<string>()
    const {shopifyIntegration} = useIntegrationContext()

    const x = useProductsFromShopifyIntegration(
        shopifyIntegration?.id ?? -1,
        innerFilter
    )

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
            value: value.map((v) => ({
                productId: v.value,
                productTitle: v.label,
            })),
        })
    }

    const handleChangeSelectFilter = _debounce((nextFilter: string) => {
        setInnerFilter(nextFilter)
    }, 200)

    const products = useMemo(() => {
        return x.data
            ?.filter((product) => {
                return product.item_type === 'product'
            })
            ?.map((product) => ({
                value: product.data.id,
                label: product.data.title,
            }))
    }, [x.data])

    useEffect(() => {
        if (trigger.operator) {
            setInnerOperator(trigger.operator)
        }

        const isValidValue =
            Array.isArray(trigger.value) &&
            trigger.value.every((item) => isPurchasedProductValue(item))

        if (isValidValue) {
            const transformedValue = (
                trigger.value as PurchasedProductValue[]
            ).map((item) => ({
                value: item.productId,
                label: item.productTitle,
            }))

            setInnerValue(transformedValue)
        }
    }, [trigger.operator, trigger.value])

    return (
        <>
            <div>
                <Button
                    intent="secondary"
                    role="button"
                    aria-label="products purchased"
                    className="btn-frozen"
                >
                    products purchased
                </Button>
            </div>
            <SelectField
                value={innerOperator}
                onChange={handleChangeOperator}
                options={convertTriggerOperatorsToSelectOptions(trigger.type)}
            />
            <MultiSelectOptionsField
                className={css.fullWidth}
                plural="products"
                singular="product"
                options={products}
                selectedOptions={innerValue}
                onChange={handleChangeValue}
                onInputChange={handleChangeSelectFilter}
            />
        </>
    )
}
