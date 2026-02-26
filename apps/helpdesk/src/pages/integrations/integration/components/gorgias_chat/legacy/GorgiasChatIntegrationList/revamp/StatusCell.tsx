import { useCallback, useMemo } from 'react'

import type { Map } from 'immutable'
import { NavLink } from 'react-router-dom'

import {
    Color,
    Icon,
    IconName,
    IconSize,
    Tag,
    TagColor,
    Text,
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@gorgias/axiom'

import { useGorgiasChatIntegrationStatusData } from 'pages/integrations/integration/hooks/useGorgiasChatIntegrationStatusData'

import {
    GorgiasChatCreationWizardStatus,
    GorgiasChatStatusEnum,
    IntegrationType,
} from '../../../../../../../../models/integration/types'
import { Tab } from '../../../../../types'

import css from './StatusCell.less'

const GorgiasChatIntegrationStatusFeedbackMapping = {
    [GorgiasChatStatusEnum.INSTALLED]: 'Installed',
    [GorgiasChatStatusEnum.ONLINE]: 'Online',
    [GorgiasChatStatusEnum.OFFLINE]: 'Offline',
    [GorgiasChatStatusEnum.HIDDEN]: 'Hidden',
    [GorgiasChatStatusEnum.HIDDEN_OUTSIDE_BUSINESS_HOURS]: 'Hidden',
    [GorgiasChatStatusEnum.NOT_INSTALLED]: 'Not installed',
}

type StatusCellProps = {
    chat: Map<any, any>
    loading: Map<any, any>
}

export function StatusCell({ chat, loading }: StatusCellProps) {
    const chatIntegrationId = chat.get('id') as number
    const wizardStatus: GorgiasChatCreationWizardStatus = chat.getIn([
        'meta',
        'wizard',
        'status',
    ])

    const isLoadingIntegrations = loading.get('integrations', true) as boolean

    const { chatStatus, isChatStatusLoading, isChatStatusError } =
        useGorgiasChatIntegrationStatusData(chat, isLoadingIntegrations)

    const baseLink = `/app/settings/channels/${IntegrationType.GorgiasChat}/${chatIntegrationId}`
    const preferencesLink = `${baseLink}/${Tab.Preferences}`

    const chatIsHiddenOutsideBusinessHours = useMemo(
        () =>
            chatStatus === GorgiasChatStatusEnum.HIDDEN_OUTSIDE_BUSINESS_HOURS,
        [chatStatus],
    )

    const chatIsPublishedButNotInstalled = useMemo(
        () =>
            chatStatus === GorgiasChatStatusEnum.NOT_INSTALLED &&
            wizardStatus === GorgiasChatCreationWizardStatus.Published,
        [chatStatus, wizardStatus],
    )

    const getStatusTag = useCallback(
        (chatStatus: GorgiasChatStatusEnum) => {
            let tagColor: TagColor
            let leadingSlotIcon: JSX.Element

            switch (chatStatus) {
                case GorgiasChatStatusEnum.NOT_INSTALLED:
                    if (chatIsPublishedButNotInstalled) {
                        tagColor = TagColor.Orange
                        leadingSlotIcon = <Icon name={IconName.OctagonError} />
                        break
                    }
                    tagColor = TagColor.Red
                    leadingSlotIcon = <Icon name={IconName.Close} />
                    break
                case GorgiasChatStatusEnum.ONLINE:
                case GorgiasChatStatusEnum.INSTALLED:
                    tagColor = TagColor.Green
                    leadingSlotIcon = (
                        <span className={css.iconSuccess}>
                            <Icon
                                size={IconSize.Xs}
                                color={Color.Green}
                                name={IconName.ShapeCircle}
                            />
                        </span>
                    )
                    break
                case GorgiasChatStatusEnum.HIDDEN_OUTSIDE_BUSINESS_HOURS:
                case GorgiasChatStatusEnum.HIDDEN:
                case GorgiasChatStatusEnum.OFFLINE:
                    tagColor = TagColor.Grey
                    leadingSlotIcon = (
                        <span className={css.iconNeutral}>
                            <Icon
                                size={IconSize.Xs}
                                color={Color.Grey}
                                name={IconName.ShapeCircle}
                            />
                        </span>
                    )
                    break
            }

            return (
                <Tag color={tagColor} leadingSlot={leadingSlotIcon}>
                    {chatIsPublishedButNotInstalled
                        ? 'Not detected'
                        : GorgiasChatIntegrationStatusFeedbackMapping[
                              chatStatus
                          ]}
                </Tag>
            )
        },
        [chatIsPublishedButNotInstalled],
    )

    const Wrapper = ({ children }: { children?: JSX.Element }) => {
        return <div id={`chat-status-${chatIntegrationId}`}>{children}</div>
    }

    if (isLoadingIntegrations || isChatStatusLoading) {
        return (
            <Wrapper>
                <span>Loading...</span>
            </Wrapper>
        )
    }

    if (isChatStatusError) {
        return (
            <Wrapper>
                <span>Status unavailable</span>
            </Wrapper>
        )
    }

    if (chatStatus) {
        return (
            <Wrapper>
                <Tooltip
                    placement="top"
                    delay={100}
                    isDisabled={
                        !(
                            chatIsHiddenOutsideBusinessHours ||
                            chatIsPublishedButNotInstalled
                        )
                    }
                >
                    <TooltipTrigger>
                        <span role="button">{getStatusTag(chatStatus)}</span>
                    </TooltipTrigger>
                    <TooltipContent>
                        {chatIsHiddenOutsideBusinessHours && (
                            <Text size="md" variant="medium">
                                Chat is{' '}
                                <NavLink
                                    to={preferencesLink}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    hidden outside
                                    <br />
                                    business hours
                                </NavLink>
                            </Text>
                        )}

                        {chatIsPublishedButNotInstalled && (
                            <Text size="md" variant="medium">
                                We couldn&apos;t detect the chat widget on your
                                website in the last 72 hours. Please check that
                                it&apos;s installed correctly and live on your
                                site.
                            </Text>
                        )}
                    </TooltipContent>
                </Tooltip>
            </Wrapper>
        )
    }

    return <Wrapper></Wrapper>
}
