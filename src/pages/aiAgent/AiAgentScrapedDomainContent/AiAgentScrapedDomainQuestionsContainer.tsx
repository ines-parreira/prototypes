import { useFlags } from 'launchdarkly-react-client-sdk'
import { useParams } from 'react-router-dom'

import { FeatureFlagKey } from 'config/featureFlags'
import useAppSelector from 'hooks/useAppSelector'
import { getCurrentAccountState } from 'state/currentAccount/selectors'

import { AiAgentLayout } from '../components/AiAgentLayout/AiAgentLayout'
import { AI_AGENT, KNOWLEDGE } from '../constants'
import { useGetOrCreateSnippetHelpCenter } from '../hooks/useGetOrCreateSnippetHelpCenter'
import AiAgentScrapedDomainQuestionsView from './AiAgentScrapedDomainQuestionsView'

import css from './AiAgentScrapedDomainQuestionsContainer.less'

const AiAgentScrapedDomainQuestionsContainer = () => {
    const isStandaloneMenuEnabled =
        useFlags()[FeatureFlagKey.ConvAiStandaloneMenu]

    const { shopName } = useParams<{
        shopName: string
    }>()

    const currentAccount = useAppSelector(getCurrentAccountState)
    const accountDomain = currentAccount.get('domain')

    const { helpCenter } = useGetOrCreateSnippetHelpCenter({
        accountDomain,
        shopName,
    })

    return (
        <AiAgentLayout
            className={css.container}
            shopName={shopName}
            title={isStandaloneMenuEnabled ? KNOWLEDGE : AI_AGENT}
        >
            {helpCenter && (
                <AiAgentScrapedDomainQuestionsView
                    helpCenterId={helpCenter?.id}
                    shopName={shopName}
                />
            )}
        </AiAgentLayout>
    )
}

export default AiAgentScrapedDomainQuestionsContainer
