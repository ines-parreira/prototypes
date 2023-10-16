import React, {ReactNode, useEffect, useState} from 'react'

import {logEvent, SegmentEvent} from 'store/middlewares/segmentTracker'
import {SpotlightContext} from 'providers/ui/SpotlightContext'
import shortcutManager from 'services/shortcutManager/shortcutManager'

import SpotlightModal from './SpotlightModal'

type Props = {
    children: ReactNode
}

const Spotlight = ({children}: Props) => {
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        shortcutManager.bind('SpotlightModal', {
            TOGGLE_SPOTLIGHT: {
                action: (e) => {
                    e.preventDefault()
                    setIsOpen(true)
                    logEvent(SegmentEvent.GlobalSearchOpenShortcut)
                },
            },
        })
        return () => {
            shortcutManager.unbind('SpotlightModal')
        }
    }, [setIsOpen])

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
