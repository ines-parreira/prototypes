import type { ReactNode } from 'react'

import { Button, OverlayStateProvider } from '@gorgias/axiom'
import type { IconName } from '@gorgias/axiom'

import type { SidePanelMode } from '../../types'

import css from './SidePanelShell.less'

export type SidePanelRailItem = {
    id: SidePanelMode
    iconName: IconName
    label: string
}

type Props = {
    mode: SidePanelMode
    isOpen: boolean
    onToggleOpen: () => void
    onModeChange: (mode: SidePanelMode) => void
    railItems: SidePanelRailItem[]
    children: ReactNode
    ariaLabelledBy?: string
}

export const SidePanelShell = ({
    mode,
    isOpen,
    onToggleOpen,
    onModeChange,
    railItems,
    children,
    ariaLabelledBy,
}: Props) => {
    const handleRailClick = (id: SidePanelMode) => {
        if (!isOpen) {
            onToggleOpen()
        }
        onModeChange(id)
    }

    return (
        <div className={css.shell} data-side-panel-mode={mode}>
            {isOpen && (
                <OverlayStateProvider
                    isOpen={isOpen}
                    onOpenChange={(open) => {
                        if (!open) onToggleOpen()
                    }}
                >
                    <section
                        className={css.panel}
                        aria-labelledby={ariaLabelledBy}
                    >
                        {children}
                    </section>
                </OverlayStateProvider>
            )}
            <nav
                className={css.rail}
                aria-label="Side panel navigation"
                aria-orientation="vertical"
            >
                <Button
                    as="button"
                    variant="tertiary"
                    intent="regular"
                    icon={isOpen ? 'system-bar-collapse' : 'system-bar-expand'}
                    aria-label={isOpen ? 'Collapse panel' : 'Expand panel'}
                    aria-expanded={isOpen}
                    onClick={onToggleOpen}
                />
                {railItems.map((item) => {
                    const isActive = isOpen && mode === item.id
                    return (
                        <Button
                            key={item.id}
                            as="button"
                            variant={isActive ? 'secondary' : 'tertiary'}
                            intent="regular"
                            icon={item.iconName}
                            aria-label={item.label}
                            aria-pressed={isActive}
                            onClick={() => handleRailClick(item.id)}
                        />
                    )
                })}
            </nav>
        </div>
    )
}
