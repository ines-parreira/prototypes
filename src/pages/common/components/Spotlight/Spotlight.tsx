import React, {useContext, useEffect} from 'react'

import {logEvent, SegmentEvent} from 'common/segment'
import {SpotlightContext} from 'providers/ui/SpotlightContext'
import shortcutManager from 'services/shortcutManager/shortcutManager'

import SpotlightModal from './SpotlightModal'

const Spotlight = () => {
    const {isOpen, setIsOpen} = useContext(SpotlightContext)

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
