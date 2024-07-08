import React, {useState} from 'react'
import {Popover, PopoverBody} from 'reactstrap'
import Button from 'pages/common/components/button/Button'
import {sanitizeHtmlDefault} from 'utils/html'
import {useAppNode} from 'appNode'

import {PlaygroundTemplateMessage} from '../../types'
import css from './PredefinedMessageItem.less'

type Props = {
    message: PlaygroundTemplateMessage
    onMessageSelect: (message: PlaygroundTemplateMessage) => void
}

export const PredefinedMessageItem = ({onMessageSelect, message}: Props) => {
    const appNode = useAppNode()
    const [isPreviewOpen, setIsPreviewOpen] = useState(false)

    return (
        <>
            <Button
                intent="secondary"
                id={`template-button-${message.id}`}
                onClick={() => onMessageSelect(message)}
                onMouseEnter={() => {
                    setIsPreviewOpen(true)
                }}
                onMouseLeave={() => setIsPreviewOpen(false)}
                size="small"
            >
                {message.title}
            </Button>

            <Popover
                target={`template-button-${message.id}`}
                placement="top"
                container={appNode ?? undefined}
                trigger="legacy"
                isOpen={isPreviewOpen}
                popperClassName={css.popover}
            >
                <PopoverBody className={css.PopoverBody}>
                    <span
                        dangerouslySetInnerHTML={{
                            __html: sanitizeHtmlDefault(message.content),
                        }}
                    />
                </PopoverBody>
            </Popover>
        </>
    )
}
