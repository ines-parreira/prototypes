import React, {ReactNode, useContext, useEffect, useState} from 'react'
import {useFlags} from 'launchdarkly-react-client-sdk'

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
    const {isOpen: isOpenContext} = useContext(SpotlightContext)

    useEffect(() => {
        shortcutManager.bind('SpotlightModal', {
            TOGGLE_SPOTLIGHT: {
                action: (e) => {
                    if (isSpotlightEnabled) {
                        e.preventDefault()
                        setIsOpen(!isOpenContext)
                    }
                },
            },
        })
        return () => {
            shortcutManager.unbind('SpotlightModal')
        }
    }, [isSpotlightEnabled, isOpenContext, setIsOpen])

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
