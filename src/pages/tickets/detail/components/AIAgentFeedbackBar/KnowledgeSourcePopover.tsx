import { memo, ReactNode, useCallback, useMemo, useRef, useState } from 'react'

import { Popover } from 'components/Popover'
import { useTimeout } from 'hooks/useTimeout'
import KnowledgeSourceIcon from 'pages/tickets/detail/components/AIAgentFeedbackBar/KnowledgeSourceIcon'
import css from 'pages/tickets/detail/components/AIAgentFeedbackBar/KnowledgeSourcePopover.less'
import {
    AiAgentKnowledgeResourceTypeEnum,
    KnowledgeResource,
} from 'pages/tickets/detail/components/AIAgentFeedbackBar/types'
import { mapToKnowledgeSourceType } from 'pages/tickets/detail/components/AIAgentFeedbackBar/utils'
import { stripHTML } from 'utils'

type KnowledgeSourcePopoverProps = {
    resource: KnowledgeResource
    children: (
        ref: React.RefObject<HTMLElement>,
        eventHandlers: {
            onMouseOver: (e: React.MouseEvent) => void
            onMouseOut: (e: React.MouseEvent) => void
        },
    ) => ReactNode
}

const KnowledgeSourcePopover = ({
    resource,
    children,
}: KnowledgeSourcePopoverProps) => {
    const triggerRef = useRef<HTMLElement>(null)
    const [isOpen, setIsOpen] = useState(false)
    const [setTimeout, clearTimeout] = useTimeout()

    const { href, title, body } = useMemo(() => {
        const { metadata, resource: res } = resource
        const showBody = [
            AiAgentKnowledgeResourceTypeEnum.GUIDANCE,
            AiAgentKnowledgeResourceTypeEnum.MACRO,
            AiAgentKnowledgeResourceTypeEnum.ARTICLE,
        ].includes(res.resourceType as AiAgentKnowledgeResourceTypeEnum)

        return {
            href: metadata?.url ?? '',
            title: metadata?.title ?? '',
            body:
                showBody && metadata?.content
                    ? stripHTML(metadata.content)
                    : null,
        }
    }, [resource])

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
                        href={!href ? undefined : href}
                        target="_blank"
                        rel="noreferrer noopener"
                        className={css.popover}
                        onMouseEnter={openPopover}
                        onMouseLeave={closePopover}
                    >
                        <div className={css.type}>
                            <KnowledgeSourceIcon
                                type={mapToKnowledgeSourceType(
                                    resource.resource.resourceType,
                                )}
                                withLabel
                            />
                        </div>
                        <div className={css.title}>{title}</div>
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
