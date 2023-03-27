import React, {useEffect, useMemo, useRef} from 'react'
import {EditorState} from 'draft-js'
import ToolbarProvider from 'pages/common/draftjs/plugins/toolbar/ToolbarProvider'
import {convertToHTML} from 'utils/editor'
import RichField from 'pages/common/forms/RichField/RichField'
import Label from 'pages/common/forms/Label/Label'
import {AutomatedMessageNodeType} from '../types'
import {useWorkflowConfigurationContext} from '../../hooks/useWorkflowConfiguration'

import css from './NodeEditor.less'

const textLimit = 5000

export default function AutomatedMessageEditor({
    nodeInEdition,
    onClose,
}: {
    nodeInEdition: AutomatedMessageNodeType
    onClose: () => void
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

        const isKeyTypedNewLine =
            convertToHTML(content).length > nodeContent.html.length &&
            convertToHTML(content).substring(nodeContent.html.length) ===
                '<div><br></div>'
        if (convertToHTML(content) === nodeContent.html || isKeyTypedNewLine)
            return
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
        <div
            onKeyDown={(event) => {
                if (event.key === 'Escape' || event.key === 'Enter') {
                    onClose()
                }
            }}
        >
            <Label isRequired={true} className={css.richFieldLabel}>
                Automated message
            </Label>
            <ToolbarProvider
                canAddProductCard={false}
                canAddDiscountCodeLink={false}
                canAddVideoPlayer={false}
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
        </div>
    )
}
