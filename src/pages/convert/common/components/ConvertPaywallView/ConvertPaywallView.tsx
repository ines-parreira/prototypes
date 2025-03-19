import { Redirect } from 'react-router-dom'

import convertIcon from 'assets/img/convert/convert-logo.svg'
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
import { useIsConvertSubscriber } from 'pages/common/hooks/useIsConvertSubscriber'
import {
    CONVERT_BOOK_DEMO_LINK,
    CONVERT_PRODUCT_LINK,
} from 'pages/convert/common/constants'

import { ConvertFeatures, PaywallConfig } from './constants'

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

            <PaywallView>
                <PaywallViewLeftContainer>
                    <PaywallViewHeader
                        logo={convertIcon}
                        logoAlt="Gorgias Convert"
                        title={paywallTitle}
                    />

                    <PaywallViewChecklist>
                        {descriptions.map((description, i) => (
                            <PaywallViewChecklistItem key={i}>
                                {description}
                            </PaywallViewChecklistItem>
                        ))}
                    </PaywallViewChecklist>

                    <PaywallViewActionButtons>
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
                    </PaywallViewActionButtons>
                </PaywallViewLeftContainer>
                <PaywallViewRightContainer>
                    <HeroImageCarousel slides={slidesData} />
                </PaywallViewRightContainer>
            </PaywallView>
        </div>
    )
}
export default ConvertPaywallView
