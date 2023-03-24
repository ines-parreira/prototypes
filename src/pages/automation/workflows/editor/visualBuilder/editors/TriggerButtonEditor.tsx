import React, {useEffect, useRef} from 'react'
import Label from 'pages/common/forms/Label/Label'
import TextInput from 'pages/common/forms/input/TextInput'
import {useWorkflowEntrypointContext} from '../../hooks/useWorkflowEntrypoint'
import {TriggerButtonNodeType} from '../types'

import css from './NodeEditor.less'

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
        <>
            <Label isRequired={true} className={css.label}>
                Trigger button
            </Label>
            <TextInput
                className={css.textInput}
                ref={inputRef}
                isRequired
                onChange={setLabel}
                value={label}
                isDisabled={isFetchPending || isSavePending}
                onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === 'Escape') {
                        onClose()
                    }
                }}
            />
            <div className={css.description}>
                The flow will be triggered when customers click this button in
                chat.
            </div>
        </>
    )
}
