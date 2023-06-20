import React, {useEffect, useMemo, useState} from 'react'
import _debounce from 'lodash/debounce'

import {useProductsFromShopifyIntegration} from 'models/integration/queries'

import Button from 'pages/common/components/button/Button'
import {Value} from 'pages/common/forms/SelectField/types'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import MultiSelectOptionsField from 'pages/common/forms/MultiSelectOptionsField/MultiSelectOptionsField'
import {Option} from 'pages/common/forms/MultiSelectOptionsField/types'

import {ORDERED_PRODUCTS_OPERATORS} from '../../constants/operators'

import {useIntegrationContext} from '../../containers/IntegrationProvider'

import {AdvancedTriggerBaseProps} from '../../types/AdvancedTriggerBaseProps'
import {
    OrderedProductsOperators,
    isOrderedProductsOperators,
} from '../../types/enums/OrderedProductsOperators.enum'

import css from './style.less'

type Props = AdvancedTriggerBaseProps

export const OrderedProductsTriggers = ({
    id,
    trigger,
    onUpdateTrigger,
}: Props) => {
    const [innerOperator, setInnerOperator] =
        useState<OrderedProductsOperators>(
            trigger.operator as OrderedProductsOperators
        )
    const [innerValue, setInnerValue] = useState<Option[]>([])
    const [innerFilter, setInnerFilter] = useState<string>()
    const {shopifyIntegration} = useIntegrationContext()

    const x = useProductsFromShopifyIntegration(
        shopifyIntegration?.id ?? -1,
        innerFilter
    )

    const handleChangeOperator = (operator: Value) => {
        if (isOrderedProductsOperators(operator.toString())) {
            setInnerOperator(operator as OrderedProductsOperators)
            onUpdateTrigger(id, {
                operator: operator as OrderedProductsOperators,
            })
        }
    }

    const handleChangeValue = (value: Option[]) => {
        setInnerValue(value)
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
            setInnerOperator(trigger.operator as OrderedProductsOperators)
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
                options={ORDERED_PRODUCTS_OPERATORS}
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
