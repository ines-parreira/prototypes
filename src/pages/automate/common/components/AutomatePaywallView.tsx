import React, {useState} from 'react'

import classNames from 'classnames'
import {useEffectOnce} from 'react-use'
import PageHeader from 'pages/common/components/PageHeader'
import LinkButton from 'pages/common/components/button/LinkButton'
import AutomationSubscriptionModal from 'pages/settings/billing/automate/AutomationSubscriptionModal'
import automateIcon from 'assets/img/self-service/automate-logo.svg'
import Button from 'pages/common/components/button/Button'

import {SegmentEvent, logEvent} from 'common/segment'
import HeroImageCarousel from 'pages/common/components/HeroImageCarousel/HeroImageCarousel'
import {AutomateFeatures} from '../types'
import css from './AutomatePaywallView.less'
import {PaywallConfig} from './constants'

const AutomatePaywallView = ({
    automateFeature,
}: {
    automateFeature: AutomateFeatures
}) => {
    const {
        headerTitle,
        paywallTitle,
        descriptions,
        greyButtonText,
        primaryButtonText,
        slidesData,
    } = PaywallConfig[automateFeature]
    const [isAutomationModalOpened, setIsAutomationModalOpened] =
        useState(false)
    useEffectOnce(() => {
        logEvent(SegmentEvent.AutomatePaywallVisited, {
            location: automateFeature,
        })
    })
    return (
        <div className={css.layout}>
            <PageHeader title={headerTitle}></PageHeader>

            <div className={css.wrapper}>
                <div className={css.leftContainer}>
                    <img
                        className={css.headerIcon}
                        src={automateIcon}
                        alt="Gorgias Automate"
                    />
                    <div className={css.title}>{paywallTitle}</div>

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

                    <div className={css.actionButton}>
                        <Button
                            data-candu-id="automate-paywall-select-plan"
                            onClick={() => setIsAutomationModalOpened(true)}
                        >
                            {primaryButtonText}
                        </Button>
                        <LinkButton
                            target="blank"
                            data-candu-id="automate-paywall-learn-more"
                            intent="secondary"
                            onClick={() =>
                                logEvent(SegmentEvent.AutomatePaywallLearnMore)
                            }
                            href="https://link.gorgias.com/bij"
                        >
                            {greyButtonText}
                        </LinkButton>
                    </div>
                </div>
                <div className={css.rightContainer}>
                    <HeroImageCarousel slides={slidesData} />
                </div>
            </div>
            <AutomationSubscriptionModal
                confirmLabel="Subscribe"
                isOpen={isAutomationModalOpened}
                onClose={() => setIsAutomationModalOpened(false)}
            />
        </div>
    )
}
export default AutomatePaywallView
