import { useRef, useState } from 'react'

import classnames from 'classnames'

import { Chip } from '@gorgias/axiom'

import { Popover } from 'components/Popover'
import { sanitizeHtmlDefault } from 'utils/html'

import { PlaygroundTemplateMessage } from '../../types'

import css from './PlaygroundPredefinedMessages.less'

const TEMPLATE_MESSAGES: PlaygroundTemplateMessage[] = [
    {
        id: 1,
        title: 'Do you offer discounts?',
        content:
            "Hi there,<br/>I hope you're doing well! I've been browsing some products on your website. Before I make a purchase, I wanted to check if you currently have any discounts or special offers available. Could you please provide some information on this?<br/>Best regards",
    },
    {
        id: 2,
        title: 'Where is my order?',
        content:
            "Hi there,<br/>I hope you're doing well! I recently placed an order on your website. I'm excited to receive my items and wanted to check on the status of my order. Could you please provide an update?<br/>Best regards",
    },
    {
        id: 3,
        title: 'Do you ship internationally?',
        content:
            "Hi there,<br/>I hope you're doing well! I'm interested in purchasing some products from your website. Before I proceed, I wanted to know if you offer international shipping. Could you please let me know if you ship to France and any details related to international shipping costs and delivery times?<br/>Best regards",
    },
    {
        id: 4,
        title: 'Do you offer a warranty?',
        content:
            "Hi there,<br/>I hope you're doing well! I've been eyeing some products on your website. Before I hit that 'buy' button, I wanted to check in about your warranty policy, what do you offer! <br/>Best regards",
    },
]

type Props = {
    onMessageSelect: (predefinedMessage: PlaygroundTemplateMessage) => void
    isVisible?: boolean
}

const PlaygroundPredefinedMessage = ({
    message,
    onMessageSelect,
}: {
    message: PlaygroundTemplateMessage
    onMessageSelect: (message: PlaygroundTemplateMessage) => void
}) => {
    const ref = useRef<HTMLDivElement>(null)
    const [isPreviewOpen, setIsPreviewOpen] = useState(false)

    return (
        <>
            <div
                ref={ref}
                onMouseEnter={() => {
                    setIsPreviewOpen(true)
                }}
                onMouseLeave={() => setIsPreviewOpen(false)}
            >
                <Chip
                    label={message.title}
                    onClick={() => onMessageSelect(message)}
                    id={`predefined-message-chip-${message.id}`}
                />
            </div>
            <Popover
                target={ref}
                isOpen={isPreviewOpen}
                placement="top-end"
                setIsOpen={setIsPreviewOpen}
                footer={false}
                className={css.popover}
            >
                <span
                    dangerouslySetInnerHTML={{
                        __html: sanitizeHtmlDefault(message.content),
                    }}
                />
            </Popover>
        </>
    )
}

export const PlaygroundPredefinedMessages = ({
    onMessageSelect,
    isVisible = true,
}: Props) => {
    const listRef = useRef<HTMLUListElement>(null)
    const isDragging = useRef(false)
    const startX = useRef(0)
    const scrollLeft = useRef(0)
    const hasMoved = useRef(false)

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!listRef.current) return
        isDragging.current = true
        hasMoved.current = false
        startX.current = e.pageX - listRef.current.offsetLeft
        scrollLeft.current = listRef.current.scrollLeft
    }

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging.current || !listRef.current) return
        e.preventDefault()
        const x = e.pageX - listRef.current.offsetLeft
        const walk = (x - startX.current) * 2
        listRef.current.scrollLeft = scrollLeft.current - walk
        if (Math.abs(x - startX.current) > 3) {
            hasMoved.current = true
        }
    }

    const handleMouseUp = (e: React.MouseEvent) => {
        isDragging.current = false
        if (hasMoved.current) {
            e.preventDefault()
            e.stopPropagation()
            const target = e.target as HTMLElement
            if (target.tagName === 'BUTTON' || target.closest('button')) {
                const button =
                    target.tagName === 'BUTTON'
                        ? target
                        : (target.closest('button') as HTMLElement)
                button.addEventListener(
                    'click',
                    (clickEvent) => {
                        clickEvent.preventDefault()
                        clickEvent.stopPropagation()
                    },
                    { once: true, capture: true },
                )
            }
        }
    }

    const handleMouseLeave = () => {
        isDragging.current = false
    }

    return (
        <div
            className={classnames(css.container, {
                [css.hidden]: !isVisible,
            })}
        >
            <ul
                ref={listRef}
                className={css.list}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
            >
                {TEMPLATE_MESSAGES.map((message) => (
                    <li key={message.id}>
                        <PlaygroundPredefinedMessage
                            message={message}
                            onMessageSelect={onMessageSelect}
                        />
                    </li>
                ))}
            </ul>
        </div>
    )
}
