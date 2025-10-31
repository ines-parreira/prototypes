import React, { ReactNode, RefObject } from 'react'

import cn from 'classnames'

import { LegacyTooltip as Tooltip } from '@gorgias/axiom'

import KnowledgeSourceIcon from './KnowledgeSourceIcon'
import KnowledgeSourcePopover from './KnowledgeSourcePopover'
import { AiAgentKnowledgeResourceTypeEnum } from './types'
import { mapToKnowledgeSourceType } from './utils'

import css from './KnowledgeSourceRenderer.less'

type KnowledgeSourceRendererProps = {
    id: string
    resourceType: AiAgentKnowledgeResourceTypeEnum
    title: string
    content?: string
    url?: string
    helpCenterId?: string
    shopName: string
    shopType: string
    isDeleted?: boolean
    onClick?: () => void
    className?: string
    iconClassName?: string
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
    title,
    content,
    url,
    helpCenterId,
    shopName,
    shopType,
    isDeleted = false,
    onClick,
    className,
    iconClassName,
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
        helpCenterId,
        shopName,
        shopType,
        onClick: !isDeleted ? onClick : undefined,
        forceShowBody,
    }

    const icon = (
        <KnowledgeSourceIcon
            type={mapToKnowledgeSourceType(resourceType)}
            badgeIconClassname={iconClassName}
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
