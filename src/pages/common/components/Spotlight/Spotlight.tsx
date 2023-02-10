import React, {ReactNode, useEffect, useState} from 'react'
import {useFlags} from 'launchdarkly-react-client-sdk'

import {logEvent, SegmentEvent} from 'store/middlewares/segmentTracker'
import {SpotlightContext} from 'providers/ui/SpotlightContext'
import shortcutManager from 'services/shortcutManager/shortcutManager'
import {FeatureFlagKey} from 'config/featureFlags'

import SpotlightModal from './SpotlightModal'

type Props = {
    children: ReactNode
}

const Spotlight = ({children}: Props) => {
    const isSpotlightEnabled = useFlags()[FeatureFlagKey.SpotlightGlobalSearch]

    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        shortcutManager.bind('SpotlightModal', {
            TOGGLE_SPOTLIGHT: {
                action: (e) => {
                    if (isSpotlightEnabled) {
                        e.preventDefault()
                        setIsOpen(true)
                    }
                    logEvent(SegmentEvent.GlobalSearchOpenShortcut)
                },
            },
        })
        return () => {
            shortcutManager.unbind('SpotlightModal')
        }
    }, [isSpotlightEnabled, setIsOpen])

    return (
        <SpotlightContext.Provider value={{isOpen, setIsOpen}}>
            <SpotlightModal
                isOpen={isOpen}
                onCloseModal={() => {
                    setIsOpen(false)
                }}
            />
            {children}
        </SpotlightContext.Provider>
    )
}

export default Spotlight
