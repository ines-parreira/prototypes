import React, { useState } from 'react'

import { FeatureFlagKey } from '@repo/feature-flags'
import { useEffectOnce } from '@repo/hooks'
import { useFlags } from 'launchdarkly-react-client-sdk'

import { LegacyButton as Button } from '@gorgias/axiom'

import { logEvent, SegmentEvent } from 'common/segment'
import LinkButton from 'pages/common/components/button/LinkButton'
import HeroImageCarousel from 'pages/common/components/HeroImageCarousel/HeroImageCarousel'
import PageHeader from 'pages/common/components/PageHeader'
import PaywallView from 'pages/common/components/PaywallView/PaywallView'
import PaywallViewActionButtons from 'pages/common/components/PaywallView/PaywallViewActionButtons'
import PaywallViewChecklist from 'pages/common/components/PaywallView/PaywallViewChecklist'
import PaywallViewChecklistItem from 'pages/common/components/PaywallView/PaywallViewChecklistItem'
import PaywallViewHeader from 'pages/common/components/PaywallView/PaywallViewHeader'
import PaywallViewLeftContainer from 'pages/common/components/PaywallView/PaywallViewLeftContainer'
import PaywallViewRightContainer from 'pages/common/components/PaywallView/PaywallViewRightContainer'
import AutomateSubscriptionModal from 'pages/settings/billing/automate/AutomateSubscriptionModal'

import { usePaywallConfig } from '../hooks/usePaywallConfig'
import { AutomateFeatures } from '../types'

import css from './AutomatePaywallView.less'

const AutomatePaywallView = ({
    automateFeature,
    customCta,
}: {
    automateFeature: AutomateFeatures
    customCta?: React.ReactNode
}) => {
    const {
        headerTitle,
        paywallLogo,
        paywallLogoAlt,
        paywallTitle,
        descriptions,
        showRoiCalculator,
        slidesWidth,
        slidesData,
        ...props
    } = usePaywallConfig(automateFeature, customCta)
    const [isAutomationModalOpened, setIsAutomationModalOpened] =
        useState(false)
    useEffectOnce(() => {
        logEvent(SegmentEvent.AutomatePaywallVisited, {
            location: automateFeature,
        })
    })

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

    return (
        <div className={css.layout}>
            {headerTitle && <PageHeader title={headerTitle} />}

            <PaywallView>
                <PaywallViewLeftContainer>
                    <PaywallViewHeader
                        logo={paywallLogo}
                        logoAlt={paywallLogoAlt}
                        title={paywallTitle}
                    />

                    <PaywallViewChecklist>
                        {descriptions.map((description, i) => (
                            <PaywallViewChecklistItem key={i}>
                                {description}
                            </PaywallViewChecklistItem>
                        ))}
                    </PaywallViewChecklist>

                    {automateFeature === AutomateFeatures.AiAgent ? (
                        <div data-candu-id="automate-ai-agent-waitwall" />
                    ) : (
                        <PaywallViewActionButtons>
                            {props?.customCta ? (
                                props.customCta
                            ) : (
                                <Button
                                    data-candu-id="automate-paywall-select-plan"
                                    onClick={() =>
                                        setIsAutomationModalOpened(true)
                                    }
                                >
                                    Select plan to get started
                                </Button>
                            )}
                            {!props?.hideLearnMore && (
                                <LinkButton
                                    target="blank"
                                    data-candu-id="automate-paywall-learn-more"
                                    intent="secondary"
                                    onClick={() =>
                                        logEvent(
                                            SegmentEvent.AutomatePaywallLearnMore,
                                        )
                                    }
                                    href="https://link.gorgias.com/bij"
                                >
                                    Learn more
                                </LinkButton>
                            )}
                        </PaywallViewActionButtons>
                    )}

                    {hasAccessToROICalculator && (
                        <Button
                            fillStyle="ghost"
                            intent="secondary"
                            size="medium"
                            className={css.roiButton}
                            onClick={handleROIButtonClick}
                        >
                            <i className="material-icons rounded">
                                monetization_on
                            </i>
                            Calculate Potential Return on Investment
                        </Button>
                    )}
                </PaywallViewLeftContainer>
                <PaywallViewRightContainer>
                    <HeroImageCarousel
                        width={slidesWidth}
                        slides={slidesData}
                    />
                </PaywallViewRightContainer>
            </PaywallView>

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
export default AutomatePaywallView
