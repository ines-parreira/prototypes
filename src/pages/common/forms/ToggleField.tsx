import React from 'react'
import {FormGroup, Label, FormText} from 'reactstrap'

import ToggleButton from '../../common/components/ToggleButton'

import css from './ToggleField.less'

type Props = {
    value: boolean
    name: string
    label?: string
    helpText?: string
    onChange: (value: boolean) => void
}

const ToggleField = ({
    name,
    value,
    onChange,
    label,
    helpText,
}: Props): JSX.Element => {
    return (
        <FormGroup>
            <div className={css.container}>
                <div>
                    <ToggleButton
                        name={name}
                        value={value}
                        onChange={onChange}
                    />
                </div>
                <div>
                    <Label
                        className="control-label mb-0 ml-2"
                        onClick={() => onChange(!value)}
                    >
                        {label}
                    </Label>
                </div>
            </div>
            {helpText && <FormText color="muted">{helpText}</FormText>}
        </FormGroup>
    )
}

export default ToggleField
