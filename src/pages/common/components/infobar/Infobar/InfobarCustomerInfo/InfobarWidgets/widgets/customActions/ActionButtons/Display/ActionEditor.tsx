import React, {FormEvent, useMemo, useState, useCallback, memo} from 'react'
import {produce} from 'immer'
import {set as _set} from 'lodash'

import {ContentType} from 'models/api/types'
import InputField from 'pages/common/forms/input/InputField'
import {
    Action,
    Parameter,
} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/customActions/types'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'
import Button from 'pages/common/components/button/Button'

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
                    <InputField
                        autoFocus={index === 0}
                        type="text"
                        key={index}
                        name={key}
                        label={label || key}
                        defaultValue={value}
                        isRequired={mandatory}
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
            <ModalHeader forceCloseButton title="Edit fields" />
            <form onSubmit={handleSubmit}>
                <ModalBody>
                    {headerInputs}
                    {paramInputs}
                    {bodyFormInputs}
                </ModalBody>
                <ModalActionsFooter>
                    <Button intent="secondary" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="submit">Execute</Button>
                </ModalActionsFooter>
            </form>
        </>
    )
}

export default memo(ActionEditor)
