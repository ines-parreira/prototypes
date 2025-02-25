import React, { useCallback, useEffect, useRef } from 'react'

import classNames from 'classnames'
import { useHistory } from 'react-router-dom'

import { Skeleton } from '@gorgias/merchant-ui-kit'

import { AiAgentNotificationType } from 'automate/notifications/types'
import { logEvent, SegmentEvent } from 'common/segment'
import useAppDispatch from 'hooks/useAppDispatch'
import {
    AiAgentOnboardingState,
    OnboardingNotificationState,
    StoreConfiguration,
} from 'models/aiAgent/types'
import { useAiAgentNavigation } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import Button from 'pages/common/components/button/Button'
import PageHeader from 'pages/common/components/PageHeader'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { assetsUrl } from 'utils'

import { WIZARD_UPDATE_QUERY_KEY } from '../../constants'
import { useAiAgentOnboardingNotification } from '../../hooks/useAiAgentOnboardingNotification'
import { useWelcomePageAcknowledgedMutation } from '../../hooks/useWelcomePageAcknowledgedMutation'

import css from './AIAgentWelcomePageView.less'

export type DynamicItem = {
    checked: boolean
    link?: string
}

export type AiAgentWelcomePageProps = {
    accountDomain: string
    shopType: string
    shopName: string
    storeConfiguration?: StoreConfiguration
}

type Props = AiAgentWelcomePageProps &
    (
        | {
              state: 'loading'
          }
        | {
              state: 'static'
          }
        | {
              state: 'dynamic' | 'onboardingWizard'
              emailConnected: DynamicItem
              helpCenterCreated: DynamicItem
              helpCenter20Articles: DynamicItem
              shopifyPermissionUpdated?: DynamicItem
          }
    )

export const AIAgentWelcomePageView = (props: Props) => {
    const { isLoading, createWelcomePageAcknowledged } =
        useWelcomePageAcknowledgedMutation({ shopName: props.shopName })

    const {
        isAdmin,
        isLoading: isLoadingOnboardingNotificationState,
        onboardingNotificationState,
        handleOnSave,
        handleOnSendOrCancelNotification,
        handleOnPerformActionPostReceivedNotification,
        isAiAgentOnboardingNotificationEnabled,
    } = useAiAgentOnboardingNotification({ shopName: props.shopName })

    const dispatch = useAppDispatch()
    const history = useHistory()
    const sameVisitRef = useRef(false)

    const isOnUpdateOnboardingWizard =
        props.state === 'onboardingWizard' &&
        props.storeConfiguration?.wizard?.completedDatetime === null

    const description = {
        static: 'Introducing AI Agent, your team’s newest member for seamless customer interactions who can:',
        dynamic:
            'Prepare AI Agent to automate 60% of your email and contact form tickets by completing these steps',
        onboardingWizard: isOnUpdateOnboardingWizard
            ? 'Prepare AI Agent to automate 60% of your tickets by completing these steps:'
            : 'Prepare AI Agent to automate 60% of your email, Chat and Contact Form tickets by completing these steps:',
    }

    const aiAgentNavigation = useAiAgentNavigation({ shopName: props.shopName })
    const handleOnFinishSetupNotification = useCallback(async () => {
        const isFinishedSetupNotificationAlreadyReceived =
            !!onboardingNotificationState?.finishAiAgentSetupNotificationReceivedDatetime

        if (!isFinishedSetupNotificationAlreadyReceived) {
            handleOnSendOrCancelNotification({
                aiAgentNotificationType:
                    AiAgentNotificationType.FinishAiAgentSetup,
            })
        }

        if (isOnUpdateOnboardingWizard) return

        handleOnSendOrCancelNotification({
            aiAgentNotificationType: AiAgentNotificationType.StartAiAgentSetup,
            isCancel: true,
        })

        await handleOnSave({
            onboardingState: AiAgentOnboardingState.StartedSetup,
        })

        handleOnPerformActionPostReceivedNotification(
            AiAgentNotificationType.StartAiAgentSetup,
        )
    }, [
        handleOnSave,
        handleOnSendOrCancelNotification,
        handleOnPerformActionPostReceivedNotification,
        isOnUpdateOnboardingWizard,
        onboardingNotificationState?.finishAiAgentSetupNotificationReceivedDatetime,
    ])

    const onOnboardingWizardClick = useCallback(() => {
        if (isAdmin) {
            void handleOnFinishSetupNotification()
        }

        logEvent(SegmentEvent.AiAgentWelcomePageCtaClicked, {
            version: 'Dynamic',
            store: props.shopName,
        })

        history.push({
            pathname: aiAgentNavigation.routes.onboardingWizard,
            search: isOnUpdateOnboardingWizard
                ? `?${WIZARD_UPDATE_QUERY_KEY}=true`
                : '',
        })
    }, [
        aiAgentNavigation.routes.onboardingWizard,
        handleOnFinishSetupNotification,
        history,
        isAdmin,
        isOnUpdateOnboardingWizard,
        props.shopName,
    ])

    const onAcknowledgedClick = async () => {
        try {
            await createWelcomePageAcknowledged([
                props.accountDomain,
                props.shopName,
            ])

            logEvent(SegmentEvent.AiAgentWelcomePageCtaClicked, {
                version: props.state === 'dynamic' ? 'Dynamic' : 'Basic',
                store: props.shopName,
            })
        } catch (error) {
            void dispatch(
                notify({
                    message:
                        error instanceof Error
                            ? error.message
                            : 'An unknown error occurred',
                    status: NotificationStatus.Error,
                }),
            )
        }
    }

    useEffect(() => {
        if (props.state === 'loading') return

        logEvent(SegmentEvent.AiAgentWelcomePageViewed, {
            version: props.state === 'static' ? 'Basic' : 'Dynamic',
            store: props.shopName,
        })
    }, [props.state, props.shopName])

    const handleOnStartSetupNotification = useCallback(async () => {
        const isStartedSetup =
            onboardingNotificationState?.onboardingState ===
            AiAgentOnboardingState.StartedSetup

        const isStartedSetupNotificationAlreadyReceived =
            !!onboardingNotificationState?.startAiAgentSetupNotificationReceivedDatetime

        if (
            sameVisitRef.current ||
            isStartedSetup ||
            isStartedSetupNotificationAlreadyReceived
        )
            return

        sameVisitRef.current = true

        handleOnSendOrCancelNotification({
            aiAgentNotificationType: AiAgentNotificationType.MeetAiAgent,
            isCancel: true,
        })

        const isFirstVisit =
            !onboardingNotificationState?.welcomePageVisitedDatetimes &&
            !onboardingNotificationState?.welcomePageVisitedDatetimes?.length

        if (isFirstVisit) {
            handleOnPerformActionPostReceivedNotification(
                AiAgentNotificationType.MeetAiAgent,
            )
        }

        let payload: Partial<OnboardingNotificationState> = {}
        if (isOnUpdateOnboardingWizard) {
            payload = {
                onboardingState: AiAgentOnboardingState.StartedSetup,
            }
        } else {
            payload = {
                onboardingState: AiAgentOnboardingState.VisitedAiAgent,
                welcomePageVisitedDatetimes: onboardingNotificationState
                    ? [
                          ...onboardingNotificationState.welcomePageVisitedDatetimes,
                          new Date().toISOString(),
                      ]
                    : [new Date().toISOString()],
            }
        }
        const updatedOnboardingNotificationState = await handleOnSave(payload)

        if (
            updatedOnboardingNotificationState?.welcomePageVisitedDatetimes &&
            updatedOnboardingNotificationState.welcomePageVisitedDatetimes
                .length >= 3
        ) {
            handleOnSendOrCancelNotification({
                aiAgentNotificationType:
                    AiAgentNotificationType.StartAiAgentSetup,
            })
        }
    }, [
        handleOnSave,
        handleOnSendOrCancelNotification,
        handleOnPerformActionPostReceivedNotification,
        isOnUpdateOnboardingWizard,
        onboardingNotificationState,
    ])

    useEffect(() => {
        if (
            props.state === 'loading' ||
            isLoadingOnboardingNotificationState ||
            !isAdmin ||
            !isAiAgentOnboardingNotificationEnabled
        )
            return

        void handleOnStartSetupNotification()
    }, [
        handleOnStartSetupNotification,
        isAdmin,
        isAiAgentOnboardingNotificationEnabled,
        isLoadingOnboardingNotificationState,
        props.state,
    ])

    return (
        <div className={css.pageContainer}>
            <PageHeader title="AI Agent"></PageHeader>
            <div className={css.contentContainer}>
                <div className={css.leftContainer}>
                    <div className={css.content}>
                        {props.state === 'loading' && (
                            <AIAgentWelcomePageViewLoading />
                        )}

                        {props.state !== 'loading' && (
                            <>
                                <div>
                                    <img
                                        className={css.logo}
                                        src={assetsUrl(
                                            '/img/ai-agent/ai-agent-logo.png',
                                        )}
                                        alt="AI Agent"
                                    />
                                </div>

                                <div>
                                    <div className={css.description}>
                                        {description[props.state]}
                                    </div>

                                    {props.state === 'static' && (
                                        <AIAgentWelcomePageViewStatic />
                                    )}

                                    {(props.state === 'dynamic' ||
                                        props.state === 'onboardingWizard') && (
                                        <AIAgentWelcomePageViewDynamic
                                            emailConnected={
                                                props.emailConnected
                                            }
                                            helpCenterCreated={
                                                props.helpCenterCreated
                                            }
                                            helpCenter20Articles={
                                                props.helpCenter20Articles
                                            }
                                            shopifyPermissionUpdated={
                                                props.shopifyPermissionUpdated
                                            }
                                        />
                                    )}
                                </div>

                                <div>
                                    <Button
                                        intent="primary"
                                        size="medium"
                                        onClick={
                                            props.state === 'onboardingWizard'
                                                ? onOnboardingWizardClick
                                                : onAcknowledgedClick
                                        }
                                        isDisabled={
                                            isLoading ||
                                            isLoadingOnboardingNotificationState
                                        }
                                    >
                                        {isOnUpdateOnboardingWizard
                                            ? 'Continue Setup'
                                            : 'Set Up AI Agent'}
                                    </Button>
                                </div>

                                <div className={css.learnMore}>
                                    {[
                                        {
                                            text: 'Join our AI Agent Masterclass live webinar',
                                            icon: 'ondemand_video',
                                            link: 'https://link.gorgias.com/ai-agent-webinar-product',
                                        },
                                        {
                                            text: 'How to set up AI Agent',
                                            icon: 'chrome_reader_mode',
                                            link: 'https://link.gorgias.com/ai-agent-help-product',
                                        },
                                    ].map((item, index) => (
                                        <a
                                            key={`item-${index}`}
                                            href={item.link}
                                            rel="noopener noreferrer"
                                            target="_blank"
                                        >
                                            <i className="material-icons mr-2">
                                                {item.icon}
                                            </i>
                                            {item.text}
                                        </a>
                                    ))}
                                </div>
                                <div data-candu-id="ai-agent-welcome-page"></div>
                            </>
                        )}
                    </div>
                </div>

                <div className={css.rightContainer}>
                    <img
                        className={css.exampleImg}
                        src={assetsUrl(
                            '/img/paywalls/screens/ai_agent_welcome_page.gif',
                        )}
                        alt="AI Agent example"
                    />
                </div>
            </div>
        </div>
    )
}

const AIAgentWelcomePageViewLoading = () => (
    <>
        <Skeleton height="40px" width="171px" />
        <Skeleton height="160px" />
        <Skeleton height="32px" width="131px" />

        <div className={css.learnMore}>
            <Skeleton height="20px" />
            <Skeleton height="20px" />
        </div>
    </>
)

const AIAgentWelcomePageViewStatic = () => (
    <div className={classNames(css.list, css.staticList)}>
        {[
            'Consume all your brand’s knowledge, identity and tone',
            'Follow Guidance built by you',
            'Enhance team productivity, reducing workload & response times',
            'Guide customers towards swift resolutions in seconds, not hours',
            'Continuously improve based on your reviews & feedback',
        ].map((item, i) => (
            <div className={css.listItem} key={`item-${i}`}>
                <i className={classNames('material-icons', css.checkIcon)}>
                    check
                </i>
                <span>{item}</span>
            </div>
        ))}
    </div>
)

type AIAgentWelcomePageViewDynamicProps = {
    emailConnected: DynamicItem
    helpCenterCreated: DynamicItem
    helpCenter20Articles: DynamicItem
    shopifyPermissionUpdated?: DynamicItem
}

const AIAgentWelcomePageViewDynamic = ({
    emailConnected,
    helpCenterCreated,
    helpCenter20Articles,
    shopifyPermissionUpdated,
}: AIAgentWelcomePageViewDynamicProps) => {
    const welcomePageDynamicList = [
        ...(shopifyPermissionUpdated
            ? [
                  {
                      text: 'Update your Shopify integration',
                      ...shopifyPermissionUpdated,
                  },
              ]
            : []),
        {
            text: 'Connect an email to this store',
            ...emailConnected,
        },
        {
            text: 'Create or import a Help Center',
            ...helpCenterCreated,
        },
        {
            text: 'Add 20+ articles to your Help Center',
            ...helpCenter20Articles,
        },
    ]

    return (
        <div className={classNames(css.list, css.dynamicList)}>
            {welcomePageDynamicList.map((item, i) => (
                <div className={css.listItem} key={`item-${i}`}>
                    <div className={css.itemNumber}>
                        <div
                            className={classNames(
                                css.inner,
                                item.checked ? css.checked : css.number,
                            )}
                        >
                            {item.checked ? (
                                <i className="material-icons">checked</i>
                            ) : (
                                i + 1
                            )}
                        </div>
                    </div>

                    <div>
                        {item.text}
                        {item.link && !item.checked && (
                            <a
                                className={classNames(
                                    'material-icons',
                                    css.openInNewIcon,
                                )}
                                href={item.link}
                                rel="noopener noreferrer"
                                target="_blank"
                            >
                                open_in_new
                            </a>
                        )}
                    </div>
                </div>
            ))}
        </div>
    )
}
