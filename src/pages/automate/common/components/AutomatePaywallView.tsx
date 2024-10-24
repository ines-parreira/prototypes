import classNames from 'classnames'
import {useFlags} from 'launchdarkly-react-client-sdk'
import React, {useState} from 'react'

import {SegmentEvent, logEvent} from 'common/segment'
import {FeatureFlagKey} from 'config/featureFlags'
import useEffectOnce from 'hooks/useEffectOnce'
import Button from 'pages/common/components/button/Button'
import LinkButton from 'pages/common/components/button/LinkButton'
import HeroImageCarousel from 'pages/common/components/HeroImageCarousel/HeroImageCarousel'
import PageHeader from 'pages/common/components/PageHeader'
import AutomateSubscriptionModal from 'pages/settings/billing/automate/AutomateSubscriptionModal'

import {usePaywallConfig} from '../hooks/usePaywallConfig'
import {AutomateFeatures} from '../types'
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

            <div className={css.wrapper}>
                <div className={css.leftContainer}>
                    {paywallLogo && (
                        <img
                            className={css.headerIcon}
                            src={paywallLogo}
                            alt={paywallLogoAlt}
                        />
                    )}
                    {paywallTitle && (
                        <div className={css.title}>{paywallTitle}</div>
                    )}

                    {descriptions.map((description, i) => (
                        <div key={i} className={css.description}>
                            <i
                                className={classNames(
                                    'material-icons',
                                    css.checkIcon
                                )}
                            >
                                check
                            </i>
                            <span>{description}</span>
                        </div>
                    ))}

                    {automateFeature === AutomateFeatures.AiAgent ? (
                        <div data-candu-id="automate-ai-agent-waitwall" />
                    ) : (
                        <div className={css.actionButton}>
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
                                            SegmentEvent.AutomatePaywallLearnMore
                                        )
                                    }
                                    href="https://link.gorgias.com/bij"
                                >
                                    Learn more
                                </LinkButton>
                            )}
                        </div>
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
                </div>
                <div className={css.rightContainer}>
                    <HeroImageCarousel
                        width={slidesWidth}
                        slides={slidesData}
                    />
                </div>
            </div>
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
