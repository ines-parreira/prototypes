import { useEffectOnce } from '@repo/hooks'

import { LegacyLoadingSpinner as LoadingSpinner } from '@gorgias/axiom'

import { useJourneyContext } from 'AIJourney/providers'
import { AiAgentPlayground } from 'pages/aiAgent/PlaygroundV2/AiAgentPlayground'
import { useCollapsibleColumn } from 'pages/common/hooks/useCollapsibleColumn'

export const Playground = () => {
    const { journeyData, isLoading } = useJourneyContext()
    const { setIsCollapsibleColumnOpen } = useCollapsibleColumn()

    useEffectOnce(() => {
        setIsCollapsibleColumnOpen(true)
    })

    if (isLoading) {
        return <LoadingSpinner />
    }

    return (
        <AiAgentPlayground
            supportedModes={['outbound', 'inbound']}
            shopName={journeyData?.store_name}
            withSettingsOnSidePanel
        />
    )
}
