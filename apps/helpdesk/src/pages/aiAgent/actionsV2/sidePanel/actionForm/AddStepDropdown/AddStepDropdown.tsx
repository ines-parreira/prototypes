import { useState } from 'react'

import { Box, Button, Icon, Popover, Text } from '@gorgias/axiom'

import { ProviderIcon } from '../../shared/ProviderIcon'
import type { ActionOption, AppOption } from '../../types'

import css from './AddStepDropdown.less'

type Props = {
    triggerLabel?: string
    connectedApps?: AppOption[]
    suggestedApps?: AppOption[]
    otherApps?: AppOption[]
    onSelectAction: (appId: string, actionId: string) => void
    onBuildAdvanced?: () => void
    /** Override popover placement; default 'bottom left'. */
    placement?:
        | 'bottom'
        | 'bottom left'
        | 'bottom right'
        | 'top'
        | 'top left'
        | 'top right'
}

type AppSection = { label: string; apps: AppOption[] }

export const AddStepDropdown = ({
    triggerLabel = 'Add step',
    connectedApps = [],
    suggestedApps = [],
    otherApps = [],
    onSelectAction,
    onBuildAdvanced,
    placement = 'bottom left',
}: Props) => {
    const [isOpen, setIsOpen] = useState(false)
    const [activeApp, setActiveApp] = useState<AppOption | null>(null)

    const close = () => {
        setIsOpen(false)
        setActiveApp(null)
    }

    const sections: AppSection[] = [
        connectedApps.length > 0
            ? { label: 'Connected', apps: connectedApps }
            : null,
        suggestedApps.length > 0
            ? { label: 'Relevant for you', apps: suggestedApps }
            : null,
        otherApps.length > 0 ? { label: 'Other apps', apps: otherApps } : null,
    ].filter((section): section is AppSection => section !== null)

    const renderAppList = () => (
        <div className={css.menu} role="menu">
            {onBuildAdvanced && (
                <>
                    <button
                        type="button"
                        className={css.advancedRow}
                        role="menuitem"
                        onClick={() => {
                            onBuildAdvanced()
                            close()
                        }}
                    >
                        <Icon name="settings-ai" size="sm" />
                        <Text size="sm" variant="medium">
                            Build advanced action
                        </Text>
                        <span className={css.spacer} />
                        <Icon name="arrow-chevron-right" size="xs" />
                    </button>
                    <div className={css.divider} role="separator" />
                </>
            )}
            {sections.map((section) => (
                <div key={section.label} className={css.section}>
                    <div className={css.sectionLabel}>
                        <Text size="sm" color="content-neutral-tertiary">
                            {section.label}
                        </Text>
                    </div>
                    {section.apps.map((app) => (
                        <button
                            key={app.id}
                            type="button"
                            className={css.appRow}
                            role="menuitem"
                            onClick={() => {
                                if (app.actions && app.actions.length > 0) {
                                    setActiveApp(app)
                                }
                            }}
                        >
                            <ProviderIcon
                                iconUrl={app.icon.iconUrl ?? ''}
                                alt={app.name}
                                size="sm"
                                variant="plain"
                            />
                            <Text size="sm" color="content-neutral-default">
                                {app.name}
                            </Text>
                            <span className={css.spacer} />
                            <Icon name="arrow-chevron-right" size="xs" />
                        </button>
                    ))}
                </div>
            ))}
        </div>
    )

    const renderActionList = (app: AppOption) => (
        <div className={css.menu} role="menu">
            <button
                type="button"
                className={css.backRow}
                role="menuitem"
                onClick={() => setActiveApp(null)}
            >
                <Icon name="arrow-chevron-left" size="xs" />
                <Text size="sm">{app.name}</Text>
            </button>
            {(app.actions ?? []).map((action: ActionOption) => (
                <button
                    key={action.id}
                    type="button"
                    className={css.appRow}
                    role="menuitem"
                    onClick={() => {
                        onSelectAction(app.id, action.id)
                        close()
                    }}
                >
                    <Text size="sm" color="content-neutral-default">
                        {action.name}
                    </Text>
                </button>
            ))}
        </div>
    )

    return (
        <Popover
            isOpen={isOpen}
            onOpenChange={(next) => {
                setIsOpen(next)
                if (!next) setActiveApp(null)
            }}
            placement={placement}
            padding={0}
            trigger={
                <Button
                    as="button"
                    variant="secondary"
                    size="sm"
                    intent="regular"
                    trailingSlot={
                        isOpen ? 'arrow-chevron-up' : 'arrow-chevron-down'
                    }
                >
                    {triggerLabel}
                </Button>
            }
        >
            <Box flexDirection="column" minWidth={260}>
                {activeApp ? renderActionList(activeApp) : renderAppList()}
            </Box>
        </Popover>
    )
}
