import { Redirect, useLocation, useParams } from 'react-router-dom'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'

import { useAppSelector } from 'hooks/useAppSelector'
import { getAiAgentBasePath } from 'pages/aiAgent/hooks/useAiAgentNavigation'
import { getCurrentAccountState } from 'state/currentAccount/selectors'

import { AiAgentConfigurationView } from './AiAgentConfigurationView/AiAgentConfigurationView'

const AiAgentConfigurationContainer = () => {
    const { shopName, shopType } = useParams<{
        shopName: string
        shopType: string
    }>()
    const location = useLocation()
    const currentAccount = useAppSelector(getCurrentAccountState)
    const accountDomain = currentAccount.get('domain')
    const isInstagramDmsEnabled = useFlag(FeatureFlagKey.AiAgentInstagramDms)

    // Determine which section to show based on the route
    let section: 'chat' | 'email' | 'sms' | 'socials' | undefined
    if (location.pathname.includes('/deploy/chat')) {
        section = 'chat'
    } else if (location.pathname.includes('/deploy/email')) {
        section = 'email'
    } else if (location.pathname.includes('/deploy/sms')) {
        section = 'sms'
    } else if (location.pathname.includes('/deploy/socials')) {
        section = 'socials'
    }

    if (section === 'socials' && !isInstagramDmsEnabled) {
        return <Redirect to={`${getAiAgentBasePath(shopName)}/deploy/email`} />
    }

    return (
        <AiAgentConfigurationView
            accountDomain={accountDomain}
            shopName={shopName}
            shopType={shopType}
            section={section}
        />
    )
}

export { AiAgentConfigurationContainer }
