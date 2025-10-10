import { Link } from 'react-router-dom'

import { LegacyButton as Button } from '@gorgias/axiom'

import paywallConfig from 'domains/reporting/pages/voice/constants/paywallConfig'
import css from 'domains/reporting/pages/voice/VoicePaywall.less'
import { IntegrationType } from 'models/integration/constants'
import LinkButton from 'pages/common/components/button/LinkButton'
import HeroImageCarousel from 'pages/common/components/HeroImageCarousel/HeroImageCarousel'
import LearnMoreLink from 'pages/common/components/LearnMore/LearnMoreLink'
import PageHeader from 'pages/common/components/PageHeader'
import PaywallView from 'pages/common/components/PaywallView/PaywallView'
import PaywallViewActionButtons from 'pages/common/components/PaywallView/PaywallViewActionButtons'
import PaywallViewChecklist from 'pages/common/components/PaywallView/PaywallViewChecklist'
import PaywallViewChecklistItem from 'pages/common/components/PaywallView/PaywallViewChecklistItem'
import PaywallViewHeader from 'pages/common/components/PaywallView/PaywallViewHeader'
import PaywallViewLeftContainer from 'pages/common/components/PaywallView/PaywallViewLeftContainer'
import PaywallViewRightContainer from 'pages/common/components/PaywallView/PaywallViewRightContainer'
import { getIntegrationConfig } from 'state/integrations/helpers'

const {
    greyButtonText,
    primaryButtonText,
    paywallTitle,
    descriptions,
    slidesData,
    primaryButtonUrl,
    greyButtonUrl,
} = paywallConfig

export default function VoicePaywall() {
    const integrationConfig = getIntegrationConfig(IntegrationType.Phone)

    return (
        <div className={css.container}>
            <PageHeader title="Voice" />
            <PaywallView>
                <PaywallViewLeftContainer>
                    <PaywallViewHeader title={paywallTitle} />
                    <PaywallViewChecklist>
                        {descriptions.map((description, index) => (
                            <PaywallViewChecklistItem key={index}>
                                {description}
                            </PaywallViewChecklistItem>
                        ))}
                    </PaywallViewChecklist>
                    <PaywallViewActionButtons>
                        <Link to={primaryButtonUrl}>
                            <Button>{primaryButtonText}</Button>
                        </Link>
                        <LinkButton intent="secondary" href={greyButtonUrl}>
                            {greyButtonText}
                        </LinkButton>
                    </PaywallViewActionButtons>
                    <div className={css.learnMoreLinks}>
                        <LearnMoreLink
                            url={integrationConfig?.setupGuide ?? ''}
                        >
                            How to set up
                        </LearnMoreLink>
                        <LearnMoreLink
                            url={integrationConfig?.pricingLink ?? ''}
                        >
                            Pricing
                        </LearnMoreLink>
                    </div>
                </PaywallViewLeftContainer>
                <PaywallViewRightContainer>
                    <HeroImageCarousel slides={slidesData} />
                </PaywallViewRightContainer>
            </PaywallView>
        </div>
    )
}
