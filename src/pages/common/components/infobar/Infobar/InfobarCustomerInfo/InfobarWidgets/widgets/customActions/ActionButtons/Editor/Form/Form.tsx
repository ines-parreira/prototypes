import {produce} from 'immer'
import {set as _set} from 'lodash'
import React, {FormEvent, useState, useCallback, memo} from 'react'

import {ContentType, HttpMethod} from 'models/api/types'
import Button from 'pages/common/components/button/Button'
import {httpMethodsWithBody} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/customActions/ActionButtons/httpMethodsWithBody'
import {
    Button as ButtonType,
    OnSubmitButton,
    Parameter,
} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/customActions/types'
import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
import InputField from 'pages/common/forms/input/InputField'

import Action from './Action'
import css from './Form.less'

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
            <ModalHeader forceCloseButton title="Configure HTTP action" />
            <form onSubmit={handleSubmit}>
                <ModalBody>
                    <div className={css.formParamRow}>
                        <InputField
                            type="text"
                            name="label"
                            label="Button title"
                            defaultValue={button.label}
                            onChange={handleLabelChange}
                            isRequired
                        />
                    </div>
                    <Action
                        action={formState.action}
                        onChange={handleActionChange}
                    />
                </ModalBody>
                <ModalActionsFooter>
                    <Button intent="secondary" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="submit">Save</Button>
                </ModalActionsFooter>
            </form>
        </>
    )
}

export default memo(Form)

function trimLeftoverData(button: ButtonType): ButtonType {
    return produce(button, ({action}: ButtonType) => {
        if (httpMethodsWithBody.includes(action.method)) {
            if (action.body.contentType === ContentType.Json) {
                action.body[ContentType.Form] =
                    initialState.action.body[ContentType.Form]
            } else {
                action.body[ContentType.Form] = removeDuplicates(
                    action.body[ContentType.Form]
                )
                action.body[ContentType.Json] =
                    initialState.action.body[ContentType.Json]
            }
        } else {
            action.body = initialState.action.body
        }
        action.headers = removeDuplicates(action.headers)
        action.params = removeDuplicates(action.params)
    })
}

function removeDuplicates(params: Parameter[]): Parameter[] {
    return params.filter(
        (paramA, index) =>
            // findIndex only returns the first match so others are filtered out
            params.findIndex((paramB) => paramA.key === paramB.key) === index
    )
}
