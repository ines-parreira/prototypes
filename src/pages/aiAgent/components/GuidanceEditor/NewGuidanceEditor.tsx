import React, { useMemo } from 'react'

import { EditorState } from 'draft-js'

import { Label } from '@gorgias/merchant-ui-kit'

import { UploadType } from 'common/types'
import ToolbarProvider from 'pages/common/draftjs/plugins/toolbar/ToolbarProvider'
import { ActionName } from 'pages/common/draftjs/plugins/toolbar/types'
import RichField from 'pages/common/forms/RichField/RichField'
import { convertToHTML } from 'utils/editor'

import { guidanceVariables } from './variables'

import css from './GuidanceEditor.less'

type GuidanceEditorProps = {
    content: string
    handleUpdateContent: (content: string) => void
    onBlur?: () => void
    label?: string
}

const textLimit = 5000
const toolbarActions = [
    ActionName.Bold,
    ActionName.Italic,
    ActionName.Underline,
    ActionName.Link,
    ActionName.Image,
    ActionName.Emoji,
    ActionName.ProductPicker,
    ActionName.GuidanceVariable,
]

export function NewGuidanceEditor({
    content,
    handleUpdateContent,
    onBlur,
    label,
}: GuidanceEditorProps) {
    const richFieldValue = useMemo(
        () => ({
            html: content,
            text: content,
        }),
        [content],
    )
    const handleChange = (editorState: EditorState) => {
        const currentContent = editorState.getCurrentContent()
        const text = currentContent.getPlainText()

        if (text === content) return
        const convertedHTML = convertToHTML(currentContent)

        if (convertedHTML === content) return

        if (text.length > textLimit) return

        if (text === '') {
            handleUpdateContent('')
            return
        }

        handleUpdateContent(convertedHTML)
    }

    return (
        <div>
            <Label className={css.label} isRequired>
                {label}
            </Label>
            <ToolbarProvider
                canAddProductCard={true}
                canAddDiscountCodeLink={false}
                canAddVideoPlayer={false}
                guidanceVariables={guidanceVariables}
            >
                <RichField
                    minHeight={320}
                    maxLength={textLimit}
                    value={richFieldValue}
                    allowExternalChanges
                    onChange={handleChange}
                    displayedActions={toolbarActions}
                    noAutoScroll
                    uploadType={UploadType.PublicAttachment}
                    onBlur={onBlur}
                    getGuidanceVariables={() => guidanceVariables}
                />
            </ToolbarProvider>
        </div>
    )
}
