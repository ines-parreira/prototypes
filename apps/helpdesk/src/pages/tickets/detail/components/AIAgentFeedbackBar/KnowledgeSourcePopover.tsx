import { memo, ReactNode, useCallback, useMemo, useRef, useState } from 'react'

import { useTimeout } from '@repo/hooks'

import { Popover } from 'components/Popover'
import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import { useGetGuidancesAvailableActions } from 'pages/aiAgent/components/GuidanceEditor/useGetGuidancesAvailableActions'
import { guidanceVariables } from 'pages/aiAgent/components/GuidanceEditor/variables'
import KnowledgeSourceIcon from 'pages/tickets/detail/components/AIAgentFeedbackBar/KnowledgeSourceIcon'
import css from 'pages/tickets/detail/components/AIAgentFeedbackBar/KnowledgeSourcePopover.less'
import { AiAgentKnowledgeResourceTypeEnum } from 'pages/tickets/detail/components/AIAgentFeedbackBar/types'
import {
    mapToKnowledgeSourceType,
    parseKnowledgeResourceContent,
} from 'pages/tickets/detail/components/AIAgentFeedbackBar/utils'
import { stripHTML } from 'utils'

type KnowledgeSourcePopoverProps = {
    url: string
    title: string
    content: string
    knowledgeResourceType: AiAgentKnowledgeResourceTypeEnum
    id: string
    children: (
        ref: React.RefObject<HTMLElement>,
        eventHandlers: {
            onMouseOver: (e: React.MouseEvent) => void
            onMouseOut: (e: React.MouseEvent) => void
        },
    ) => ReactNode
    onClick?: (e: React.MouseEvent) => void
    shopName: string
    shopType: string
    forceShowBody?: boolean
}

const KnowledgeSourcePopover = ({
    url,
    title,
    content,
    knowledgeResourceType,
    children,
    onClick,
    shopName,
    shopType,
    forceShowBody = false,
}: KnowledgeSourcePopoverProps) => {
    const triggerRef = useRef<HTMLElement>(null)
    const [isOpen, setIsOpen] = useState(false)
    const [setTimeout, clearTimeout] = useTimeout()

    const enableKnowledgeManagementFromTicketView = useFlag(
        FeatureFlagKey.EnableKnowledgeManagementFromTicketView,
    )

    const { guidanceActions, isLoading: isLoadingActions } =
        useGetGuidancesAvailableActions(shopName, shopType)

    const { href, popoverTitle, body } = useMemo(() => {
        const showBody = [
            AiAgentKnowledgeResourceTypeEnum.GUIDANCE,
            AiAgentKnowledgeResourceTypeEnum.ARTICLE,
        ].includes(knowledgeResourceType)

        return {
            href: url ?? '',
            popoverTitle: title || '',
            body:
                (showBody || forceShowBody) && content
                    ? parseKnowledgeResourceContent(
                          stripHTML(content)!,
                          guidanceVariables,
                          guidanceActions,
                      )
                    : null,
        }
    }, [
        url,
        title,
        content,
        knowledgeResourceType,
        guidanceActions,
        forceShowBody,
    ])

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
                        href={
                            !href ||
                            (enableKnowledgeManagementFromTicketView &&
                                [
                                    AiAgentKnowledgeResourceTypeEnum.GUIDANCE,
                                    AiAgentKnowledgeResourceTypeEnum.ARTICLE,
                                ].includes(knowledgeResourceType))
                                ? undefined
                                : href
                        }
                        target="_blank"
                        rel="noreferrer noopener"
                        className={css.popover}
                        onMouseEnter={openPopover}
                        onMouseLeave={closePopover}
                        onClick={onClick}
                    >
                        <div className={css.type}>
                            <KnowledgeSourceIcon
                                type={mapToKnowledgeSourceType(
                                    knowledgeResourceType,
                                )}
                                withLabel
                            />
                        </div>
                        <div className={css.title}>{popoverTitle}</div>
                        {body && !isLoadingActions && (
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
