import React, {useRef, useState} from 'react'

import classNames from 'classnames'
import Slider from 'react-slick'
import {useEffectOnce} from 'react-use'
import PageHeader from 'pages/common/components/PageHeader'
import LinkButton from 'pages/common/components/button/LinkButton'
import AutomationSubscriptionModal from 'pages/settings/billing/add-ons/automation/AutomationSubscriptionModal'
import automateIcon from 'assets/img/self-service/automate-logo.svg'
import Button from 'pages/common/components/button/Button'

import {SegmentEvent, logEvent} from 'common/segment'
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
    const [currentSlide, setCurrentSlide] = useState(0)
    const sliderRef = useRef<Slider | null>(null)
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
                    <div className={css.sliderWrapper}>
                        <Slider
                            beforeChange={(oldIndex, newIndex) => {
                                setCurrentSlide(newIndex)
                            }}
                            ref={sliderRef}
                            arrows={false}
                            infinite={false}
                            speed={350}
                        >
                            {slidesData.map((imageItem, i) => {
                                return (
                                    <div key={i}>
                                        <img
                                            width={420}
                                            height={420}
                                            className={css.slideImage}
                                            src={imageItem.imageUrl}
                                            alt={imageItem.description}
                                        />
                                        <div className={css.slideDescription}>
                                            {imageItem.description}
                                        </div>
                                    </div>
                                )
                            })}
                        </Slider>
                    </div>

                    <div className={css.slideAction}>
                        <i
                            onClick={() => sliderRef.current?.slickPrev()}
                            className={classNames(
                                'material-icons',
                                css.actionIcon,
                                {
                                    [css.disabled]: currentSlide === 0,
                                }
                            )}
                        >
                            chevron_left
                        </i>
                        <div className={css.slideDot}>
                            {slidesData.map((_, i) => (
                                <div
                                    className={classNames({
                                        [css.current]: currentSlide === i,
                                    })}
                                    key={i}
                                />
                            ))}
                        </div>
                        <i
                            onClick={() => sliderRef.current?.slickNext()}
                            className={classNames(
                                'material-icons',
                                css.actionIcon,
                                {
                                    [css.disabled]:
                                        currentSlide === slidesData.length - 1,
                                }
                            )}
                        >
                            chevron_right
                        </i>
                    </div>
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
