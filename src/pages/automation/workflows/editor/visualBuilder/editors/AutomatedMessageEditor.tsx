import React, {useEffect, useRef} from 'react'
import {EditorState} from 'draft-js'
import ToolbarProvider from 'pages/common/draftjs/plugins/toolbar/ToolbarProvider'
import {convertToHTML} from 'utils/editor'
import RichField from 'pages/common/forms/RichField/RichField'
import Label from 'pages/common/forms/Label/Label'
import {AutomatedMessageNodeType} from '../types'
import {useWorkflowConfigurationContext} from '../../hooks/useWorkflowConfiguration'

import css from './NodeEditor.less'

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
    const nodeContent = nodeInEdition.data.message.content
    const handleChange = (editorState: EditorState) => {
        const content = editorState.getCurrentContent()
        const text = content.getPlainText()

        if (convertToHTML(content) === nodeContent.html) return
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
            <ToolbarProvider>
                <RichField
                    className={css.richField}
                    ref={textareaRef}
                    value={nodeContent}
                    allowExternalChanges
                    onChange={handleChange}
                />
            </ToolbarProvider>
        </>
    )
}
