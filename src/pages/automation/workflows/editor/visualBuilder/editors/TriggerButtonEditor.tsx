import React, {useEffect, useRef} from 'react'
import Label from 'pages/common/forms/Label/Label'
import TextInput from 'pages/common/forms/input/TextInput'
import {useWorkflowEntrypointContext} from '../../hooks/useWorkflowEntrypoint'
import {TriggerButtonNodeType} from '../types'

import css from './NodeEditor.less'

const textLimit = 50

export default function TriggerButtonEditor({
    nodeInEdition,
    onClose,
}: {
    nodeInEdition: TriggerButtonNodeType
    onClose: () => void
}) {
    const inputRef = useRef<HTMLInputElement>(null)
    useEffect(() => {
        if (!nodeInEdition) return
        const t = setTimeout(() => {
            inputRef.current?.focus()
        }, 300)
        return () => clearTimeout(t)
    }, [nodeInEdition])
    const {label, setLabel, isFetchPending, isSavePending} =
        useWorkflowEntrypointContext()
    return (
        <div
            onKeyDown={(event) => {
                if (event.key === 'Enter') {
                    onClose()
                }
            }}
        >
            <Label isRequired={true} className={css.label}>
                Trigger button
            </Label>
            <TextInput
                className={css.textInput}
                ref={inputRef}
                isRequired
                maxLength={textLimit}
                onChange={setLabel}
                value={label}
                isDisabled={isFetchPending || isSavePending}
            />
            <div className={css.description}>
                The flow will be triggered when customers click this button.
            </div>
        </div>
    )
}
