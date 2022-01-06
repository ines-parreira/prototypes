import React, {FormEvent, useState, useCallback, memo} from 'react'
import {
    Button,
    Form as ReactStrapForm,
    ModalBody,
    ModalFooter,
    ModalHeader,
} from 'reactstrap'
import produce, {setAutoFreeze} from 'immer'
import {set as _set} from 'lodash'

import InputField from '../../../../../../../../../../forms/InputField'
import {
    ContentType,
    HttpMethod,
} from '../../../../../../../../../../../../models/api/types'

import {Button as ButtonType, OnSubmitButton} from '../../../types'
import {httpMethodsWithBody} from '../../httpMethodsWithBody'

import Action from './Action'

// We never want the autofreeze feature from immer
// because we do modifiy the object afterwards with
// the trimLeftoverData function
setAutoFreeze(false)

type Props = {
    button?: ButtonType
    index?: number
    onSubmit: OnSubmitButton
    onClose: () => void
}

const initialState = {
    label: '',
    action: {
        method: HttpMethod.Get,
        url: '',
        headers: [],
        params: [],
        body: {
            contentType: ContentType.Json,
            [ContentType.Json]: {},
            [ContentType.Form]: [],
        },
    },
}

function Form({button = initialState, onSubmit, index, onClose}: Props) {
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
            onSubmit(trimLeftoverData(formState), index)
            onClose()
        },
        [formState, index, onSubmit, onClose]
    )

    return (
        <>
            <ModalHeader toggle={onClose}>Configure HTTP action</ModalHeader>
            <ReactStrapForm onSubmit={handleSubmit}>
                <ModalBody>
                    <InputField
                        type="text"
                        name="label"
                        label="Button title"
                        defaultValue={button.label}
                        onChange={handleLabelChange}
                        required
                    />
                    <Action
                        action={formState.action}
                        onChange={handleActionChange}
                    />
                </ModalBody>
                <ModalFooter>
                    <Button
                        color="secondary"
                        type="button"
                        onClick={onClose}
                        className="mr-2"
                    >
                        Cancel
                    </Button>
                    <Button color="primary" type="submit">
                        Save
                    </Button>
                </ModalFooter>
            </ReactStrapForm>
        </>
    )
}

export default memo(Form)

function trimLeftoverData(button: ButtonType): ButtonType {
    const action = button.action
    if (httpMethodsWithBody.includes(action.method)) {
        if (action.body.contentType === ContentType.Json) {
            action.body[ContentType.Form] =
                initialState.action.body[ContentType.Form]
        } else {
            action.body[ContentType.Json] =
                initialState.action.body[ContentType.Json]
        }
    } else {
        action.body = initialState.action.body
    }
    return button
}
