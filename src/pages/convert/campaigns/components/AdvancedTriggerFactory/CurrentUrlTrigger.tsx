import React, {useEffect, useState} from 'react'

import Button from 'pages/common/components/button/Button'
import {Value} from 'pages/common/forms/SelectField/types'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import InputField from 'pages/common/forms/input/InputField'

import {AdvancedTriggerBaseProps} from 'pages/convert/campaigns/types/AdvancedTriggerBaseProps'
import {ValidationError} from 'pages/convert/campaigns/validators/validationError'
import {validateCurrentUrl} from 'pages/convert/campaigns/validators/currentUrlValidator'
import {convertTriggerOperatorsToSelectOptions} from 'pages/convert/campaigns/utils/convertTriggerOperatorsToSelectOptions'
import {handleTriggerOperatorChange} from 'pages/convert/campaigns/utils/handleTriggerOperatorChange'
import {CampaignTrigger} from 'pages/convert/campaigns/types/CampaignTrigger'
import {CampaignTriggerOperator} from 'pages/convert/campaigns/types/enums/CampaignTriggerOperator.enum'

import css from './style.less'

type Props = AdvancedTriggerBaseProps

export const CurrentUrlTrigger = ({
    id,
    trigger,
    onUpdateTrigger,
    onTriggerValidationUpdate,
}: Props): JSX.Element => {
    const [innerOperator, setInnerOperator] = useState<CampaignTriggerOperator>(
        trigger.operator
    )
    const [innerValue, setInnerValue] = useState<string>(
        trigger.value as string
    )
    const [innerError, setInnerError] = useState<string | null>(null)

    const handleChangeOperator = (operator: Value) =>
        handleTriggerOperatorChange(
            operator,
            id,
            trigger,
            setInnerOperator,
            onUpdateTrigger
        )

    const handleChangeValue = (value: string) => {
        setInnerValue(value)
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
            validateCurrentUrl(value, trigger.operator)
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

    const handleBlurValue = () => {
        if (
            !validateTrigger({
                trigger: trigger,
                value: innerValue,
            })
        ) {
            return
        }

        onUpdateTrigger(id, {
            ...trigger,
            value: innerValue,
        })
    }

    const handleOnFocus = () => {
        setInnerError(null) // clear error value
    }

    useEffect(() => {
        validateTrigger({
            trigger: trigger,
            value: innerValue,
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [trigger.operator, trigger.value])

    return (
        <>
            <div>
                <Button intent="secondary" className="btn-frozen">
                    Current URL
                </Button>
            </div>
            <SelectField
                value={innerOperator}
                onChange={handleChangeOperator}
                options={convertTriggerOperatorsToSelectOptions(trigger.type)}
            />
            <div
                data-testid="current-url-value"
                style={{display: 'flex', flexGrow: 1}}
            >
                <InputField
                    className={css.fullWidth}
                    value={innerValue}
                    onChange={handleChangeValue}
                    onBlur={handleBlurValue}
                    onFocus={handleOnFocus}
                    hasError={!!innerError}
                    error={innerError}
                />
            </div>
        </>
    )
}
