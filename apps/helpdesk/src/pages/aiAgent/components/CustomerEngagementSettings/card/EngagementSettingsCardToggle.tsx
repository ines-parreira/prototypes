import { useMemo } from 'react'

import { Badge, IconButton } from '@gorgias/axiom'

import { NewToggleButton } from 'pages/common/forms/NewToggleButton'

import css from './EngagementSettingsCard.less'

export type EngagementSettingsCardToggleProps = {
    isChecked: boolean
    isDisabled?: boolean
    onChange: (value: boolean) => void
    onSettingsClick?: () => void
    withBadges?: boolean
    isDesktopOnly?: boolean
}

export const EngagementSettingsCardToggle = ({
    isChecked,
    isDisabled = false,
    onChange,
    onSettingsClick,
    withBadges = false,
    isDesktopOnly = false,
}: EngagementSettingsCardToggleProps) => {
    const showDeviceBadges = isChecked && withBadges
    const showSettingsButton = withBadges && onSettingsClick

    const handleSettingsClick = useMemo(
        () => (event: React.MouseEvent) => {
            event.stopPropagation()
            onSettingsClick?.()
        },
        [onSettingsClick],
    )

    return (
        <div className={css.cardToggle}>
            {showDeviceBadges && isDesktopOnly && (
                <Badge type="blue">
                    <i className="material-icons-outlined">desktop_mac</i>
                    Desktop only
                </Badge>
            )}

            {showSettingsButton && (
                <IconButton
                    icon="settings"
                    intent="secondary"
                    fillStyle="ghost"
                    onClick={handleSettingsClick}
                    aria-label="Open settings"
                />
            )}

            <NewToggleButton
                isDisabled={isDisabled}
                checked={isChecked}
                onChange={onChange}
                aria-label={
                    isChecked ? 'Disable engagement' : 'Enable engagement'
                }
            />
        </div>
    )
}
