import { useCallback, useMemo } from 'react'

import type { Map } from 'immutable'
import { Link, NavLink } from 'react-router-dom'

import {
    Icon,
    Tag,
    TagColor,
    Text,
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@gorgias/axiom'

import dotErrorCross from 'assets/img/icons/dot-error-cross.svg'
import dotNeutral from 'assets/img/icons/dot-neutral.svg'
import dotSuccess from 'assets/img/icons/dot-success.svg'
import dotWarning from 'assets/img/icons/dot-warning.svg'
import { useGorgiasChatIntegrationStatusData } from 'pages/integrations/integration/hooks/useGorgiasChatIntegrationStatusData'

import {
    GorgiasChatCreationWizardStatus,
    GorgiasChatStatusEnum,
    IntegrationType,
} from '../../../../../../../models/integration/types'
import { Tab } from '../../../../types'

import css from './StatusCell.less'

const GorgiasChatIntegrationStatusFeedbackMapping = {
    [GorgiasChatStatusEnum.INSTALLED]: 'Installed',
    [GorgiasChatStatusEnum.ONLINE]: 'Online',
    [GorgiasChatStatusEnum.OFFLINE]: 'Offline',
    [GorgiasChatStatusEnum.HIDDEN]: 'Hidden',
    [GorgiasChatStatusEnum.HIDDEN_OUTSIDE_BUSINESS_HOURS]: 'Hidden',
    [GorgiasChatStatusEnum.NOT_INSTALLED]: 'Not Installed',
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
    const installationLink = `${baseLink}/${Tab.Installation}`

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
            let tagColor: TagColor = TagColor.Red
            let dot: string = dotErrorCross
            let timer: JSX.Element | null = null

            switch (chatStatus) {
                case GorgiasChatStatusEnum.ONLINE:
                case GorgiasChatStatusEnum.INSTALLED:
                    tagColor = TagColor.Green
                    dot = dotSuccess
                    break
                case GorgiasChatStatusEnum.HIDDEN:
                    tagColor = TagColor.Orange
                    dot = dotWarning
                    break
                case GorgiasChatStatusEnum.HIDDEN_OUTSIDE_BUSINESS_HOURS:
                case GorgiasChatStatusEnum.OFFLINE:
                    tagColor = TagColor.Grey
                    dot = dotNeutral
                    break
            }

            if (
                chatStatus === GorgiasChatStatusEnum.NOT_INSTALLED &&
                wizardStatus === GorgiasChatCreationWizardStatus.Published
            ) {
                timer = <Icon name="timer" />
            }

            return (
                <Tag
                    color={tagColor}
                    leadingSlot={<img alt="status icon" src={dot} />}
                >
                    <div className={css.timerStatus}>
                        {
                            GorgiasChatIntegrationStatusFeedbackMapping[
                                chatStatus
                            ]
                        }
                        {timer}
                    </div>
                </Tag>
            )
        },
        [wizardStatus],
    )

    const Wrapper = ({ children }: { children?: JSX.Element }) => {
        return (
            <div
                className={css.statusCell}
                id={`chat-status-${chatIntegrationId}`}
            >
                {children}
            </div>
        )
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
                                Chat Widget was not seen installed on your
                                website in the past 72 hours. Check its{' '}
                                <Link
                                    to={installationLink}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    installation
                                </Link>{' '}
                                and your website to resolve.
                            </Text>
                        )}
                    </TooltipContent>
                </Tooltip>
            </Wrapper>
        )
    }

    return <Wrapper></Wrapper>
}
