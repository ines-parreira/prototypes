import React, {useEffect, useState} from 'react'
import classNames from 'classnames'

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
    onDeleteTrigger,
    onTriggerValidationUpdate,
}: Props): JSX.Element => {
    const [innerOperator, setInnerOperator] = useState<CampaignTriggerOperator>(
        trigger.operator
    )
    const [innerValue, setInnerValue] = useState<string[]>(
        (!Array.isArray(trigger.value)
            ? [trigger.value]
            : trigger.value) as string[]
    )
    const [innerError, setInnerError] = useState<string[]>([])

    const handleChangeOperator = (operator: Value) =>
        handleTriggerOperatorChange(
            operator,
            id,
            trigger,
            setInnerOperator,
            onUpdateTrigger
        )

    const handleChangeValue = (index: number) => (value: string) => {
        setInnerValue((prevState) => {
            const arr = [...prevState]
            arr[index] = value
            return arr
        })
    }

    const updateInputError = (index: number, value: string) =>
        setInnerError((prevState) => {
            const arr = [...prevState]
            arr[index] = value
            return arr
        })

    const deleteValue = (index: number) => {
        setInnerValue((prevState) => {
            const arr = [...prevState]
            arr.splice(index, 1)

            if (arr.length === 0) {
                // we removed all values, remove trigger
                onDeleteTrigger(id)
            } else {
                onUpdateTrigger(id, {
                    ...trigger,
                    value: arr,
                })
            }

            return arr
        })
    }

    const addValue = () => {
        if (innerValue.some((value) => !Boolean(value))) {
            // if have one empty value, do not add more
            return
        }

        setInnerValue((prevState) => {
            const arr = [...prevState, '']
            return arr
        })
    }

    const validateValues = (values: string[]) => {
        values.map((value, index) => {
            validateTrigger({
                index: index,
                trigger: trigger,
                value: value,
            })
        })
    }

    const validateTrigger = ({
        index,
        trigger,
        value,
    }: {
        index: number
        trigger: CampaignTrigger
        value: any
    }): boolean => {
        let isValid = true

        // Clear error for the input
        updateInputError(index, '')

        try {
            validateCurrentUrl(value, trigger.operator)
        } catch (e) {
            if (e instanceof ValidationError) {
                updateInputError(index, e.message)
                isValid = false
            }
        }

        onTriggerValidationUpdate &&
            onTriggerValidationUpdate(trigger.id, isValid) // eslint-disable-line @typescript-eslint/no-unsafe-call

        return isValid
    }

    const handleBlurValue = (index: number) => () => {
        if (
            !validateTrigger({
                index,
                trigger: trigger,
                value: innerValue[index],
            })
        ) {
            return
        }

        onUpdateTrigger(id, {
            ...trigger,
            value: innerValue,
        })
    }

    const handleOnFocus = (index: number) => () => {
        updateInputError(index, '')
    }

    useEffect(() => {
        if (trigger.value) {
            const values = Array.isArray(trigger.value)
                ? trigger.value
                : [trigger.value]

            validateValues(values as string[])
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [trigger.operator, trigger.value])

    useEffect(() => {
        validateValues(innerValue)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [innerValue.length])

    return (
        <div className={css.currentUrlContainer}>
            <div className={classNames(css.currentSetting)}>
                <div className={css.marginRight}>
                    <Button intent="secondary" className="btn-frozen">
                        Current URL
                    </Button>
                </div>
                <SelectField
                    value={innerOperator}
                    onChange={handleChangeOperator}
                    options={convertTriggerOperatorsToSelectOptions(
                        trigger.type,
                        innerValue.length > 1
                    )}
                />
            </div>
            <div className={css.currentUrlRowContainer}>
                {innerValue.map((__, idx) => (
                    <div
                        key={`current-url-input-${idx}`}
                        className={classNames(css.currentValue, {
                            [css.multipleValues]: innerValue.length > 1,
                        })}
                    >
                        <InputField
                            aria-label="Current URL"
                            className={css.urlInput}
                            value={innerValue[idx]}
                            onChange={handleChangeValue(idx)}
                            onBlur={handleBlurValue(idx)}
                            onFocus={handleOnFocus(idx)}
                            hasError={!!innerError[idx]}
                            error={innerError[idx]}
                        />
                        {innerValue.length === 1 && (
                            <Button
                                intent="secondary"
                                fillStyle="ghost"
                                onClick={addValue}
                            >
                                + Add URL
                            </Button>
                        )}
                        <div
                            aria-label="Delete URL"
                            className={css.closeWrapper}
                            onClick={() => deleteValue(idx)}
                        >
                            <i className="material-icons md-2 text-danger">
                                clear
                            </i>
                        </div>
                    </div>
                ))}
                {innerValue.length > 1 && (
                    <div className={css.buttonContainer}>
                        <Button
                            intent="secondary"
                            fillStyle="ghost"
                            onClick={addValue}
                        >
                            + Add URL
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}
