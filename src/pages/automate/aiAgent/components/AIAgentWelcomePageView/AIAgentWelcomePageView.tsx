import React, {useCallback, useEffect} from 'react'

import classNames from 'classnames'
import Skeleton from 'react-loading-skeleton'
import {useHistory} from 'react-router-dom'
import PageHeader from 'pages/common/components/PageHeader'
import {assetsUrl} from 'utils'
import Button from 'pages/common/components/button/Button'
import {NotificationStatus} from 'state/notifications/types'
import {notify} from 'state/notifications/actions'
import useAppDispatch from 'hooks/useAppDispatch'
import {SegmentEvent, logEvent} from 'common/segment'
import {StoreConfiguration} from 'models/aiAgent/types'
import {useWelcomePageAcknowledgedMutation} from '../../hooks/useWelcomePageAcknowledgedMutation'
import css from './AIAgentWelcomePageView.less'

export type DynamicItem = {
    checked: boolean
    link?: string
}

export type AiAgentWelcomePageProps = {
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
          }
    )

export const AIAgentWelcomePageView = (props: Props) => {
    const {isLoading, createWelcomePageAcknowledged} =
        useWelcomePageAcknowledgedMutation({shopName: props.shopName})
    const dispatch = useAppDispatch()
    const history = useHistory()

    // to be filled with actual data when we have wizard table in storeConfiguration
    // value: storeConfiguration?.wizard?.completed_datetime === null
    const isOnUpdateOnboardingWizard =
        props.state === 'onboardingWizard' && !!props.storeConfiguration

    const description = {
        static: 'Introducing AI Agent, your team’s newest member for seamless customer interactions who can:',
        dynamic:
            'Prepare AI Agent to automate 60% of your email and contact form tickets by completing these steps',
        onboardingWizard: isOnUpdateOnboardingWizard
            ? 'Prepare AI Agent to automate 60% of your tickets by completing these steps:'
            : 'Prepare AI Agent to automate 60% of your email, Chat and Contact Form tickets by completing these steps:',
    }

    const onOnboardingWizardClick = useCallback(() => {
        history.push(
            `/app/automation/${props.shopType}/${props.shopName}/ai-agent/new`
        )
    }, [history, props.shopName, props.shopType])

    const onAcknowledgedClick = async () => {
        try {
            await createWelcomePageAcknowledged([props.shopName])

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
                })
            )
        }
    }

    useEffect(() => {
        if (props.state === 'loading' || props.state === 'onboardingWizard')
            return

        logEvent(SegmentEvent.AiAgentWelcomePageViewed, {
            version: props.state === 'dynamic' ? 'Dynamic' : 'Basic',
            store: props.shopName,
        })
    }, [props.state, props.shopName])

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
                                            '/img/ai-agent/ai-agent-logo.png'
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
                                            isOnUpdateOnboardingWizard={
                                                isOnUpdateOnboardingWizard
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
                                        disabled={isLoading}
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
                            </>
                        )}
                    </div>
                </div>

                <div className={css.rightContainer}>
                    <img
                        className={css.exampleImg}
                        src={assetsUrl(
                            '/img/paywalls/screens/ai_agent_welcome_page.gif'
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
    isOnUpdateOnboardingWizard: boolean
}

const AIAgentWelcomePageViewDynamic = ({
    emailConnected,
    helpCenterCreated,
    helpCenter20Articles,
    isOnUpdateOnboardingWizard,
}: AIAgentWelcomePageViewDynamicProps) => {
    const welcomePageDynamicList = [
        ...(isOnUpdateOnboardingWizard
            ? [
                  {
                      text: 'Update your Shopify integration',
                      checked: false,
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
                                item.checked ? css.checked : css.number
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
                                    css.openInNewIcon
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
