import React, {useEffect, useState} from 'react'

import {countries} from 'config/countries'

import Button from 'pages/common/components/button/Button'
import {Value} from 'pages/common/forms/SelectField/types'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import MultiSelectOptionsField from 'pages/common/forms/MultiSelectOptionsField/MultiSelectOptionsField'
import {Option} from 'pages/common/forms/MultiSelectOptionsField/types'
import {getCountryLabel} from 'pages/common/forms/CountryInput/utils'

import {COUNTRY_OPERATORS} from '../../constants/operators'
import {AdvancedTriggerBaseProps} from '../../types/AdvancedTriggerBaseProps'
import {
    CountryOperators,
    isCountryOperators,
} from '../../types/enums/CountryOperators.enum'

import css from './style.less'

type Props = AdvancedTriggerBaseProps

const countriesOptions: Option[] = countries.map((country) => ({
    value: country.value,
    label: getCountryLabel(country.value),
}))

export const CustomerCountryTrigger = ({
    id,
    trigger,
    onUpdateTrigger,
}: Props) => {
    const [innerOperator, setInnerOperator] = useState<CountryOperators>(
        trigger.operator as CountryOperators
    )
    const [innerValue, setInnerValue] = useState<Option[]>([])

    const handleChangeOperator = (operator: Value) => {
        if (isCountryOperators(operator.toString())) {
            setInnerOperator(operator as CountryOperators)
            onUpdateTrigger(id, {operator: operator as CountryOperators})
        }
    }

    const handleChangeValue = (value: Option[]) => {
        setInnerValue(value)
        onUpdateTrigger(id, {
            value: value.map((v) => v.value as string).toString(),
        })
    }

    useEffect(() => {
        if (trigger.operator) {
            setInnerOperator(trigger.operator as CountryOperators)
        }
        if (trigger.value) {
            setInnerValue(
                (trigger.value as string)
                    .split(',')
                    .map((v) => ({value: v, label: getCountryLabel(v)}))
            )
        }
    }, [trigger.operator, trigger.value])

    return (
        <>
            <div>
                <Button
                    intent="secondary"
                    role="button"
                    aria-label="Customer country"
                    className="btn-frozen"
                >
                    Customer country
                </Button>
            </div>
            <SelectField
                value={innerOperator}
                onChange={handleChangeOperator}
                options={COUNTRY_OPERATORS}
            />
            <MultiSelectOptionsField
                matchInput
                className={css.fullWidth}
                plural="countries"
                singular="country"
                onChange={handleChangeValue}
                options={countriesOptions}
                selectedOptions={innerValue}
            />
        </>
    )
}
