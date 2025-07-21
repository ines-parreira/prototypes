import { useParams } from 'react-router-dom'

import useAppSelector from 'hooks/useAppSelector'
import { getCurrentAccountState } from 'state/currentAccount/selectors'

import { AiAgentLayout } from '../components/AiAgentLayout/AiAgentLayout'
import { KNOWLEDGE } from '../constants'
import { useGetOrCreateSnippetHelpCenter } from '../hooks/useGetOrCreateSnippetHelpCenter'
import AiAgentScrapedDomainQuestionsView from './AiAgentScrapedDomainQuestionsView'

import css from './AiAgentScrapedDomainQuestionsContainer.less'

const AiAgentScrapedDomainQuestionsContainer = () => {
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
            title={KNOWLEDGE}
        >
            {helpCenter && (
                <AiAgentScrapedDomainQuestionsView
                    helpCenterId={helpCenter?.id}
                    shopName={shopName}
                    defaultLocale={helpCenter?.default_locale}
                />
            )}
        </AiAgentLayout>
    )
}

export default AiAgentScrapedDomainQuestionsContainer
