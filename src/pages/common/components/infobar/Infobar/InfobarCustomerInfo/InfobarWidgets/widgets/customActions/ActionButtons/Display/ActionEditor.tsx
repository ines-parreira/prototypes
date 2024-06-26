import React, {FormEvent, useCallback} from 'react'
import {get as _get} from 'lodash'
import {Label} from '@gorgias/ui-kit'

import InputField from 'pages/common/forms/input/InputField'
import {
    Action,
    Parameter,
    ParameterTypes,
} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/customActions/types'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'
import Button from 'pages/common/components/button/Button'
import SelectField from 'pages/common/forms/SelectField/SelectField'
import {SegmentEvent, logEvent} from 'common/segment'

import {GroupPositionContext} from 'pages/common/components/layout/Group'
import {useImmerState} from '../hooks/useImmerState'
import {getDropdownOptions, prepareDropdownValue} from '../helpers/dropdown'
import {ACTION_PARAMETER_PATHS} from '../../constants'

import css from './ActionsEditor.less'

type Props = {
    action: Action
    onSubmit: (action: Action) => void
    onClose: (doTrack?: boolean | React.MouseEvent) => void
    trackingData?: Record<string, unknown>
}

function ActionEditor({action, onSubmit, onClose, trackingData}: Props) {
    const [actionState, setActionState] = useImmerState(
        prepareDropdownValue(action)
    )

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
            params?.map(
                ({type, editable, label, key, value, mandatory}, index) => {
                    if (!editable && type !== ParameterTypes.Dropdown)
                        return null

                    return (
                        <div key={index} className={css.stack}>
                            {type === ParameterTypes.Dropdown ? (
                                <>
                                    <Label
                                        htmlFor={`customAction.${path}.${key}`}
                                        className={css.selectLabel}
                                        isRequired={mandatory}
                                    >
                                        {label || key}
                                    </Label>
                                    <SelectField
                                        showSelectedOption
                                        id={`customAction.${path}.${key}`}
                                        value={value}
                                        fullWidth
                                        onChange={(value) => {
                                            logEvent(
                                                SegmentEvent.CustomActionButtonsDropdownChanged,
                                                trackingData
                                            )
                                            setActionState(
                                                `${path}[${index}].value`,
                                                value
                                            )
                                        }}
                                        required={mandatory}
                                        options={getDropdownOptions(
                                            value,
                                            _get(
                                                action,
                                                `${path}[${index}].value`
                                            ),
                                            !mandatory
                                        )}
                                    />
                                </>
                            ) : (
                                <InputField
                                    autoFocus={index === 0}
                                    type="text"
                                    name={key}
                                    label={label || key}
                                    defaultValue={value}
                                    isRequired={mandatory}
                                    onChange={(value) =>
                                        setActionState(
                                            `${path}[${index}].value`,
                                            value
                                        )
                                    }
                                />
                            )}
                        </div>
                    )
                }
            ),
        [action, setActionState, trackingData]
    )

    return (
        <>
            <GroupPositionContext.Provider value={null}>
                <ModalHeader forceCloseButton title="Edit fields" />
                <form onSubmit={handleSubmit}>
                    <ModalBody>
                        {ACTION_PARAMETER_PATHS.map((param) =>
                            mapParamsToInput(param, _get(actionState, param))
                        )}
                    </ModalBody>
                    <ModalActionsFooter>
                        <Button intent="secondary" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit">Execute</Button>
                    </ModalActionsFooter>
                </form>
            </GroupPositionContext.Provider>
        </>
    )
}

export default ActionEditor
