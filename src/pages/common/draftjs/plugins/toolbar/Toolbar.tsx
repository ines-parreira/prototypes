import React, { DragEvent, ReactNode, useState } from 'react'

import classnames from 'classnames'
import { EditorState } from 'draft-js'

import { UploadType } from 'common/types'
import {
    GuidanceVariable,
    GuidanceVariableList,
} from 'pages/aiAgent/components/GuidanceEditor/variables.types'
import { toLiquidSyntax } from 'pages/automate/workflows/models/variables.model'
import {
    WorkflowVariable,
    WorkflowVariableList,
} from 'pages/automate/workflows/models/variables.types'
import Button from 'pages/common/components/button/Button'
import { ContactFormCaptureFormIconButton } from 'pages/convert/campaigns/components/ContactCaptureForm/ContactCaptureFormIconButton'
import { insertText } from 'utils'

import GuidanceVariablePicker from './components/GuidanceVariablePicker'
import {
    AddDiscountCode,
    AddEmoji,
    AddImage,
    AddLink,
    AddProductLink,
    AddVideo,
    Bold,
    Italic,
    Underline,
} from './components/index'
import WorkflowVariablePicker from './components/WorkflowVariablePicker'
import { isDisplayedAction } from './index'
import { useToolbarContext } from './ToolbarContext'
import { ActionInjectedProps, ActionName } from './types'

import css from './Toolbar.less'

type Props = {
    buttons?: ReactNode[]
    attachFiles: (T: Array<Blob>) => void
    canDropFiles: boolean
    displayedActions?: ActionName[]
    quickReply: ReactNode
    attachments?: File[]
    linkEntityKey?: string
    maxLength?: number
    countCharacters?: boolean
    editorState: EditorState
    linkIsOpen: boolean
    linkUrl: string
    linkText: string
    linkTarget: string
    uploadType?: UploadType
    onLinkUrlChange: (url: string) => void
    onLinkTextChange: (text: string) => void
    onLinkTargetChange: (target: string) => void
    onLinkOpen: () => void
    onLinkClose: () => void
    getWorkflowVariables?: () => WorkflowVariableList
    getGuidanceVariables?: () => GuidanceVariableList
} & ActionInjectedProps

const renderButton = (button: ReactNode, index: number) => (
    <Button className={css.button} key={index} intent="secondary" size="small">
        {button}
    </Button>
)

const Toolbar = ({
    buttons,
    attachFiles,
    canDropFiles,
    getEditorState,
    setEditorState,
    displayedActions,
    quickReply,
    attachments,
    linkEntityKey,
    linkIsOpen,
    linkUrl,
    countCharacters,
    maxLength,
    editorState,
    linkText,
    linkTarget,
    uploadType,
    onLinkUrlChange,
    onLinkTextChange,
    onLinkTargetChange,
    onLinkOpen,
    onLinkClose,
    getWorkflowVariables,
}: Props) => {
    const [isHovered, setIsHovered] = useState(false)

    const {
        shopifyIntegrations,
        onContactFormOpenChange,
        contactFormButtonEnabled,
    } = useToolbarContext()

    const handleDrop = (e: DragEvent) => {
        e.preventDefault()
        const eventFiles = (e.dataTransfer && e.dataTransfer.files) || []
        const files = Array.from(eventFiles)
        attachFiles(files)
        setIsHovered(false)
    }
    const handleDragOver = (e: DragEvent) => {
        if (!canDropFiles) {
            return
        }

        e.preventDefault()
        setIsHovered(true)
    }
    const handleDragLeave = () => {
        setIsHovered(false)
    }

    const handleVariableSelection = (variable: WorkflowVariable) => {
        const editorState = getEditorState()

        const newEditorState = insertText(editorState, toLiquidSyntax(variable))

        // restore focus after insertText
        setEditorState(
            EditorState.forceSelection(
                newEditorState,
                newEditorState.getSelection(),
            ),
        )
    }

    const handleGuidanceVariableSelection = (variable: GuidanceVariable) => {
        const editorState = getEditorState()

        const newEditorState = insertText(editorState, variable.value)

        // restore focus after insertText
        setEditorState(
            EditorState.forceSelection(
                newEditorState,
                newEditorState.getSelection(),
            ),
        )
    }

    const isActionDisplayed = (name: ActionName) =>
        isDisplayedAction(name, displayedActions)

    const actionsProps = { getEditorState, setEditorState }

    return (
        <div
            className={classnames('editor-toolbar', css.page, {
                [css.isHovered]: isHovered,
            })}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
        >
            {quickReply && <div className={css.quickReply}> {quickReply} </div>}
            <div className={css.actionsWrapper}>
                <div className={css.actions}>
                    {isActionDisplayed(ActionName.Bold) && (
                        <Bold {...actionsProps} />
                    )}
                    {isActionDisplayed(ActionName.Italic) && (
                        <Italic {...actionsProps} />
                    )}
                    {isActionDisplayed(ActionName.Underline) && (
                        <Underline {...actionsProps} />
                    )}
                    {isActionDisplayed(ActionName.Link) && (
                        <AddLink
                            {...actionsProps}
                            entityKey={linkEntityKey}
                            isOpen={linkIsOpen}
                            url={linkUrl}
                            text={linkText}
                            onUrlChange={onLinkUrlChange}
                            onTextChange={onLinkTextChange}
                            target={linkTarget}
                            onTargetChange={onLinkTargetChange}
                            onOpen={onLinkOpen}
                            onClose={onLinkClose}
                            getWorkflowVariables={getWorkflowVariables}
                        />
                    )}

                    {isActionDisplayed(ActionName.Image) && (
                        <AddImage
                            {...actionsProps}
                            attachments={attachments}
                            uploadType={uploadType}
                        />
                    )}
                    {/* Do not display `insert Video` by default if `displayedActions` prop is not set. */}
                    {isActionDisplayed(ActionName.Video) &&
                        displayedActions && <AddVideo {...actionsProps} />}
                    {isActionDisplayed(ActionName.Emoji) && (
                        <AddEmoji {...actionsProps} />
                    )}
                    {isActionDisplayed(ActionName.ProductPicker) &&
                        shopifyIntegrations.size > 0 && (
                            <AddProductLink {...actionsProps} />
                        )}
                    {/* Do not display `insert Discount Code` by default if `displayedActions` prop is not set. */}
                    {isActionDisplayed(ActionName.DiscountCodePicker) &&
                        displayedActions &&
                        shopifyIntegrations.size > 0 && (
                            <AddDiscountCode {...actionsProps} />
                        )}
                    {isActionDisplayed(ActionName.ContactCaptureForm) &&
                        onContactFormOpenChange && (
                            <ContactFormCaptureFormIconButton
                                onOpenChange={onContactFormOpenChange}
                                isDisabled={!contactFormButtonEnabled}
                            />
                        )}
                    {buttons?.map(renderButton)}

                    <div className={css.hoverOverlay}>
                        Add files as attachments
                    </div>

                    <div className={css.rightSection}>
                        {countCharacters && (
                            <span className={css.maxLength}>
                                {`${
                                    editorState
                                        .getCurrentContent()
                                        .getPlainText().length
                                } characters`}
                            </span>
                        )}
                        {typeof maxLength === 'number' && (
                            <span className={css.maxLength}>
                                {
                                    editorState
                                        .getCurrentContent()
                                        .getPlainText().length
                                }
                                /{maxLength}
                            </span>
                        )}
                        {isActionDisplayed(ActionName.WorkflowVariable) &&
                            displayedActions && (
                                <WorkflowVariablePicker
                                    onSelect={handleVariableSelection}
                                />
                            )}

                        {isActionDisplayed(ActionName.GuidanceVariable) &&
                            displayedActions && (
                                <GuidanceVariablePicker
                                    onSelect={handleGuidanceVariableSelection}
                                />
                            )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Toolbar
