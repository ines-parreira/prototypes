import React, {useMemo} from 'react'
import classNames from 'classnames'

import {useGetAiAgentFeedback} from 'models/aiAgentFeedback/queries'
import shopifyLogo from 'assets/img/ai-agent/ai-agent-shopify.svg'
import useHasAgentPrivileges from 'hooks/useHasAgentPrivileges'
import {
    getActionUrl,
    getGuidanceUrl,
    getKnowledgeUrl,
} from '../AIAgentFeedbackBar/utils'
import css from './AIAgentUsedData.less'

type Props = {
    messageId: number
}

const AIAgentUsedData = ({messageId}: Props) => {
    const hasAgentPrivileges = useHasAgentPrivileges()
    const {data} = useGetAiAgentFeedback({
        refetchOnWindowFocus: false,
    })

    const {orders, actions, knowledge, guidance, shopName, shopType} =
        useMemo(() => {
            const messageFeedback = data?.data.messages.find(
                (message) => message.messageId === messageId
            )

            if (!messageFeedback) {
                return {}
            }

            const {orders, actions, knowledge, guidance, shopName, shopType} =
                messageFeedback

            return {
                orders,
                actions,
                knowledge,
                guidance,
                shopName,
                shopType,
            }
        }, [data, messageId])

    if (!orders && !actions && !knowledge && !guidance) {
        return null
    }

    return (
        <div className={css.container}>
            <div className={css.title}>
                <i className={classNames('material-icons', css.titleIcon)}>
                    auto_awesome
                </i>
                Used Data
            </div>
            <div className={css.resources}>
                {orders?.map((order) => (
                    <a
                        key={order.id}
                        href={order.url}
                        className={css.resource}
                        target="_blank"
                        rel="noreferrer noopener"
                    >
                        <img
                            className={css.resourceIcon}
                            alt="order id"
                            src={shopifyLogo}
                        />
                        <span>{order.name}</span>
                        <i
                            className={classNames(
                                'material-icons',
                                css.openIcon
                            )}
                        >
                            open_in_new
                        </i>
                    </a>
                ))}
                {actions?.map((action) => (
                    <a
                        key={action.id}
                        href={
                            hasAgentPrivileges
                                ? getActionUrl(action, shopType, shopName)
                                : undefined
                        }
                        className={css.resource}
                        target="_blank"
                        rel="noreferrer noopener"
                    >
                        <i
                            className={classNames(
                                'material-icons',
                                css.resourceIcon
                            )}
                        >
                            play_circle_filled
                        </i>
                        <span>{action.name}</span>
                        <i
                            className={classNames(
                                'material-icons',
                                css.openIcon
                            )}
                        >
                            open_in_new
                        </i>
                    </a>
                ))}
                {guidance?.map((guidance) => (
                    <a
                        key={guidance.id}
                        href={
                            hasAgentPrivileges
                                ? getGuidanceUrl(guidance, shopType, shopName)
                                : undefined
                        }
                        className={css.resource}
                        target="_blank"
                        rel="noreferrer noopener"
                    >
                        <i
                            className={classNames(
                                'material-icons',
                                css.resourceIcon
                            )}
                        >
                            map
                        </i>
                        <span>{guidance.name}</span>
                        <i
                            className={classNames(
                                'material-icons',
                                css.openIcon
                            )}
                        >
                            open_in_new
                        </i>
                    </a>
                ))}
                {knowledge?.map((knowledge) => (
                    <a
                        key={knowledge.id}
                        href={
                            hasAgentPrivileges
                                ? getKnowledgeUrl(knowledge)
                                : undefined
                        }
                        className={css.resource}
                        target="_blank"
                        rel="noreferrer noopener"
                    >
                        <i
                            className={classNames(
                                'material-icons',
                                css.resourceIcon
                            )}
                        >
                            article
                        </i>
                        <span>{knowledge.name}</span>
                        <i
                            className={classNames(
                                'material-icons',
                                css.openIcon
                            )}
                        >
                            open_in_new
                        </i>
                    </a>
                ))}
            </div>
        </div>
    )
}

export default AIAgentUsedData
