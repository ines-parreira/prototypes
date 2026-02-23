import React, { useMemo } from 'react'

import type { EditorState } from 'draft-js'

import { Label, Text } from '@gorgias/axiom'

import { UploadType } from 'common/types'
import type { GuidanceAction } from 'pages/common/draftjs/plugins/guidanceActions/types'
import ToolbarProvider from 'pages/common/draftjs/plugins/toolbar/ToolbarProvider'
import { ActionName } from 'pages/common/draftjs/plugins/toolbar/types'
import RichField from 'pages/common/forms/RichField/RichField'
import { convertToHTML } from 'utils/editor'

import { getPlainTextLength, textLimit } from './guidanceTextContent.utils'
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
    showDefaultToolbarActions?: boolean
}

const defaultToolbarActions = [
    ActionName.Bold,
    ActionName.Italic,
    ActionName.Underline,
    ActionName.Link,
    ActionName.Emoji,
    ActionName.GuidanceVariable,
    ActionName.GuidanceAction,
    ActionName.Heading,
    ActionName.BulletedList,
    ActionName.OrderedList,
    ActionName.FindReplace,
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
    showDefaultToolbarActions = true,
}: GuidanceEditorProps) {
    const toolbarActions = useMemo(() => {
        let actions = showDefaultToolbarActions
            ? defaultToolbarActions
            : [ActionName.GuidanceVariable, ActionName.GuidanceAction]

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
    }, [showActionsButton, showVariablesButton, showDefaultToolbarActions])

    const isOverLimit = useMemo(
        () => getPlainTextLength(content) > textLimit,
        [content],
    )

    const richFieldValue = useMemo(
        () => ({
            html: content,
        }),
        [content],
    )

    const handleChange = (editorState: EditorState) => {
        const currentContent = editorState.getCurrentContent()
        const convertedHTML = convertToHTML(currentContent)

        if (convertedHTML === content) {
            return
        }

        const text = currentContent.getPlainText()

        if (text === '') {
            const blocks = currentContent.getBlocksAsArray()
            const hasStructuredBlocks = blocks.some(
                (block) => block.getType() !== 'unstyled',
            )
            if (hasStructuredBlocks) {
                handleUpdateContent(convertedHTML)
            } else if (content !== '') {
                handleUpdateContent('')
            }
            return
        }

        handleUpdateContent(convertedHTML)
    }

    return (
        <div>
            <Label className={css.label} isRequired>
                {label}
            </Label>

            <Text as="p" className={css.helperText} size="sm">
                Describe the steps AI Agent should follow in clear, specific
                phrases.
            </Text>
            <Text as="p" className={css.helperText} size="sm">
                Type &apos;/&apos; or &apos;@&apos; to insert variables and
                actions.
            </Text>

            <div className={isOverLimit ? css.editorError : undefined}>
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
        </div>
    )
}
