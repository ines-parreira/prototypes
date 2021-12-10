import React, {FormEvent, useState, useCallback, memo} from 'react'
import {Button, Form as ReactStrapForm} from 'reactstrap'
import produce from 'immer'
import {set as _set} from 'lodash'

import InputField from '../../../../../../../../../../forms/InputField'
import {HttpMethod} from '../../../../../../../../../../../../models/api/types'

import {Button as ButtonType, OnSubmitButton} from '../../../types'

import Action from './Action'

type Props = {
    button?: ButtonType
    index?: number
    onSubmit: OnSubmitButton
    onClose: () => void
}

const intialState = {
    label: '',
    action: {
        method: HttpMethod.Get,
        url: '',
        headers: [],
        params: [],
        body: {},
    },
}

function Form({button = intialState, onSubmit, index, onClose}: Props) {
    const [formState, setFormState] = useState<ButtonType>(button)

    const handleLabelChange = useCallback((value: string) => {
        setFormState((previousFormState) => ({
            ...previousFormState,
            label: value.trim(),
        }))
    }, [])

    const handleActionChange = useCallback((path: string, value: unknown) => {
        setFormState((previousFormState) => {
            const updatedAction = produce(previousFormState.action, (draft) => {
                _set(draft, path, value)
            })
            return {
                ...previousFormState,
                action: updatedAction,
            }
        })
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
                name="label"
                label="Button title"
                defaultValue={button.label}
                onChange={handleLabelChange}
                required
            />
            <Action action={formState.action} onChange={handleActionChange} />
            <div className="mt-4">
                <Button color="primary" type="submit" className="mr-2">
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
