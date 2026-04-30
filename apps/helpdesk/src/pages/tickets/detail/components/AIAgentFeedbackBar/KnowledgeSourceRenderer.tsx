import type { ReactNode, RefObject } from 'react'
import React from 'react'

import cn from 'classnames'

import type { IconSize } from '@gorgias/axiom'
import { LegacyTooltip as Tooltip } from '@gorgias/axiom'

import KnowledgeSourceIcon from './KnowledgeSourceIcon'
import KnowledgeSourcePopover from './KnowledgeSourcePopover'
import type { AiAgentKnowledgeResourceTypeEnum } from './types'
import { mapToKnowledgeSourceType } from './utils'

import css from './KnowledgeSourceRenderer.less'

type KnowledgeSourceRendererProps = {
    id: string
    resourceType: AiAgentKnowledgeResourceTypeEnum
    origin?: string | null
    title: string
    content?: string
    url?: string
    helpCenterId?: string
    shopName: string
    shopType: string
    isDeleted?: boolean
    isDraft?: boolean
    onClick?: () => void
    className?: string
    iconClassName?: string
    iconSize?: IconSize
    children?: ReactNode
    renderCustomContent?: (props: {
        icon: ReactNode
        isDeleted: boolean
        title: string
        url?: string
    }) => ReactNode
    forceShowBody?: boolean
}

const KnowledgeSourceRenderer = ({
    id,
    resourceType,
    origin,
    title,
    content,
    url,
    helpCenterId,
    shopName,
    shopType,
    isDeleted = false,
    isDraft = false,
    onClick,
    className,
    iconClassName,
    iconSize,
    children,
    renderCustomContent,
    forceShowBody = false,
}: KnowledgeSourceRendererProps) => {
    const popoverProps = {
        id,
        url: url || '',
        title,
        content: content || '',
        knowledgeResourceType: resourceType,
        origin,
        helpCenterId,
        shopName,
        shopType,
        onClick: !isDeleted ? onClick : undefined,
        forceShowBody,
        isDraft,
    }

    const icon = (
        <KnowledgeSourceIcon
            type={mapToKnowledgeSourceType(resourceType, origin)}
            badgeIconClassname={iconClassName}
            iconSize={iconSize}
        />
    )

    const tooltipId = `knowledge-source-${id}`

    return (
        <KnowledgeSourcePopover {...popoverProps}>
            {(ref, eventHandlers) => (
                <span
                    ref={ref as RefObject<HTMLSpanElement>}
                    className={cn(css.knowledgeIconContainer, className, {
                        deleted: isDeleted,
                    })}
                    id={tooltipId}
                    onClick={!isDeleted ? onClick : undefined}
                    {...(!isDeleted && eventHandlers)}
                >
                    {renderCustomContent ? (
                        renderCustomContent({
                            icon,
                            isDeleted,
                            title,
                            url,
                        })
                    ) : (
                        <span>
                            {icon}
                            {children}
                        </span>
                    )}
                    {isDeleted && (
                        <Tooltip target={tooltipId}>
                            Knowledge has been deleted
                        </Tooltip>
                    )}
                </span>
            )}
        </KnowledgeSourcePopover>
    )
}

export default KnowledgeSourceRenderer
