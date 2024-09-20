import classnames from 'classnames'
import React from 'react'
import CheckBox from 'pages/common/forms/CheckBox'
import {FormValues, WizardFormValues} from '../types'
import {AiAgentChannel} from '../constants'
import css from './HeaderSection.less'

type HeaderSectionProps = {
    title: AiAgentChannel
    isValid: boolean
    wizard: WizardFormValues
    handleFormUpdate: (payload: Partial<FormValues>) => void
}

export const HeaderSection = ({
    title,
    isValid,
    wizard,
    handleFormUpdate,
}: HeaderSectionProps) => {
    const enabledChannels = wizard?.enabledChannels
    const value = enabledChannels?.find((v) => v === title)
    const updateValue = (nextValue: boolean) => {
        let newChannels = enabledChannels || []
        if (nextValue) {
            newChannels.push(title)
        } else {
            newChannels = newChannels.filter((v) => v !== title)
        }

        handleFormUpdate({
            wizard: {...wizard, enabledChannels: newChannels},
        })
    }

    return (
        <div className={css.extendableSectionHeader}>
            <CheckBox
                inputClassName={css.checkBoxInput}
                name={`select-${title}`}
                aria-label={`select-${title}`}
                isChecked={!!value}
                onChange={(nextValue) => updateValue(nextValue)}
            />
            {value && (
                <i
                    className={classnames('material-icons', css.checkIcon, {
                        [css.valid]: isValid,
                        [css.invalid]: !isValid,
                    })}
                >
                    {isValid ? 'check_circle' : 'error'}
                </i>
            )}
            <div className={css.title}>{title}</div>
        </div>
    )
}
