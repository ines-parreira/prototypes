import type { MouseEvent } from 'react'

import cn from 'classnames'

import {
    LegacyIconButton as IconButton,
    Skeleton,
    LegacyTooltip as Tooltip,
} from '@gorgias/axiom'

import css from 'pages/tickets/detail/components/AIAgentFeedbackBar/AIAgentSimplifiedFeedback.less'
import { useKnowledgeSourceSideBar } from 'pages/tickets/detail/components/AIAgentFeedbackBar/hooks/useKnowledgeSourceSideBar/useKnowledgeSourceSideBar'
import KnowledgeSourceRenderer from 'pages/tickets/detail/components/AIAgentFeedbackBar/KnowledgeSourceRenderer'
import type {
    AiAgentKnowledgeResourceTypeEnum,
    KnowledgeResource,
} from 'pages/tickets/detail/components/AIAgentFeedbackBar/types'
import { AiAgentBinaryFeedbackEnum } from 'pages/tickets/detail/components/AIAgentFeedbackBar/types'
import { knowledgeResourceShouldBeLink } from 'pages/tickets/detail/components/AIAgentFeedbackBar/utils'

const OPEN_IN_NEW_TAB_ICON = 'open_in_new'
const THUMB_DOWN = 'thumb_down'
const THUMB_UP = 'thumb_up'

const THUMB_DOWN_TOOLTIP =
    "Don't prioritize this knowledge source in requests like this"
const THUMB_UP_TOOLTIP =
    'Prioritize this knowledge source in requests like this'

type KnowledgeSourceProps = {
    resource: KnowledgeResource
    onIconClick: (
        value: AiAgentBinaryFeedbackEnum,
        resource: KnowledgeResource,
    ) => void
    onKnowledgeResourceClick?: (
        resourceId: string,
        resourceType: AiAgentKnowledgeResourceTypeEnum,
        resourceSetId: string,
    ) => void
    shopName: string
    shopType: string
    isMetadataLoading?: boolean
}

type ThumbButtonProps = {
    id: string
    isSelected: boolean
    icon: string
    className?: string
    tooltip: string
    onClick: (e: MouseEvent<HTMLButtonElement>) => void
    isDisabled?: boolean
}

const KnowledgeSourceFeedback = ({
    resource,
    onIconClick,
    onKnowledgeResourceClick,
    shopName,
    shopType,
    isMetadataLoading,
}: KnowledgeSourceProps) => {
    const { openPreview } = useKnowledgeSourceSideBar()

    const isDeleted = resource.metadata?.isDeleted || false
    const isLink = knowledgeResourceShouldBeLink(
        resource.resource.resourceType as AiAgentKnowledgeResourceTypeEnum,
    )

    const href = isLink ? resource.metadata?.url : undefined

    const isPositive = !isDeleted
        ? resource.feedback?.feedbackValue === AiAgentBinaryFeedbackEnum.UP
        : false
    const isNegative = !isDeleted
        ? resource.feedback?.feedbackValue === AiAgentBinaryFeedbackEnum.DOWN
        : false

    const popoverProps = {
        id: resource.resource.resourceId,
        url: resource.metadata?.url || '',
        title: resource.metadata?.title || resource.resource?.resourceTitle,
        content: resource.metadata?.content,
        knowledgeResourceType: resource.resource
            .resourceType as AiAgentKnowledgeResourceTypeEnum,
        helpCenterId: resource.resource.resourceSetId,
        shopName,
        shopType,
        resourceVersionId: resource.metadata?.versionId,
    }

    const onClick = () => {
        if (isMetadataLoading) {
            return
        }

        if (isLink || isDeleted) {
            return
        }

        openPreview(popoverProps)
    }

    const handleLinkClick = () => {
        if (isLink && !isDeleted && onKnowledgeResourceClick) {
            onKnowledgeResourceClick(
                resource.resource.resourceId,
                resource.resource
                    .resourceType as AiAgentKnowledgeResourceTypeEnum,
                resource.resource.resourceSetId || '',
            )
        }
    }

    return (
        <div className={css.source}>
            <KnowledgeSourceRenderer
                id={`source-feedback-${resource.resource.resourceId}-${resource.resource.resourceType}`}
                resourceType={
                    resource.resource
                        .resourceType as AiAgentKnowledgeResourceTypeEnum
                }
                title={
                    resource.metadata?.title || resource.resource?.resourceTitle
                }
                content={resource.metadata?.content}
                url={resource.metadata?.url}
                helpCenterId={resource.resource.resourceSetId}
                shopName={shopName}
                shopType={shopType}
                isDeleted={isDeleted}
                onClick={onClick}
                className={css.sourceName}
                renderCustomContent={({ icon, title: renderedTitle }) => (
                    <a
                        href={isLink && !isDeleted ? href : undefined}
                        id={`knowledge-source-${resource.resource.id}`}
                        target="_blank"
                        rel="noreferrer noopener"
                        className={cn(css.sourceLink, {
                            [css.deleted]: isDeleted,
                            [css.hasLink]: !isDeleted,
                        })}
                        onClick={handleLinkClick}
                    >
                        {isMetadataLoading ? (
                            <div className={css.iconSkeleton}>
                                <Skeleton width={20} height={20} circle />
                            </div>
                        ) : (
                            icon
                        )}
                        <span>{renderedTitle}</span>
                        {!!href && (
                            <i
                                className={cn(
                                    css.openInNewTabIcon,
                                    'material-icons',
                                )}
                            >
                                {OPEN_IN_NEW_TAB_ICON}
                            </i>
                        )}
                    </a>
                )}
            />
            <ThumbButton
                id={resource.resource.id}
                tooltip={THUMB_UP_TOOLTIP}
                isSelected={isPositive}
                className={cn({ [css.positiveFeedback]: isPositive })}
                icon={THUMB_UP}
                onClick={() =>
                    onIconClick(AiAgentBinaryFeedbackEnum.UP, resource)
                }
                isDisabled={isDeleted}
            />
            <ThumbButton
                id={resource.resource.id}
                tooltip={THUMB_DOWN_TOOLTIP}
                isSelected={isNegative}
                className={cn({ [css.negativeFeedback]: isNegative })}
                icon={THUMB_DOWN}
                onClick={() =>
                    onIconClick(AiAgentBinaryFeedbackEnum.DOWN, resource)
                }
                isDisabled={isDeleted}
            />
        </div>
    )
}

const ThumbButton = ({
    id,
    isSelected,
    icon,
    className,
    tooltip,
    onClick,
    isDisabled,
}: ThumbButtonProps) => {
    const thumbId = `${icon}-${id}`
    return (
        <>
            <IconButton
                icon={icon}
                isDisabled={isDisabled}
                intent="secondary"
                iconClassName={
                    isSelected ? 'material-icons' : 'material-icons-outlined'
                }
                size="small"
                className={cn(css.button, className)}
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => onClick(e)}
                id={thumbId}
            />

            <Tooltip target={thumbId}>{tooltip}</Tooltip>
        </>
    )
}

export default KnowledgeSourceFeedback
