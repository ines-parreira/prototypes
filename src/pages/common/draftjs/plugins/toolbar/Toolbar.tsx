import React, {DragEvent, ReactNode, useState} from 'react'
import classnames from 'classnames'

import Button from 'pages/common/components/button/Button'

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
import {ActionInjectedProps, ActionName} from './types'
import {useToolbarContext} from './ToolbarContext'

import css from './Toolbar.less'

import {isDisplayedAction} from './index'

type Props = {
    buttons?: ReactNode[]
    attachFiles: (T: Array<Blob>) => void
    canDropFiles: boolean
    displayedActions?: ActionName[]
    quickReply: ReactNode
    attachments?: File[]
    linkEntityKey?: string
    linkIsOpen: boolean
    linkUrl: string
    linkText: string
    onLinkUrlChange: (url: string) => void
    onLinkTextChange: (text: string) => void
    onLinkOpen: () => void
    onLinkClose: () => void
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
    linkText,
    onLinkUrlChange,
    onLinkTextChange,
    onLinkOpen,
    onLinkClose,
}: Props) => {
    const [isHovered, setIsHovered] = useState(false)

    const {shopifyIntegrations} = useToolbarContext()

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

    const isActionDisplayed = (name: ActionName) =>
        isDisplayedAction(name, displayedActions)

    const actionsProps = {getEditorState, setEditorState}

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
                            onOpen={onLinkOpen}
                            onClose={onLinkClose}
                        />
                    )}
                    {isActionDisplayed(ActionName.Image) && (
                        <AddImage {...actionsProps} attachments={attachments} />
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
                </div>
                {buttons?.map(renderButton)}

                <div className={css.hoverOverlay}>Add files as attachments</div>
            </div>
        </div>
    )
}

export default Toolbar
