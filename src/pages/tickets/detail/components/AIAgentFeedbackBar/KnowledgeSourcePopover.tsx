import { memo, ReactNode, useCallback, useMemo, useRef, useState } from 'react'

import { Popover } from 'components/Popover'
import { useTimeout } from 'hooks/useTimeout'
import KnowledgeSourceIcon from 'pages/tickets/detail/components/AIAgentFeedbackBar/KnowledgeSourceIcon'
import css from 'pages/tickets/detail/components/AIAgentFeedbackBar/KnowledgeSourcePopover.less'
import { AiAgentKnowledgeResourceTypeEnum } from 'pages/tickets/detail/components/AIAgentFeedbackBar/types'
import { mapToKnowledgeSourceType } from 'pages/tickets/detail/components/AIAgentFeedbackBar/utils'
import { stripHTML } from 'utils'

type KnowledgeSourcePopoverProps = {
    url: string
    title: string
    content: string
    type: AiAgentKnowledgeResourceTypeEnum
    id: string
    children: (
        ref: React.RefObject<HTMLElement>,
        eventHandlers: {
            onMouseOver: (e: React.MouseEvent) => void
            onMouseOut: (e: React.MouseEvent) => void
        },
    ) => ReactNode
    onClick?: (e: React.MouseEvent) => void
}

const KnowledgeSourcePopover = ({
    url,
    title,
    content,
    type,
    children,
    onClick,
}: KnowledgeSourcePopoverProps) => {
    const triggerRef = useRef<HTMLElement>(null)
    const [isOpen, setIsOpen] = useState(false)
    const [setTimeout, clearTimeout] = useTimeout()

    const { href, popoverTitle, body } = useMemo(() => {
        const showBody = [
            AiAgentKnowledgeResourceTypeEnum.GUIDANCE,
            AiAgentKnowledgeResourceTypeEnum.MACRO,
            AiAgentKnowledgeResourceTypeEnum.ARTICLE,
        ].includes(type)

        return {
            href: url ?? '',
            popoverTitle: title || '',
            body: showBody && content ? stripHTML(content) : null,
        }
    }, [url, title, content, type])

    const openPopover = useCallback(() => {
        clearTimeout()
        setTimeout(() => setIsOpen(true), 100)
    }, [setTimeout, clearTimeout])

    const closePopover = useCallback(() => {
        clearTimeout()
        setTimeout(() => setIsOpen(false), 100)
    }, [setTimeout, clearTimeout])

    const eventHandlers = useMemo(
        () => ({
            onMouseOver: openPopover,
            onMouseOut: closePopover,
        }),
        [openPopover, closePopover],
    )
    return (
        <>
            {children(triggerRef, eventHandlers)}

            {triggerRef.current && (
                <Popover
                    placement="top-end"
                    isOpen={isOpen}
                    setIsOpen={setIsOpen}
                    shiftOptions={{ padding: 8 }}
                    target={triggerRef}
                    footer={false}
                    offsetValue={8}
                    className={css.popoverWrapper}
                >
                    <a
                        href={!href || !!onClick ? undefined : href}
                        target="_blank"
                        rel="noreferrer noopener"
                        className={css.popover}
                        onMouseEnter={openPopover}
                        onMouseLeave={closePopover}
                        onClick={onClick}
                    >
                        <div className={css.type}>
                            <KnowledgeSourceIcon
                                type={mapToKnowledgeSourceType(type)}
                                withLabel
                            />
                        </div>
                        <div className={css.title}>{popoverTitle}</div>
                        {body && (
                            <div className={css.body}>
                                <span>{body}</span>
                            </div>
                        )}
                    </a>
                </Popover>
            )}
        </>
    )
}

export default memo(KnowledgeSourcePopover)
