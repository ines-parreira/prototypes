import { useFlags } from 'launchdarkly-react-client-sdk'
import { useParams } from 'react-router-dom'

import { FeatureFlagKey } from 'config/featureFlags'

import { AiAgentLayout } from '../components/AiAgentLayout/AiAgentLayout'
import { AI_AGENT, KNOWLEDGE } from '../constants'
import AiAgentScrapedDomainContentLayout from './AiAgentScrapedDomainContentLayout'
import ScrapedDomainProductsView from './ScrapedDomainProductsView'

import css from './AiAgentScrapedDomainProductsContainer.less'

const AiAgentScrapedDomainProductsContainer = () => {
    const isStandaloneMenuEnabled =
        useFlags()[FeatureFlagKey.ConvAiStandaloneMenu]

    const { shopName } = useParams<{
        shopName: string
    }>()

    return (
        <AiAgentLayout
            className={css.container}
            shopName={shopName}
            title={isStandaloneMenuEnabled ? KNOWLEDGE : AI_AGENT}
        >
            <AiAgentScrapedDomainContentLayout shopName={shopName}>
                <ScrapedDomainProductsView />
            </AiAgentScrapedDomainContentLayout>
        </AiAgentLayout>
    )
}

export default AiAgentScrapedDomainProductsContainer
