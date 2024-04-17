import React, {useState} from 'react'

import classNames from 'classnames'
import {Redirect} from 'react-router-dom'
import PageHeader from 'pages/common/components/PageHeader'
import LinkButton from 'pages/common/components/button/LinkButton'
import convertIcon from 'assets/img/convert/convert-logo.svg'
import Button from 'pages/common/components/button/Button'

import HeroImageCarousel from 'pages/common/components/HeroImageCarousel/HeroImageCarousel'
import ConvertSubscriptionModal from 'pages/convert/common/components/ConvertSubscriptionModal'
import {useIsConvertSubscriber} from 'pages/common/hooks/useIsConvertSubscriber'
import {CONVERT_PRODUCT_LINK} from 'pages/convert/common/constants'
import css from './ConvertPaywallView.less'
import {ConvertFeatures, PaywallConfig} from './constants'

type Props = {
    convertFeature: ConvertFeatures
    onSubscribedRedirectPath: string
    modalCanduId: string
    pageHeaderTitle?: string
}

const ConvertPaywallView = ({
    convertFeature,
    onSubscribedRedirectPath,
    modalCanduId,
    pageHeaderTitle,
}: Props) => {
    const {
        headerTitle,
        paywallTitle,
        descriptions,
        greyButtonText,
        primaryButtonText,
        slidesData,
    } = PaywallConfig[convertFeature]
    const [isModalOpened, setIsModalOpened] = useState(false)

    const isConvertSubscriber = useIsConvertSubscriber()

    return isConvertSubscriber ? (
        <Redirect to={onSubscribedRedirectPath} />
    ) : (
        <div className={css.layout}>
            <PageHeader title={pageHeaderTitle || headerTitle}></PageHeader>

            <div className={css.wrapper}>
                <div className={css.leftContainer}>
                    <img
                        className={css.headerIcon}
                        src={convertIcon}
                        alt="Gorgias Convert"
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
                            data-candu-id="convert-paywall-select-plan"
                            onClick={() => setIsModalOpened(true)}
                        >
                            {primaryButtonText}
                        </Button>
                        <LinkButton
                            target="blank"
                            data-candu-id="convert-paywall-learn-more"
                            intent="secondary"
                            href={CONVERT_PRODUCT_LINK}
                        >
                            {greyButtonText}
                        </LinkButton>
                    </div>
                </div>
                <div className={css.rightContainer}>
                    <HeroImageCarousel slides={slidesData} />
                </div>
            </div>
            <ConvertSubscriptionModal
                isOpen={isModalOpened}
                onClose={() => setIsModalOpened(false)}
                canduId={modalCanduId}
                onSubscribe={() => setIsModalOpened(false)}
                redirectPath={onSubscribedRedirectPath}
            />
        </div>
    )
}
export default ConvertPaywallView
