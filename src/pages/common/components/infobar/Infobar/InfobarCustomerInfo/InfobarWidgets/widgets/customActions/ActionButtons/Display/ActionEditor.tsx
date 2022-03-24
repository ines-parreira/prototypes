import React, {FormEvent, useMemo, useState, useCallback, memo} from 'react'
import {
    Button,
    Form as ReactStrapForm,
    ModalBody,
    ModalFooter,
    ModalHeader,
} from 'reactstrap'
import produce from 'immer'
import {set as _set} from 'lodash'

import {ContentType} from 'models/api/types'
import DEPRECATED_InputField from 'pages/common/forms/DEPRECATED_InputField'

import {Action, Parameter} from '../../types'

type Props = {
    action: Action
    onSubmit: (action: Action) => void
    onClose: (doTrack?: boolean | React.MouseEvent) => void
}

function ActionEditor({action, onSubmit, onClose}: Props) {
    const [actionState, setActionState] = useState<Action>(action)

    const handleSubmit = useCallback(
        (evt: FormEvent<HTMLFormElement>) => {
            evt.preventDefault()
            onSubmit(actionState)
            onClose(false)
        },
        [actionState, onSubmit, onClose]
    )

    const mapParamsToInput = useCallback(
        (path: string, params?: Parameter[]) =>
            params?.map(({editable, label, key, value, mandatory}, index) => {
                if (!editable) return null
                return (
                    <DEPRECATED_InputField
                        type="text"
                        key={index}
                        name={key}
                        label={label || key}
                        defaultValue={value}
                        required={mandatory}
                        onChange={(value) =>
                            setActionState((previousActionState) =>
                                produce(previousActionState, (draft) => {
                                    _set(
                                        draft,
                                        `${path}[${index}].value`,
                                        value
                                    )
                                })
                            )
                        }
                    />
                )
            }),
        []
    )

    const headerInputs = useMemo(
        () => mapParamsToInput('headers', actionState.headers),
        [mapParamsToInput, actionState.headers]
    )
    const paramInputs = useMemo(
        () => mapParamsToInput('params', actionState.params),
        [mapParamsToInput, actionState.params]
    )

    const bodyFormInputs = useMemo(
        () =>
            mapParamsToInput(
                `body[${ContentType.Form}]`,
                actionState.body[ContentType.Form]
            ),
        [mapParamsToInput, actionState.body]
    )

    return (
        <>
            <ModalHeader toggle={onClose}>Edit fields</ModalHeader>
            <ReactStrapForm onSubmit={handleSubmit}>
                <ModalBody>
                    {headerInputs}
                    {paramInputs}
                    {bodyFormInputs}
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
                        Execute
                    </Button>
                </ModalFooter>
            </ReactStrapForm>
        </>
    )
}

export default memo(ActionEditor)
