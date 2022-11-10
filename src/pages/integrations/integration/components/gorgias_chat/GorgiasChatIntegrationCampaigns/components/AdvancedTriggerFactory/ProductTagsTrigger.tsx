import React, {useEffect, useState} from 'react'

import Button from 'pages/common/components/button/Button'
import {Value} from 'pages/common/forms/SelectField/types'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import InputField from 'pages/common/forms/input/InputField'

import {PRODUCT_TAGS_OPERATORS} from '../../constants/operators'

import {AdvancedTriggerBaseProps} from '../../types/AdvancedTriggerBaseProps'
import {
    isProductTagsOperators,
    ProductTagsOperators,
} from '../../types/enums/ProductTagsOperators.enum'

import css from './style.less'

type Props = AdvancedTriggerBaseProps

export const ProductTagsTrigger = ({
    id,
    trigger,
    onUpdateTrigger,
}: Props): JSX.Element => {
    const [innerOperator, setInnerOperator] = useState<ProductTagsOperators>(
        trigger.operator as ProductTagsOperators
    )
    const [innerValue, setInnerValue] = useState<string>(
        trigger.value as string
    )

    const handleChangeOperator = (operator: Value) => {
        if (isProductTagsOperators(operator.toString())) {
            setInnerOperator(operator as ProductTagsOperators)
            onUpdateTrigger(id, {operator: operator as ProductTagsOperators})
        }
    }

    const handleChangeValue = (value: string) => {
        setInnerValue(value)
    }

    const handleBlurValue = () => {
        onUpdateTrigger(id, {
            value: innerValue,
        })
    }

    useEffect(() => {
        setInnerOperator(trigger.operator as ProductTagsOperators)
        setInnerValue(trigger.value as string)
    }, [trigger.operator, trigger.value])

    return (
        <>
            <div>
                <Button
                    role="button"
                    aria-label="Cart includes"
                    intent="secondary"
                    className="btn-frozen"
                >
                    Product In Cart
                </Button>
            </div>
            <SelectField
                value={innerOperator}
                onChange={handleChangeOperator}
                options={PRODUCT_TAGS_OPERATORS}
            />
            <div
                data-testid="product-tags-value"
                style={{display: 'flex', flexGrow: 1}}
            >
                <InputField
                    className={css.fullWidth}
                    suffix="tags"
                    caption="Separate tags with commas (Ex: backpack, shoes)"
                    value={innerValue}
                    onChange={handleChangeValue}
                    onBlur={handleBlurValue}
                />
            </div>
        </>
    )
}
