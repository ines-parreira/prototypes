import { useState } from 'react'

import { useEffectOnce } from '@repo/hooks'

import { Button, LegacyLoadingSpinner as LoadingSpinner } from '@gorgias/axiom'

import { useJourneyContext } from 'AIJourney/providers'
import { AiAgentPlayground } from 'pages/aiAgent/PlaygroundV2/AiAgentPlayground'
import { useCollapsibleColumn } from 'pages/common/hooks/useCollapsibleColumn'

import css from './Playground.less'

export const Playground = () => {
    const [shouldPlaygroundReset, setShouldPlaygroundReset] =
        useState<boolean>(false)
    const { journeyData, isLoading } = useJourneyContext()
    const { isCollapsibleColumnOpen, setIsCollapsibleColumnOpen } =
        useCollapsibleColumn()

    useEffectOnce(() => {
        setIsCollapsibleColumnOpen(true)

        return () => setIsCollapsibleColumnOpen(false)
    })

    if (isLoading) {
        return <LoadingSpinner />
    }

    return (
        <div className={css.playground}>
            <div className={css.actions}>
                <Button
                    leadingSlot="undo"
                    variant="secondary"
                    onClick={() => setShouldPlaygroundReset(true)}
                >
                    Reset
                </Button>
                {!isCollapsibleColumnOpen && (
                    <Button
                        leadingSlot="settings"
                        onClick={() =>
                            setIsCollapsibleColumnOpen(!isCollapsibleColumnOpen)
                        }
                        aria-label="open settings"
                    >
                        Configure
                    </Button>
                )}
            </div>
            <div className={css.container}>
                <AiAgentPlayground
                    supportedModes={['outbound', 'inbound']}
                    shopName={journeyData?.store_name}
                    resetPlayground={shouldPlaygroundReset}
                    resetPlaygroundCallback={() =>
                        setShouldPlaygroundReset(false)
                    }
                    withSettingsOnSidePanel
                />
            </div>
        </div>
    )
}
