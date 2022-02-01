import React, {FocusEvent} from 'react'
import {Map} from 'immutable'
import classNames from 'classnames'

import InputField from '../../../../../../common/forms/InputField'
import {Value} from '../../../../../../common/forms/SelectField/types'

type Props = {
    keyConfig: Map<any, any>
    trigger: Map<any, any>
    onChange: (value: Value) => void
    className?: string
}

export const GorgiasChatCampaignDetailValueInput = ({
    keyConfig,
    trigger,
    onChange,
    className,
}: Props) => {
    const triggerValue = trigger.get('value')

    switch (keyConfig.getIn(['value', 'input'])) {
        case 'text':
            return (
                <InputField
                    type="text"
                    className={classNames('flex-grow-1', 'mb-0', className)}
                    name="value"
                    value={triggerValue || ''}
                    onChange={onChange}
                />
            )
        case 'number': {
            return (
                <InputField
                    className={classNames('flex-grow-1', 'mb-0', className)}
                    type="number"
                    step="1"
                    value={triggerValue}
                    onChange={(value) => {
                        onChange(value < 0 ? 0 : value)
                    }}
                    onBlur={(event: FocusEvent<HTMLInputElement>) => {
                        if (event.target.value === '') {
                            onChange(0)
                        }
                    }}
                    rightAddon="seconds"
                />
            )
        }
        default:
            return <div className={className} />
    }
}
