import React, { useContext, useEffect } from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'
import { shortcutManager } from '@repo/utils'

import SpotlightModal from 'pages/common/components/Spotlight/SpotlightModal'
import { SpotlightContext } from 'providers/ui/SpotlightContext'

const Spotlight = () => {
    const { isOpen, setIsOpen } = useContext(SpotlightContext)

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
        <SpotlightModal
            isOpen={isOpen}
            onCloseModal={() => {
                setIsOpen(false)
            }}
        />
    )
}

export default Spotlight
