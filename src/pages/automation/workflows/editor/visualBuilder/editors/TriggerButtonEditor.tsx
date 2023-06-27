import React, {useEffect, useRef} from 'react'
import Label from 'pages/common/forms/Label/Label'
import TextInput from 'pages/common/forms/input/TextInput'
import {useWorkflowEditorContext} from '../../../hooks/useWorkflowEditor'
import {TriggerButtonNodeType} from '../../../models/visualBuilderGraph.types'

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
    const {dispatch, isFetchPending, isSavePending} = useWorkflowEditorContext()

    return (
        <div
            onKeyDown={(event) => {
                if (event.key === 'Enter') {
                    onClose()
                }
            }}
        >
            <Label isRequired={true} className={css.title}>
                Trigger button
            </Label>
            <TextInput
                className={css.textInput}
                ref={inputRef}
                isRequired
                maxLength={textLimit}
                onChange={(nextValue) => {
                    dispatch({
                        type: 'SET_TRIGGER_BUTTON_LABEL',
                        triggerButtonNodeId: nodeInEdition.id,
                        label: nextValue,
                    })
                }}
                value={nodeInEdition.data.label ?? ''}
                isDisabled={isFetchPending || isSavePending}
            />
            <div className={css.description}>
                The flow will be triggered when customers click this button.
            </div>
        </div>
    )
}
