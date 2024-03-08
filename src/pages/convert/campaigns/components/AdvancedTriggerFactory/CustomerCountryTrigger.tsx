import React, {useEffect, useState} from 'react'

import {countries} from 'config/countries'

import Button from 'pages/common/components/button/Button'
import {Value} from 'pages/common/forms/SelectField/types'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import MultiSelectOptionsField from 'pages/common/forms/MultiSelectOptionsField/MultiSelectOptionsField'
import {Option} from 'pages/common/forms/MultiSelectOptionsField/types'
import {getCountryLabel} from 'pages/common/forms/CountryInput/utils'

import {AdvancedTriggerBaseProps} from '../../types/AdvancedTriggerBaseProps'

import {convertTriggerOperatorsToSelectOptions} from '../../utils/convertTriggerOperatorsToSelectOptions'
import {CampaignTriggerOperator} from '../../types/enums/CampaignTriggerOperator.enum'
import {handleTriggerOperatorChange} from '../../utils/handleTriggerOperatorChange'
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
    const [innerOperator, setInnerOperator] = useState<CampaignTriggerOperator>(
        trigger.operator
    )
    const [innerValue, setInnerValue] = useState<Option[]>([])

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
        if (trigger.operator) {
            setInnerOperator(trigger.operator)
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
                options={convertTriggerOperatorsToSelectOptions(trigger.type)}
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
