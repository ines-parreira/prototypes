import React, {useEffect, useRef} from 'react'
import Label from 'pages/common/forms/Label/Label'
import TextInput from 'pages/common/forms/input/TextInput'
import {ReplyButtonNodeType} from '../types'
import {useWorkflowConfigurationContext} from '../../hooks/useWorkflowConfiguration'

import css from './NodeEditor.less'

const textLimit = 50

export default function ReplyButtonEditor({
    nodeInEdition,
    onClose,
}: {
    nodeInEdition: ReplyButtonNodeType
    onClose: () => void
}) {
    const {dispatch, isFetchPending, isSavePending} =
        useWorkflowConfigurationContext()
    const inputRef = useRef<HTMLInputElement>(null)
    useEffect(() => {
        if (!nodeInEdition) return
        const t = setTimeout(() => {
            inputRef.current?.focus()
        }, 300)
        return () => clearTimeout(t)
    }, [nodeInEdition])
    const {
        step_id,
        choice: {label, event_id},
    } = nodeInEdition.data
    return (
        <div
            onKeyDown={(event) => {
                if (event.key === 'Enter') {
                    onClose()
                }
            }}
        >
            <Label isRequired={true} className={css.label}>
                Reply button
            </Label>
            <TextInput
                className={css.textInput}
                ref={inputRef}
                maxLength={textLimit}
                isRequired
                onChange={(label) =>
                    dispatch({
                        type: 'SET_REPLY_BUTTON_LABEL',
                        event_id,
                        label,
                        step_id,
                    })
                }
                value={label}
                isDisabled={isFetchPending || isSavePending}
            />
        </div>
    )
}
