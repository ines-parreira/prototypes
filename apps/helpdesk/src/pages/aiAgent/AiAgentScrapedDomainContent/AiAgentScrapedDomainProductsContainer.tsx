import classNames from 'classnames'
import { useParams } from 'react-router-dom'

import useAppSelector from 'hooks/useAppSelector'
import { getCurrentAccountState } from 'state/currentAccount/selectors'

import { AiAgentLayout } from '../components/AiAgentLayout/AiAgentLayout'
import { PRODUCTS } from '../constants'
import { useGetOrCreateSnippetHelpCenter } from '../hooks/useGetOrCreateSnippetHelpCenter'
import AiAgentScrapedDomainProductsView from './AiAgentScrapedDomainProductsView'

import css from './AiAgentScrapedDomainProductsContainer.less'

const AiAgentScrapedDomainProductsContainer = () => {
    const { shopName } = useParams<{ shopName: string }>()

    const currentAccount = useAppSelector(getCurrentAccountState)
    const accountDomain = currentAccount.get('domain')

    const { helpCenter } = useGetOrCreateSnippetHelpCenter({
        accountDomain,
        shopName,
    })

    return (
        <AiAgentLayout
            className={classNames(css.container, css.noPadding)}
            shopName={shopName}
            title={PRODUCTS}
        >
            {helpCenter && (
                <AiAgentScrapedDomainProductsView
                    helpCenterId={helpCenter.id}
                    shopName={shopName}
                />
            )}
        </AiAgentLayout>
    )
}

export default AiAgentScrapedDomainProductsContainer
