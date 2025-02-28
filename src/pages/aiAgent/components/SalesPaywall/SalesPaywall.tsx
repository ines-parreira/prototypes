import React from 'react'

import cn from 'classnames'

import AiAgentLogo from 'assets/img/ai-agent/ai-agent-logo.png'
import { Separator } from 'pages/common/components/Separator/Separator'

import css from './SalesPaywall.less'

export const SalesPaywall = () => {
    return (
        <>
            <div className={css.salesPaywall}>
                <div className={css.infoContainer}>
                    <div>
                        <img
                            src={AiAgentLogo}
                            className={css.logo}
                            alt="AI Agent Logo"
                        />
                        <div className="heading-section-semibold">
                            for Sales
                        </div>
                        <Separator className={css.separator} />
                        <div className="heading-subsection-semibold">
                            Introducing AI Agent for Sales, your team’s newest
                            member to drive conversion.{' '}
                        </div>

                        <ul className={css.list}>
                            <li className="heading-subsection-regular">
                                <i className={cn('material-icons', css.icon)}>
                                    done
                                </i>
                                Provides 24/7 pre-sales assistance to guide
                                shoppers, answer questions, and reduce drop-off.
                            </li>
                            <li className="heading-subsection-regular">
                                <i className={cn('material-icons', css.icon)}>
                                    done
                                </i>
                                Offer dynamic discounts to convert hesitant
                                buyers without compromising margins.
                            </li>
                            <li className="heading-subsection-regular">
                                <i className={cn('material-icons', css.icon)}>
                                    done
                                </i>
                                Personalize product recommendations using
                                real-time data and customer input.
                            </li>
                            <li className="heading-subsection-regular">
                                <i className={cn('material-icons', css.icon)}>
                                    done
                                </i>
                                Turn search into a revenue-driving engine with
                                intelligent product discovery.
                            </li>
                        </ul>
                        <div data-candu-id="ai-agent-waitlist"></div>
                    </div>
                </div>

                <div className={css.featuresContainer}>Sales features here</div>
            </div>
            <div className={css.background}></div>
        </>
    )
}
