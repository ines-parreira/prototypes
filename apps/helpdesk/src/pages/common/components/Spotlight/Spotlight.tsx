import { useEffect } from 'react'

import { useHelpdeskV2MS4Dash6Flag } from '@repo/feature-flags'
import { logEvent, SegmentEvent } from '@repo/logging'
import { SearchSpotlightRoot } from '@repo/search'
import { shortcutManager } from '@repo/utils'

import { useAppSelector } from 'hooks/useAppSelector'
import { ProductType } from 'models/billing/types'
import { SpotlightModal } from 'pages/common/components/Spotlight/SpotlightModal'
import { useSpotlightContext } from 'providers/ui/SpotlightContext'
import { currentAccountHasProduct } from 'state/billing/selectors'

const Spotlight = () => {
    const { isOpen, setIsOpen } = useSpotlightContext()
    const showCalls = useAppSelector(
        currentAccountHasProduct(ProductType.Voice),
    )
    const hasUIVisionMS4Dash6 = useHelpdeskV2MS4Dash6Flag()

    useEffect(() => {
        shortcutManager.bind('SpotlightTrigger', {
            TOGGLE_SPOTLIGHT: {
                action: (e) => {
                    e.preventDefault()
                    setIsOpen(true)
                    logEvent(SegmentEvent.GlobalSearchOpenShortcut)
                },
            },
        })
        return () => {
            shortcutManager.unbind('SpotlightTrigger')
        }
    }, [setIsOpen])

    if (hasUIVisionMS4Dash6) {
        return (
            <SearchSpotlightRoot
                isOpen={isOpen}
                showCalls={showCalls}
                onClose={() => {
                    setIsOpen(false)
                }}
            />
        )
    }

    return (
        <SpotlightModal
            isOpen={isOpen}
            onCloseModal={() => {
                setIsOpen(false)
            }}
        />
    )
}

export { Spotlight }
