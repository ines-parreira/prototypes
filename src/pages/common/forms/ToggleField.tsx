import React, {ComponentProps} from 'react'
import {FormGroup, Label, FormText} from 'reactstrap'

import ToggleButton from '../../common/components/ToggleButton'

import css from './ToggleField.less'

type Props = Omit<ComponentProps<typeof ToggleButton>, 'onChange'> & {
    onChange: (value: boolean) => void
    label?: string
    helpText?: string
    className?: string
}

const ToggleField = ({
    value,
    onChange,
    label,
    helpText,
    className,
    ...rest
}: Props): JSX.Element => (
    <FormGroup className={className}>
        <div className={css.container}>
            <ToggleButton {...rest} value={value} onChange={onChange} />
            <Label
                className="control-label mb-0 ml-2 clickable"
                onClick={() => onChange(!value)}
            >
                {label}
            </Label>
        </div>
        {helpText && <FormText color="muted">{helpText}</FormText>}
    </FormGroup>
)

export default ToggleField
