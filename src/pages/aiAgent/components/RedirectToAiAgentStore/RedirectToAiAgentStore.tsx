import {LoadingSpinner} from '@gorgias/merchant-ui-kit'
import React from 'react'

import {useHistory} from 'react-router-dom'

import useAppSelector from 'hooks/useAppSelector'

import {useAiAgentNavigation} from 'pages/aiAgent/hooks/useAiAgentNavigation'
import StoreIntegrationView from 'pages/automate/common/components/StoreIntegrationView'
import {getShopifyIntegrationsSortedByName} from 'state/integrations/selectors'

import css from './RedirectToAiAgentStore.less'

export const RedirectToAiAgentStore = () => {
    const storeIntegrations = useAppSelector(getShopifyIntegrationsSortedByName)

    const firstStore = storeIntegrations[0]
    const aiAgentNavigation = useAiAgentNavigation({
        shopName: firstStore?.name ?? '',
    })
    const history = useHistory()
    if (firstStore) {
        history.replace(aiAgentNavigation.routes.main)
    } else {
        return <StoreIntegrationView title="AI Agent" />
    }

    return (
        <div className={css.spinner}>
            <LoadingSpinner size="big" />
        </div>
    )
}
