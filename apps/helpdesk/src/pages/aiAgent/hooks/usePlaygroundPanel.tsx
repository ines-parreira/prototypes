import { useCallback, useMemo } from 'react'

import { useParams } from 'react-router'

import { useAppContext } from 'pages/AppContext'

import { PlaygroundPanel } from '../components/PlaygroundPanel/PlaygroundPanel'

const REMOVE_CHILDREN_DELAY = 300

export const usePlaygroundPanel = () => {
    const { shopName } = useParams<{
        shopName?: string
    }>()

    const {
        setCollapsibleColumnChildren,
        isCollapsibleColumnOpen,
        setIsCollapsibleColumnOpen,
    } = useAppContext()

    const playgroundPanel = useMemo(
        () => <PlaygroundPanel shopName={shopName} />,
        [shopName],
    )

    const openPlayground = useCallback(async () => {
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
