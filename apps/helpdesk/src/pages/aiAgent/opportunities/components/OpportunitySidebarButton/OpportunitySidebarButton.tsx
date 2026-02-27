import { useCallback } from 'react'

import { Button } from '@gorgias/axiom'

import { useOpportunitiesSidebar } from '../../hooks/useOpportunitiesSidebar'

import css from './OpportunitySidebarButton.less'

export const OpportunitySidebarButton = () => {
    const { isSidebarVisible, setIsSidebarVisible } = useOpportunitiesSidebar()

    const handleShowSidebar = useCallback(() => {
        setIsSidebarVisible(true)
    }, [setIsSidebarVisible])

    if (isSidebarVisible) {
        return null
    }

    return (
        <Button
            intent="regular"
            variant="secondary"
            icon="system-bar-collapse"
            size="sm"
            onClick={handleShowSidebar}
            aria-label="Show sidebar"
            className={css.sidebarButton}
        />
    )
}
