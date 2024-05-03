import React, {useState} from 'react'
import {FormFeedback, FormGroup, Input} from 'reactstrap'
import classnames from 'classnames'
import css from './AutoTagItem.less'

interface IProps {
    value: string
    placeholder: string
    inputKey: 'name' | 'description'
    onInputUpdate: (value: string) => void
    className?: string
}

export function AutoTagItem({
    value,
    onInputUpdate,
    placeholder,
    inputKey: inputType,
    className = '',
}: IProps) {
    const [isDirty, setIsDirty] = useState(false)
    return (
        <FormGroup className={classnames(css.formGroup, className)}>
            <Input
                value={value}
                invalid={isDirty && !value.length}
                placeholder={placeholder}
                onChange={(e) => {
                    setIsDirty(true)
                    onInputUpdate(e.target.value)
                }}
            />
            {!value.length && (
                <FormFeedback>Please fill in the tag {inputType}</FormFeedback>
            )}
        </FormGroup>
    )
}
