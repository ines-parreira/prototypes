import React, {useState} from 'react'
import {Popover, PopoverBody} from 'reactstrap'
import Button from 'pages/common/components/button/Button'
import {sanitizeHtmlDefault} from 'utils/html'
import {useAppNode} from 'appNode'

import css from './PredefinedMessageItem.less'

type Props = {
    title: string
    content: string
    id: number
    onMessageSelect: (message: string) => void
}

export const PredefinedMessageItem = ({
    id,
    content,
    title,
    onMessageSelect,
}: Props) => {
    const appNode = useAppNode()
    const [isPreviewOpen, setIsPreviewOpen] = useState(false)

    return (
        <>
            <Button
                intent="secondary"
                id={`template-button-${id}`}
                onClick={() => onMessageSelect(content)}
                onMouseEnter={() => {
                    setIsPreviewOpen(true)
                }}
                onMouseLeave={() => setIsPreviewOpen(false)}
                size="small"
            >
                {title}
            </Button>

            <Popover
                target={`template-button-${id}`}
                placement="top"
                container={appNode ?? undefined}
                trigger="legacy"
                isOpen={isPreviewOpen}
                popperClassName={css.popover}
            >
                <PopoverBody className={css.PopoverBody}>
                    <span
                        dangerouslySetInnerHTML={{
                            __html: sanitizeHtmlDefault(content),
                        }}
                    />
                </PopoverBody>
            </Popover>
        </>
    )
}
