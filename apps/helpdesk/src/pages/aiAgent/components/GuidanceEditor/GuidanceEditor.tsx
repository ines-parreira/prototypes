import React, { useMemo } from 'react'

import type { EditorState } from 'draft-js'

import { LegacyLabel as Label } from '@gorgias/axiom'

import { UploadType } from 'common/types'
import type { GuidanceAction } from 'pages/common/draftjs/plugins/guidanceActions/types'
import ToolbarProvider from 'pages/common/draftjs/plugins/toolbar/ToolbarProvider'
import { ActionName } from 'pages/common/draftjs/plugins/toolbar/types'
import RichField from 'pages/common/forms/RichField/RichField'
import { convertToHTML } from 'utils/editor'

import { guidanceVariables } from './variables'

import css from './GuidanceEditor.less'

type GuidanceEditorProps = {
    content: string
    shopName: string
    availableActions: GuidanceAction[]
    showActionsButton: boolean
    showVariablesButton?: boolean
    handleUpdateContent: (content: string) => void
    onBlur?: () => void
    label?: string
}

export const textLimit = 5000
const defaultToolbarActions = [
    ActionName.Bold,
    ActionName.Italic,
    ActionName.Underline,
    ActionName.Link,
    ActionName.Emoji,
    ActionName.GuidanceVariable,
    ActionName.GuidanceAction,
    ActionName.BulletedList,
    ActionName.OrderedList,
]

export function GuidanceEditor({
    content,
    shopName,
    availableActions,
    showActionsButton,
    showVariablesButton = true,
    handleUpdateContent,
    onBlur,
    label,
}: GuidanceEditorProps) {
    const toolbarActions = useMemo(() => {
        let actions = defaultToolbarActions

        if (!showActionsButton) {
            actions = actions.filter(
                (action) => action !== ActionName.GuidanceAction,
            )
        }

        if (!showVariablesButton) {
            actions = actions.filter(
                (action) => action !== ActionName.GuidanceVariable,
            )
        }

        return actions
    }, [showActionsButton, showVariablesButton])

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

        if (convertedHTML === content || text.length > textLimit) {
            return
        }

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
                guidanceActions={availableActions}
                shopName={shopName}
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
