import React, { useEffect, useState } from 'react'

import { LegacyLabel as Label } from '@gorgias/axiom'

import { useTranslationsPreviewContext } from 'pages/automate/workflows/hooks/useTranslationsPreviewContext'
import { useVisualBuilderContext } from 'pages/automate/workflows/hooks/useVisualBuilder'
import { ChannelTriggerNodeType } from 'pages/automate/workflows/models/visualBuilderGraph.types'
import { Drawer } from 'pages/common/components/Drawer'
import Caption from 'pages/common/forms/Caption/Caption'
import TextInput from 'pages/common/forms/input/TextInput'

import TranslationsPreviewField from '../components/translations/TranslationPreviewField'
import TranslationPreviewHeader from '../components/translations/TranslationPreviewHeader'
import { useNodeEditorDrawerContext } from '../NodeEditorDrawerContext'
import NodeEditorDrawerHeader from '../NodeEditorDrawerHeader'

import css from './NodeEditor.less'

const textLimit = 50

export default function ChannelTriggerEditor({
    nodeInEdition,
}: {
    nodeInEdition: ChannelTriggerNodeType
}) {
    const { onClose } = useNodeEditorDrawerContext()
    const { previewLanguage } = useTranslationsPreviewContext()
    const [inputRef, setInputRef] = useState<HTMLInputElement | null>(null)
    useEffect(() => {
        inputRef?.focus({ preventScroll: true })
    }, [inputRef])
    const { dispatch } = useVisualBuilderContext()

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
                        <Label isRequired>Trigger button</Label>
                        <div>
                            <TextInput
                                className={css.textInput}
                                ref={setInputRef}
                                isRequired
                                maxLength={textLimit}
                                onChange={(inputValue) =>
                                    dispatch({
                                        type: 'SET_CHANNEL_TRIGGER_LABEL',
                                        channelTriggerNodeId: nodeInEdition.id,
                                        label: inputValue,
                                    })
                                }
                                value={nodeInEdition.data.label ?? ''}
                                hasError={!!nodeInEdition.data.errors?.label}
                                onBlur={() => {
                                    dispatch({
                                        type: 'SET_TOUCHED',
                                        nodeId: nodeInEdition.id,
                                        touched: {
                                            label: true,
                                        },
                                    })
                                }}
                            />
                            <Caption error={nodeInEdition.data.errors?.label}>
                                The flow will be triggered when customers click
                                this button.
                            </Caption>
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
