import React, { useState } from 'react'

import cn from 'classnames'

import { Button } from '@gorgias/merchant-ui-kit'

import AiAgentLogo from 'assets/img/ai-agent/ai-agent-logo.png'
import SalesStrategy from 'assets/img/ai-agent/ai-agent_paywall_sales-strategy.png'
import { Separator } from 'pages/common/components/Separator/Separator'
import * as ToggleButton from 'pages/common/components/ToggleButton'
import { assetsUrl } from 'utils'

import css from './AIAgentPaywallSetup.less'

export type AiAgentPaywallSetupProps = {
    onOnboardingWizardClick: () => void
    isLoading: boolean
    isOnUpdateOnboardingWizard: boolean
}

export const AIAgentPaywallSetup = (props: AiAgentPaywallSetupProps) => {
    const [toggleValue, setToggleValue] = useState<'Support' | 'Sales'>(
        'Support',
    )

    return (
        <div className={css.pageContainer}>
            <div className={css.setupPaywall}>
                <div className={css.infoContainer}>
                    <div>
                        <img
                            src={AiAgentLogo}
                            className={css.logo}
                            alt="AI Agent Logo"
                        />
                        <div className="heading-section-semibold">
                            for Support & Sales
                        </div>
                        <Separator className={css.separator} />
                        <div className="heading-subsection-semibold">
                            Introducing AI Agent - with Support and Sales
                            skills, your team’s newest member for seamless
                            customer interactions.
                        </div>

                        <ul className={css.list}>
                            <li className="heading-subsection-regular">
                                <i className={cn('material-icons', css.icon)}>
                                    done
                                </i>
                                Lead customers to fast resolutions in seconds,
                                not hours.
                            </li>
                            <li className="heading-subsection-regular">
                                <i className={cn('material-icons', css.icon)}>
                                    done
                                </i>
                                Enhance team productivity, reducing workload &
                                response times by automating up to 60% of your
                                tickets.
                            </li>
                            <li className="heading-subsection-regular">
                                <i className={cn('material-icons', css.icon)}>
                                    done
                                </i>
                                Offer tailored discounts and product
                                recommendations to drive personalized shopping
                                experiences.
                            </li>
                        </ul>

                        <Button
                            intent="primary"
                            size="medium"
                            onClick={props.onOnboardingWizardClick}
                            isDisabled={props.isLoading}
                            trailingIcon="auto_awesome"
                        >
                            {props.isOnUpdateOnboardingWizard
                                ? 'Continue Setup'
                                : 'Set Up AI Agent'}
                        </Button>

                        <div data-candu-id="ai-agent-welcome-page"></div>
                    </div>
                </div>

                <div className={css.featuresContainer}>
                    <div className={css.previewTitle}>AI Agent Skills</div>

                    <ToggleButton.Wrapper
                        type={ToggleButton.Type.Label}
                        value={toggleValue}
                        onChange={setToggleValue}
                        className={css.toggleButtons}
                    >
                        <ToggleButton.Option value="Support">
                            Support
                        </ToggleButton.Option>
                        <ToggleButton.Option value="Sales">
                            Sales
                        </ToggleButton.Option>
                    </ToggleButton.Wrapper>

                    {toggleValue === 'Support' && (
                        <video
                            autoPlay
                            muted
                            playsInline
                            className={css.content}
                            src={assetsUrl(
                                '/video/ai-agent_paywall_support.mp4',
                            )}
                        />
                    )}
                    {toggleValue === 'Sales' && (
                        <img
                            src={SalesStrategy}
                            className={css.content}
                            alt="preview"
                        />
                    )}
                </div>
            </div>
            <div className={css.background}></div>
        </div>
    )
}
