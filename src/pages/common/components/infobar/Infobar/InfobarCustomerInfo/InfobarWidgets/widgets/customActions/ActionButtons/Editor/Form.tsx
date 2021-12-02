import React, {FormEvent, useState, useCallback, useEffect, memo} from 'react'
import {Button, Form as ReactStrapForm} from 'reactstrap'

import InputField from '../../../../../../../../../forms/InputField'

import {Button as ButtonType, OnSubmitButton} from '../../types'

type FormProps = {
    button?: ButtonType
    index?: number
    onSubmit: OnSubmitButton
    onClose: () => void
}

const intialState = {
    label: '',
}

function Form({button = intialState, onSubmit, index, onClose}: FormProps) {
    const [canSubmit, setCanSubmit] = useState<boolean>(false)
    const [formState, setFormState] = useState<ButtonType>(button)

    useEffect(() => {
        formState.label ? setCanSubmit(true) : setCanSubmit(false)
    }, [formState])

    const handleLabelChange = useCallback((value: string) => {
        setFormState((previousFormState) => ({
            ...previousFormState,
            label: value.trim(),
        }))
    }, [])

    const handleSubmit = useCallback(
        (evt: FormEvent<HTMLFormElement>) => {
            evt.preventDefault()
            onSubmit(formState, index)
            onClose()
        },
        [formState, index, onSubmit, onClose]
    )

    return (
        <ReactStrapForm onSubmit={handleSubmit}>
            <InputField
                type="text"
                name="actionButton.label"
                label="Title"
                defaultValue={button.label}
                onChange={handleLabelChange}
            />
            <div>
                <Button
                    color="primary"
                    type="submit"
                    className="mr-2"
                    disabled={!canSubmit}
                >
                    Save
                </Button>
                <Button color="secondary" type="button" onClick={onClose}>
                    Cancel
                </Button>
            </div>
        </ReactStrapForm>
    )
}

export default memo(Form)
