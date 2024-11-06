import classNames from 'classnames'
import React from 'react'
import {Redirect} from 'react-router-dom'

import convertIcon from 'assets/img/convert/convert-logo.svg'
import LinkButton from 'pages/common/components/button/LinkButton'

import HeroImageCarousel from 'pages/common/components/HeroImageCarousel/HeroImageCarousel'
import PageHeader from 'pages/common/components/PageHeader'
import {useIsConvertSubscriber} from 'pages/common/hooks/useIsConvertSubscriber'
import {
    CONVERT_BOOK_DEMO_LINK,
    CONVERT_PRODUCT_LINK,
} from 'pages/convert/common/constants'

import {ConvertFeatures, PaywallConfig} from './constants'
import css from './ConvertPaywallView.less'

type Props = {
    convertFeature: ConvertFeatures
    onSubscribedRedirectPath: string
    pageHeaderTitle?: string
}

const ConvertPaywallView = ({
    convertFeature,
    onSubscribedRedirectPath,
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
                        <LinkButton
                            data-candu-id="convert-paywall-select-plan"
                            className="mr-2"
                            target="_blank"
                            intent="primary"
                            href={CONVERT_BOOK_DEMO_LINK}
                        >
                            {primaryButtonText}
                        </LinkButton>
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
        </div>
    )
}
export default ConvertPaywallView
