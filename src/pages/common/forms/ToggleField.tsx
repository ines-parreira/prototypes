import React, {ComponentProps} from 'react'
import {FormGroup, Label, FormText} from 'reactstrap'

import ToggleInput from './ToggleInput'

import css from './ToggleField.less'

type Props = Omit<ComponentProps<typeof ToggleInput>, 'onClick'> & {
    onClick: (value: boolean) => void
    label?: string
    helpText?: string
    className?: string
}

const ToggleField = ({
    isToggled,
    onClick,
    label,
    helpText,
    className,
    ...rest
}: Props): JSX.Element => (
    <FormGroup className={className}>
        <div className={css.container}>
            <ToggleInput {...rest} isToggled={isToggled} onClick={onClick} />
            <Label
                className="control-label mb-0 ml-2 clickable"
                onClick={() => onClick(!isToggled)}
            >
                {label}
            </Label>
        </div>
        {helpText && <FormText color="muted">{helpText}</FormText>}
    </FormGroup>
)

export default ToggleField
