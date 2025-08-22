import { useParams } from 'react-router-dom'

import { OpportunitiesLayout } from './components/OpportunitiesLayout/OpportunitiesLayout'

export const AiAgentOpportunities = () => {
    const { shopName } = useParams<{
        shopName: string
    }>()
    return <OpportunitiesLayout key={shopName} />
}
