import React, {useEffect, useRef} from 'react'
import Label from 'pages/common/forms/Label/Label'
import TextInput from 'pages/common/forms/input/TextInput'
import {useTranslationsPreviewContext} from 'pages/automation/workflows/hooks/useTranslationsPreviewContext'
import TranslationPreviewHeader from 'pages/automation/workflows/components/translations/TranslationPreviewHeader'
import TranslationsPreviewField from 'pages/automation/workflows/components/translations/TranslationPreviewField'

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
    const {previewLanguage} = useTranslationsPreviewContext()
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
            className={css.container}
        >
            <div className={css.formField}>
                <Label isRequired={true}>Trigger button</Label>
                <div className={css.withDescription}>
                    <TextInput
                        className={css.textInput}
                        ref={inputRef}
                        isRequired
                        maxLength={textLimit}
                        onChange={(inputValue) =>
                            dispatch({
                                type: 'SET_TRIGGER_BUTTON_LABEL',
                                triggerButtonNodeId: nodeInEdition.id,
                                label: inputValue,
                            })
                        }
                        value={nodeInEdition.data.label ?? ''}
                        isDisabled={isFetchPending || isSavePending}
                    />
                    <div className={css.description}>
                        The flow will be triggered when customers click this
                        button.
                    </div>
                </div>
            </div>
            {previewLanguage && (
                <>
                    <TranslationPreviewHeader />
                    <div className={css.formField}>
                        <Label className={css.labelDisabled}>
                            Trigger button
                        </Label>
                        <TranslationsPreviewField
                            tkey={nodeInEdition.data.label_tkey ?? ''}
                        />
                    </div>
                </>
            )}
        </div>
    )
}
