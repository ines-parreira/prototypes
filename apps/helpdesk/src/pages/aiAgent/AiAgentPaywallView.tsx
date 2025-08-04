import React, { useState } from 'react'

import { useEffectOnce } from '@repo/hooks'
import cn from 'classnames'
import { useFlags } from 'launchdarkly-react-client-sdk'

import { Button } from '@gorgias/merchant-ui-kit'

import AiAgentLogoWhite from 'assets/img/ai-agent/ai-agent-logo-white.png'
import AiAgentLogo from 'assets/img/ai-agent/ai-agent-logo.png'
import { logEvent, SegmentEvent } from 'common/segment'
import { FeatureFlagKey } from 'config/featureFlags'
import { useTheme } from 'core/theme'
import { usePaywallConfig } from 'pages/aiAgent/hooks/usePaywallConfig'
import { AIAgentPaywallFeatures } from 'pages/aiAgent/types'
import LinkButton from 'pages/common/components/button/LinkButton'
import { Separator } from 'pages/common/components/Separator/Separator'
import * as ToggleButton from 'pages/common/components/ToggleButton'
import AutomateSubscriptionModal from 'pages/settings/billing/automate/AutomateSubscriptionModal'

import css from './AiAgentPaywallView.less'

export type ToggleElement = {
    title: string
    contentSrc: string
    type: string
}

export type AiAgentPaywallViewProps = {
    aiAgentPaywallFeature: AIAgentPaywallFeatures
    children?: React.ReactNode
}

export const AiAgentPaywallView = ({
    aiAgentPaywallFeature,
    children,
}: AiAgentPaywallViewProps) => {
    const {
        title,
        subtitle,
        descriptions,
        toggleElements,
        contentSubtitle,
        hideLearnMore,
        showRoiCalculator,
    } = usePaywallConfig(aiAgentPaywallFeature)

    useEffectOnce(() => {
        logEvent(SegmentEvent.AutomatePaywallVisited, {
            location: aiAgentPaywallFeature,
        })
    })

    const [toggleValue, setToggleValue] = useState<string>(
        toggleElements[0].title,
    )
    const [isAutomationModalOpened, setIsAutomationModalOpened] =
        useState(false)

    const activeToggleElement = toggleElements.find(
        (toggleElement) => toggleValue === toggleElement.title,
    )
    const content =
        activeToggleElement && activeToggleElement.type === 'video' ? (
            <video
                autoPlay
                muted
                playsInline
                className={css.content}
                src={activeToggleElement.contentSrc}
            />
        ) : (
            <img
                src={activeToggleElement?.contentSrc}
                className={css.content}
                alt="preview"
            />
        )

    const hasAccessToROICalculator =
        useFlags()[FeatureFlagKey.ObservabilityROICalculator] &&
        showRoiCalculator

    const [showROICalculatorStep, setShowROICalculatorStep] = useState(false)

    const handleOnClose = () => {
        setIsAutomationModalOpened(false)
        setShowROICalculatorStep(false)
    }

    const handleROIButtonClick = () => {
        setShowROICalculatorStep(true)
        setIsAutomationModalOpened(true)
    }

    const theme = useTheme()

    return (
        <div className={css.pageContainer}>
            <div className={css.setupPaywall}>
                <section className={css.infoContainer}>
                    <div>
                        <img
                            src={
                                theme.resolvedName === 'dark'
                                    ? AiAgentLogoWhite
                                    : AiAgentLogo
                            }
                            className={css.logo}
                            alt="AI Agent Logo"
                        />
                        <div className="heading-section-semibold">{title}</div>
                        <Separator className={css.separator} />
                        <div className="heading-subsection-semibold">
                            {subtitle}
                        </div>

                        <ul className={css.list}>
                            {descriptions.map((bulletPoint: string, idx) => (
                                <li
                                    className="heading-subsection-regular"
                                    key={`reason-${idx}`}
                                >
                                    <i
                                        className={cn(
                                            'material-icons',
                                            css.icon,
                                        )}
                                    >
                                        done
                                    </i>
                                    {bulletPoint}
                                </li>
                            ))}
                        </ul>

                        <div className={css.actionButtons}>
                            {children ? (
                                children
                            ) : (
                                <Button
                                    trailingIcon="auto_awesome"
                                    data-candu-id="automate-paywall-select-plan"
                                    onClick={() =>
                                        setIsAutomationModalOpened(true)
                                    }
                                >
                                    Select plan to get started
                                </Button>
                            )}

                            {!hideLearnMore && (
                                <LinkButton
                                    target="blank"
                                    data-candu-id="automate-paywall-learn-more"
                                    fillStyle="ghost"
                                    onClick={() =>
                                        logEvent(
                                            SegmentEvent.AutomatePaywallLearnMore,
                                        )
                                    }
                                    href="https://www.gorgias.com/products/automate"
                                >
                                    Learn more
                                </LinkButton>
                            )}
                        </div>

                        {hasAccessToROICalculator && (
                            <Button
                                fillStyle="ghost"
                                intent="secondary"
                                size="medium"
                                className={css.roiButton}
                                leadingIcon="monetization_on"
                                onClick={handleROIButtonClick}
                            >
                                Calculate Potential Return on Investment
                            </Button>
                        )}
                    </div>
                </section>

                <section className={css.featuresContainer}>
                    <div className={css.previewTitle}>{contentSubtitle}</div>

                    <ToggleButton.Wrapper
                        type={ToggleButton.Type.Label}
                        value={toggleValue}
                        onChange={setToggleValue}
                        className={css.toggleButtons}
                    >
                        {toggleElements.map((toggleElement) => (
                            <ToggleButton.Option
                                value={toggleElement.title}
                                key={`toggle-element-${toggleElement.title.toLocaleLowerCase().replace(' ', '-')}`}
                            >
                                {toggleElement.title}
                            </ToggleButton.Option>
                        ))}
                    </ToggleButton.Wrapper>
                    {content}
                </section>
            </div>

            <div className={css.background}></div>

            <AutomateSubscriptionModal
                confirmLabel="Subscribe"
                isOpen={isAutomationModalOpened}
                onClose={handleOnClose}
                showROICalculatorStep={showROICalculatorStep}
                setShowROICalculatorStep={setShowROICalculatorStep}
            />
        </div>
    )
}
