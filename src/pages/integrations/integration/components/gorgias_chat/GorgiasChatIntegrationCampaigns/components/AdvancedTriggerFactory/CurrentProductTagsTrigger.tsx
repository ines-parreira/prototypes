import React, {useEffect, useState} from 'react'

import Button from 'pages/common/components/button/Button'
import {Value} from 'pages/common/forms/SelectField/types'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import InputField from 'pages/common/forms/input/InputField'

import {CURRENT_PRODUCT_TAGS_OPERATORS} from '../../constants/operators'

import {AdvancedTriggerBaseProps} from '../../types/AdvancedTriggerBaseProps'
import {
    CurrentProductTagsOperators,
    isCurrentProductTagsOperators,
} from '../../types/enums/CurrentProductTagsOperators.enum'

import css from './style.less'

type Props = AdvancedTriggerBaseProps

export const CurrentProductTagsTrigger = ({
    id,
    trigger,
    onUpdateTrigger,
}: Props): JSX.Element => {
    const [innerOperator, setInnerOperator] =
        useState<CurrentProductTagsOperators>(
            trigger.operator as CurrentProductTagsOperators
        )
    const [innerValue, setInnerValue] = useState<string>(
        trigger.value as string
    )

    const handleChangeOperator = (operator: Value) => {
        if (isCurrentProductTagsOperators(operator.toString())) {
            setInnerOperator(operator as CurrentProductTagsOperators)
            onUpdateTrigger(id, {
                operator: operator as CurrentProductTagsOperators,
            })
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
        setInnerOperator(trigger.operator as CurrentProductTagsOperators)
        setInnerValue(trigger.value as string)
    }, [trigger.operator, trigger.value])

    return (
        <>
            <div>
                <Button
                    role="button"
                    aria-label="Currently visited product"
                    intent="secondary"
                    className="btn-frozen"
                >
                    Currently visited product
                </Button>
            </div>
            <SelectField
                value={innerOperator}
                onChange={handleChangeOperator}
                options={CURRENT_PRODUCT_TAGS_OPERATORS}
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
