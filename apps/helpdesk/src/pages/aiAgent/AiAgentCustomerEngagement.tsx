import { useParams } from 'react-router-dom'

import { AiAgentLayout } from './components/AiAgentLayout/AiAgentLayout'
import { CustomerEngagementSettings } from './components/CustomerEngagementSettings/CustomerEngagementSettings'
import { SALES } from './constants'

import css from './AiAgentCustomerEngagement.less'

export const AiAgentCustomerEngagement = () => {
    const { shopName } = useParams<{
        shopName: string
    }>()

    return (
        <AiAgentLayout
            className={css.container}
            shopName={shopName}
            title={SALES}
        >
            <CustomerEngagementSettings />
        </AiAgentLayout>
    )
}
