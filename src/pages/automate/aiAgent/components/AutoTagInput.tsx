import React, {useState} from 'react'
import {FormFeedback, FormGroup, Input} from 'reactstrap'
import css from './AutoTagItem.less'

interface IProps {
    value: string
    placeholder: string
    inputKey: 'name' | 'description'
    onInputUpdate: (value: string) => void
}

export function AutoTagItem({
    value,
    onInputUpdate,
    placeholder,
    inputKey: inputType,
}: IProps) {
    const [isDirty, setIsDirty] = useState(false)
    return (
        <FormGroup className={css.formGroup}>
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
