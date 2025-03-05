import React, { useState } from 'react'

import cn from 'classnames'

import AiAgentLogo from 'assets/img/ai-agent/ai-agent-logo.png'
import DynamicDiscount from 'assets/img/ai-agent/ai-agent_paywall_dynamic-discount.png'
import ProductRecommendations from 'assets/img/ai-agent/ai-agent_paywall_product-recommendations.png'
import SalesStrategy from 'assets/img/ai-agent/ai-agent_paywall_sales-strategy.png'
import { Separator } from 'pages/common/components/Separator/Separator'
import * as ToggleButton from 'pages/common/components/ToggleButton'

import { SalesFeature } from './SalesPaywall.types'

import css from './SalesPaywall.less'

export const SalesPaywall = () => {
    const [toggleValue, setToggleValue] = useState<SalesFeature>(
        SalesFeature.SalesStrategy,
    )
    let src = SalesStrategy

    switch (toggleValue) {
        case SalesFeature.DynamicDiscount:
            src = DynamicDiscount
            break
        case SalesFeature.ProductRecommendations:
            src = ProductRecommendations
            break
        default:
            src = SalesStrategy
            break
    }

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
                                Offers dynamic discounts to convert hesitant
                                buyers without compromising margins.
                            </li>
                            <li className="heading-subsection-regular">
                                <i className={cn('material-icons', css.icon)}>
                                    done
                                </i>
                                Personalizes product recommendations using
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

                <div className={css.featuresContainer}>
                    <div className={css.previewTitle}>Sales features</div>

                    <ToggleButton.Wrapper
                        type={ToggleButton.Type.Label}
                        value={toggleValue}
                        onChange={setToggleValue}
                        className={css.toggleButtons}
                    >
                        <ToggleButton.Option value={SalesFeature.SalesStrategy}>
                            Sales Strategy
                        </ToggleButton.Option>
                        <ToggleButton.Option
                            value={SalesFeature.DynamicDiscount}
                        >
                            Dynamic Discount
                        </ToggleButton.Option>
                        <ToggleButton.Option
                            value={SalesFeature.ProductRecommendations}
                        >
                            Product Recommendations
                        </ToggleButton.Option>
                    </ToggleButton.Wrapper>

                    <img src={src} className={css.content} alt="preview" />
                </div>
            </div>
            <div className={css.background}></div>
        </>
    )
}
