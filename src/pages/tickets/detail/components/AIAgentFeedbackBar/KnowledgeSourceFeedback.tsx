import { MouseEvent, RefObject } from 'react'

import cn from 'classnames'

import { IconButton, Tooltip } from '@gorgias/merchant-ui-kit'

import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import css from 'pages/tickets/detail/components/AIAgentFeedbackBar/AIAgentSimplifiedFeedback.less'
import { useKnowledgeSourceSideBar } from 'pages/tickets/detail/components/AIAgentFeedbackBar/hooks/useKnowledgeSourceSideBar/useKnowledgeSourceSideBar'
import KnowledgeSourceIcon from 'pages/tickets/detail/components/AIAgentFeedbackBar/KnowledgeSourceIcon'
import KnowledgeSourcePopover from 'pages/tickets/detail/components/AIAgentFeedbackBar/KnowledgeSourcePopover'
import {
    AiAgentBinaryFeedbackEnum,
    AiAgentKnowledgeResourceTypeEnum,
    KnowledgeResource,
} from 'pages/tickets/detail/components/AIAgentFeedbackBar/types'
import {
    knowledgeResourceShouldBeLink,
    mapToKnowledgeSourceType,
} from 'pages/tickets/detail/components/AIAgentFeedbackBar/utils'

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
    shopName: string
    shopType: string
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
    shopName,
    shopType,
}: KnowledgeSourceProps) => {
    const { openPreview } = useKnowledgeSourceSideBar()
    const enableKnowledgeManagementFromTicketView = useFlag(
        FeatureFlagKey.EnableKnowledgeManagementFromTicketView,
    )
    const isDeleted = resource.metadata?.isDeleted || false
    const isLink = enableKnowledgeManagementFromTicketView
        ? knowledgeResourceShouldBeLink(
              resource.resource
                  .resourceType as AiAgentKnowledgeResourceTypeEnum,
          )
        : true

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
    }

    const onClick =
        !enableKnowledgeManagementFromTicketView || isLink || isDeleted
            ? undefined
            : () => openPreview(popoverProps)

    return (
        <div className={css.source}>
            <KnowledgeSourcePopover {...popoverProps} onClick={onClick}>
                {(ref, eventHandlers) => (
                    <a
                        href={isLink && !isDeleted ? href : undefined}
                        target="_blank"
                        rel="noreferrer noopener"
                        className={cn(css.sourceName, {
                            [css.deleted]: isDeleted,
                            [css.hasLink]: !!href || !!openPreview,
                        })}
                        ref={ref as RefObject<HTMLAnchorElement>}
                        id={`knowledge-source-${resource.resource.id}`}
                        onClick={onClick}
                        {...(!isDeleted && eventHandlers)}
                    >
                        <KnowledgeSourceIcon
                            type={mapToKnowledgeSourceType(
                                resource.resource
                                    .resourceType as AiAgentKnowledgeResourceTypeEnum,
                            )}
                        />
                        <span>
                            {resource.metadata?.title ||
                                resource.resource?.resourceTitle}
                        </span>
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
                        {isDeleted && (
                            <Tooltip
                                target={`knowledge-source-${resource.resource.id}`}
                            >
                                Knowledge has been deleted
                            </Tooltip>
                        )}
                    </a>
                )}
            </KnowledgeSourcePopover>
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
    isDisabled = false,
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
