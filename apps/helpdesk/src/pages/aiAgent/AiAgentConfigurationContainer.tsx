import { useLocation, useParams } from 'react-router-dom'

import useAppSelector from 'hooks/useAppSelector'
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

    // Determine which section to show based on the route
    let section: 'chat' | 'email' | 'sms' | undefined
    if (location.pathname.includes('/deploy/chat')) {
        section = 'chat'
    } else if (location.pathname.includes('/deploy/email')) {
        section = 'email'
    } else if (location.pathname.includes('/deploy/sms')) {
        section = 'sms'
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

export default AiAgentConfigurationContainer
