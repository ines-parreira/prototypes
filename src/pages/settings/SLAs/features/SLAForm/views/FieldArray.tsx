import React from 'react'
import {CreateSlaPolicyBody} from '@gorgias/api-types'
import {useController, useFieldArray} from 'react-hook-form'
import classNames from 'classnames'
import {Label} from '@gorgias/ui-kit'

import settingsCss from 'pages/settings/settings.less'
import IconTooltip from 'pages/common/forms/IconTooltip/IconTooltip'
import Caption from 'pages/common/forms/Caption/Caption'

import FormField from './FormField'
import TimeUnitSelectBox from './TimeUnitSelectBox'
import NumberInputField from './NumberInputField'
import css from './SLAFormView.less'

const fieldTexts = {
    FRT: {
        label: 'First response time',
        tooltip:
            'The time between the first message from a customer and the first response from an agent.',
    },
    RT: {
        label: 'Resolution time',
        tooltip:
            'The time from the first message received from the customer until the ticket is closed.',
    },
}

export default function FieldArray() {
    const {fields} = useFieldArray<CreateSlaPolicyBody>({
        name: 'metrics',
    })

    const {
        fieldState: {error},
    } = useController({
        name: 'metrics',
    })

    return (
        <div className={settingsCss.mb48}>
            <div className={classNames(css.policiesRow)}>
                {fields.map((field, index) => (
                    <div className={css.policyRow} key={index}>
                        <Label className={settingsCss.mb8}>
                            <span>{fieldTexts[field.name].label}</span>
                            <IconTooltip className={css.labelIcon}>
                                {fieldTexts[field.name].tooltip}
                            </IconTooltip>
                        </Label>
                        <div className={css.inputGroup}>
                            <FormField
                                fieldName={`metrics.${index}.threshold`}
                                field={NumberInputField}
                                isRequired
                                hasControls={false}
                                placeholder={'0'}
                                min={1}
                            />
                            <FormField
                                fieldName={`metrics.${index}.unit`}
                                field={TimeUnitSelectBox}
                            />
                        </div>
                    </div>
                ))}
            </div>
            {!!error && <Caption error={error.message} />}
        </div>
    )
}
