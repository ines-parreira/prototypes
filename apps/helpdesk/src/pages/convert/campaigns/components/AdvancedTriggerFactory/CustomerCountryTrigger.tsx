import React, { useEffect, useState } from 'react'

import { countries } from 'config/countries'
import Button from 'pages/common/components/button/Button'
import Caption from 'pages/common/forms/Caption/Caption'
import { getCountryLabel } from 'pages/common/forms/CountryInput/utils'
import MultiSelectOptionsField from 'pages/common/forms/MultiSelectOptionsField/MultiSelectOptionsField'
import { Option } from 'pages/common/forms/MultiSelectOptionsField/types'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import { Value } from 'pages/common/forms/SelectField/types'
import { CampaignTrigger } from 'pages/convert/campaigns/types/CampaignTrigger'
import { CampaignTriggerOperator } from 'pages/convert/campaigns/types/enums/CampaignTriggerOperator.enum'
import { countryCodeValidator } from 'pages/convert/campaigns/validators/countryCodeValidator'
import { ValidationError } from 'pages/convert/campaigns/validators/validationError'

import { AdvancedTriggerBaseProps } from '../../types/AdvancedTriggerBaseProps'
import { convertTriggerOperatorsToSelectOptions } from '../../utils/convertTriggerOperatorsToSelectOptions'
import { handleTriggerOperatorChange } from '../../utils/handleTriggerOperatorChange'

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
    onTriggerValidationUpdate,
}: Props) => {
    const [innerOperator, setInnerOperator] = useState<CampaignTriggerOperator>(
        trigger.operator,
    )
    const [innerValue, setInnerValue] = useState<Option[]>([])
    const [innerError, setInnerError] = useState<string | null>(null)

    const handleChangeOperator = (operator: Value) =>
        handleTriggerOperatorChange(
            operator,
            id,
            trigger,
            setInnerOperator,
            onUpdateTrigger,
        )

    const handleChangeValue = (value: Option[]) => {
        validateTrigger({
            trigger: trigger,
            value: value,
        })

        setInnerValue(value)

        onUpdateTrigger(id, {
            ...trigger,
            value: value.map((v) => v.value as string).toString(),
        })
    }

    const validateTrigger = ({
        trigger,
        value,
    }: {
        trigger: CampaignTrigger
        value: any
    }): boolean => {
        let isValid = true

        setInnerError(null) // clear error value

        try {
            countryCodeValidator(value, trigger.operator)
        } catch (e) {
            if (e instanceof ValidationError) {
                setInnerError(e.message)
                isValid = false
            }
        }

        onTriggerValidationUpdate &&
            onTriggerValidationUpdate(trigger.id, isValid) // eslint-disable-line @typescript-eslint/no-unsafe-call

        return isValid
    }

    useEffect(() => {
        if (trigger.operator) {
            setInnerOperator(trigger.operator)
        }
        if (trigger.value) {
            setInnerValue(
                (trigger.value as string)
                    .split(',')
                    .map((v) => ({ value: v, label: getCountryLabel(v) })),
            )
        }

        validateTrigger({
            trigger: trigger,
            value: trigger.value,
        })

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [trigger.operator, trigger.value])

    return (
        <>
            <div>
                <Button
                    intent="secondary"
                    role="button"
                    aria-label="Visitor location"
                    className="btn-frozen"
                >
                    Visitor location
                </Button>
            </div>
            <SelectField
                value={innerOperator}
                onChange={handleChangeOperator}
                options={convertTriggerOperatorsToSelectOptions(trigger.type)}
            />
            <div>
                <MultiSelectOptionsField
                    matchInput
                    className={css.fullWidth}
                    plural="locations"
                    singular="location"
                    onChange={handleChangeValue}
                    options={countriesOptions}
                    selectedOptions={innerValue}
                    hasError={!!innerError}
                />
                <Caption error={innerError} />
            </div>
        </>
    )
}
