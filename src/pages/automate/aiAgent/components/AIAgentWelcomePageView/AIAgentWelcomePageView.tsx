import React, {useEffect} from 'react'

import classNames from 'classnames'
import Skeleton from 'react-loading-skeleton'
import PageHeader from 'pages/common/components/PageHeader'
import {assetsUrl} from 'utils'
import Button from 'pages/common/components/button/Button'
import {NotificationStatus} from 'state/notifications/types'
import {notify} from 'state/notifications/actions'
import useAppDispatch from 'hooks/useAppDispatch'
import {SegmentEvent, logEvent} from 'common/segment'
import {useWelcomePageAcknowledgedMutation} from '../../hooks/useWelcomePageAcknowledgedMutation'
import css from './AIAgentWelcomePageView.less'

export type DynamicItem =
    | {
          checked: false
          link: string
      }
    | {
          checked: true
      }

type Props = {shopName: string} & (
    | {
          state: 'loading'
      }
    | {
          state: 'static'
      }
    | {
          state: 'dynamic'
          emailConnected: DynamicItem
          helpCenterCreated: DynamicItem
          helpCenter20Articles: DynamicItem
      }
)

export const AIAgentWelcomePageView = (props: Props) => {
    const {isLoading, createWelcomePageAcknowledged} =
        useWelcomePageAcknowledgedMutation({shopName: props.shopName})
    const dispatch = useAppDispatch()

    const description = {
        static: 'Introducing AI Agent, your team’s newest member for seamless customer interactions who can:',
        dynamic:
            'Prepare AI Agent to automate 60% of your email and contact form tickets by completing these steps',
    }

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
        if (props.state === 'loading') return

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

                                    {props.state === 'dynamic' && (
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
                                        />
                                    )}
                                </div>

                                <div>
                                    <Button
                                        intent="primary"
                                        size="medium"
                                        onClick={onAcknowledgedClick}
                                        disabled={isLoading}
                                    >
                                        Set Up AI Agent
                                    </Button>
                                </div>

                                <div className={css.learnMore}>
                                    {[
                                        {
                                            text: 'Join our AI Agent Masterclass live webinar',
                                            icon: 'ondemand_video',
                                            link: 'https://app.getcontrast.io/sessions/gorgias-setting-up-ai-agent',
                                        },
                                        {
                                            text: 'How to set up AI Agent',
                                            icon: 'chrome_reader_mode',
                                            link: 'https://docs.gorgias.com/en-US/articles/ai-agent-135134',
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
}

const AIAgentWelcomePageViewDynamic = ({
    emailConnected,
    helpCenterCreated,
    helpCenter20Articles,
}: AIAgentWelcomePageViewDynamicProps) => (
    <div className={classNames(css.list, css.dynamicList)}>
        {[
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
        ].map((item, i) => (
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
                    {!item.checked && (
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
