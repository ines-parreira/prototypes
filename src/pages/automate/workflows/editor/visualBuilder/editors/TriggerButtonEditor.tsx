import React, {useEffect, useState} from 'react'

import Label from 'pages/common/forms/Label/Label'
import TextInput from 'pages/common/forms/input/TextInput'
import {Drawer} from 'pages/common/components/Drawer'
import {useTranslationsPreviewContext} from 'pages/automate/workflows/hooks/useTranslationsPreviewContext'
import {useWorkflowEditorContext} from 'pages/automate/workflows/hooks/useWorkflowEditor'
import {TriggerButtonNodeType} from 'pages/automate/workflows/models/visualBuilderGraph.types'

import TranslationPreviewHeader from '../components/translations/TranslationPreviewHeader'
import TranslationsPreviewField from '../components/translations/TranslationPreviewField'
import NodeEditorDrawerHeader from '../NodeEditorDrawerHeader'
import {useNodeEditorDrawerContext} from '../NodeEditorDrawerContext'

import css from './NodeEditor.less'

const textLimit = 50

export default function TriggerButtonEditor({
    nodeInEdition,
}: {
    nodeInEdition: TriggerButtonNodeType
}) {
    const {onClose} = useNodeEditorDrawerContext()
    const {previewLanguage} = useTranslationsPreviewContext()
    const [inputRef, setInputRef] = useState<HTMLInputElement | null>(null)
    useEffect(() => {
        inputRef?.focus({preventScroll: true})
    }, [inputRef])
    const {dispatch, isFetchPending, isSavePending} = useWorkflowEditorContext()

    return (
        <>
            <NodeEditorDrawerHeader nodeInEdition={nodeInEdition} />
            <Drawer.Content>
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
                                ref={setInputRef}
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
                                The flow will be triggered when customers click
                                this button.
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
                                    nodeId={nodeInEdition.id}
                                    tkey={nodeInEdition.data.label_tkey ?? ''}
                                />
                            </div>
                        </>
                    )}
                </div>
            </Drawer.Content>
        </>
    )
}
