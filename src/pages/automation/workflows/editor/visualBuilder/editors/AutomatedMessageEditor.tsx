import React, {useEffect, useMemo, useRef} from 'react'
import {EditorState} from 'draft-js'
import {fromJS} from 'immutable'
import ToolbarProvider from 'pages/common/draftjs/plugins/toolbar/ToolbarProvider'
import {convertToHTML} from 'utils/editor'
import RichField from 'pages/common/forms/RichField/RichField'
import Label from 'pages/common/forms/Label/Label'
import {IntegrationType} from 'models/integration/constants'
import {AutomatedMessageNodeType} from '../types'
import {useWorkflowConfigurationContext} from '../../hooks/useWorkflowConfiguration'
import {useWorkflowEntrypointContext} from '../../hooks/useWorkflowEntrypoint'

import css from './NodeEditor.less'

const textLimit = 5000

export default function AutomatedMessageEditor({
    nodeInEdition,
}: {
    nodeInEdition: AutomatedMessageNodeType
}) {
    const textareaRef = useRef<RichField>(null)
    useEffect(() => {
        if (!nodeInEdition) return
        const t = setTimeout(() => {
            textareaRef.current?.focusEditor()
        }, 300)
        return () => clearTimeout(t)
    }, [nodeInEdition])
    const {dispatch} = useWorkflowConfigurationContext()
    const {storeIntegration} = useWorkflowEntrypointContext()
    const nodeContent = useMemo(
        () => ({
            html: nodeInEdition.data.message.content.html,
            text: nodeInEdition.data.message.content.text,
        }),
        [
            nodeInEdition.data.message.content.text,
            nodeInEdition.data.message.content.html,
        ]
    )
    const handleChange = (editorState: EditorState) => {
        const content = editorState.getCurrentContent()
        const text = content.getPlainText()

        if (convertToHTML(content) === nodeContent.html) return
        if (text.length > textLimit) return
        dispatch({
            type: 'SET_AUTOMATED_MESSAGE_CONTENT',
            step_id: nodeInEdition.data.step_id,
            content: {
                html: convertToHTML(content),
                text: text,
            },
        })
    }
    return (
        <>
            <Label isRequired={true} className={css.richFieldLabel}>
                Automated message
            </Label>
            <ToolbarProvider
                canAddProductCard={false}
                canAddDiscountCodeLink={false}
                canAddVideoPlayer={false}
                shopifyIntegrations={fromJS(
                    storeIntegration?.type === IntegrationType.Shopify
                        ? [storeIntegration]
                        : []
                )}
            >
                <RichField
                    minHeight={250}
                    maxLength={textLimit}
                    ref={textareaRef}
                    value={nodeContent}
                    allowExternalChanges
                    onChange={handleChange}
                />
            </ToolbarProvider>
        </>
    )
}
