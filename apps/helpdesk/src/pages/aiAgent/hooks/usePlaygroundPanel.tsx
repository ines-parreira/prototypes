import { useCallback, useMemo } from 'react'

import { useParams } from 'react-router'

import type { DraftKnowledge } from 'pages/aiAgent/PlaygroundV2/types'
import { useAppContext } from 'pages/AppContext'

import { PlaygroundPanel } from '../components/PlaygroundPanel/PlaygroundPanel'

const REMOVE_CHILDREN_DELAY = 300

type Props = {
    draftKnowledge?: DraftKnowledge
}

export const usePlaygroundPanel = ({ draftKnowledge }: Props = {}) => {
    const { shopName } = useParams<{
        shopName?: string
    }>()

    const {
        setCollapsibleColumnChildren,
        isCollapsibleColumnOpen,
        setIsCollapsibleColumnOpen,
    } = useAppContext()

    const playgroundPanel = useMemo(
        () => (
            <PlaygroundPanel
                shopName={shopName}
                draftKnowledge={draftKnowledge}
            />
        ),
        [shopName, draftKnowledge],
    )

    const openPlayground = useCallback(async () => {
        // Force playground reload when it's opened
        setCollapsibleColumnChildren(null)
        setCollapsibleColumnChildren(playgroundPanel)

        setIsCollapsibleColumnOpen(true)
    }, [
        setCollapsibleColumnChildren,
        setIsCollapsibleColumnOpen,
        playgroundPanel,
    ])

    const closePlayground = useCallback(() => {
        setIsCollapsibleColumnOpen(false)
        setTimeout(() => {
            setCollapsibleColumnChildren(null)
        }, REMOVE_CHILDREN_DELAY)
    }, [setIsCollapsibleColumnOpen, setCollapsibleColumnChildren])

    const togglePlayground = useCallback(() => {
        if (isCollapsibleColumnOpen) {
            closePlayground()
        } else {
            openPlayground()
        }
    }, [isCollapsibleColumnOpen, openPlayground, closePlayground])

    return {
        openPlayground,
        closePlayground,
        togglePlayground,
        isPlaygroundOpen: isCollapsibleColumnOpen,
    }
}
