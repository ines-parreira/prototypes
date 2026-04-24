import { useCallback, useMemo } from 'react'

import { logEvent, SegmentEvent } from '@repo/logging'

import { MenuItem, SubMenu } from '@gorgias/axiom'
import { THEME_NAME } from '@gorgias/design-tokens'

import { THEME_CONFIGS, useSetTheme, useTheme } from 'core/theme'
import type { HelpdeskThemeName } from 'core/theme'

export function UserMenuThemeSubMenu() {
    const theme = useTheme()
    const setTheme = useSetTheme()

    const selectedTheme = THEME_CONFIGS.find(({ name }) => name === theme.name)!

    const themeItems = useMemo(
        () => THEME_CONFIGS.filter(({ name }) => name !== THEME_NAME.Classic),
        [],
    )

    const updateTheme = useCallback(
        (name: HelpdeskThemeName) => {
            setTheme(name)
            logEvent(SegmentEvent.ThemeUpdate, { theme: name })
        },
        [setTheme],
    )

    return (
        <SubMenu
            id="theme"
            label={`Theme: ${selectedTheme?.settingsLabel || selectedTheme?.label}`}
            selectedKeys={theme.name ? [theme.name] : []}
            selectionMode="single"
        >
            {themeItems.map(({ label, name }) => (
                <MenuItem
                    key={name}
                    id={name}
                    label={label}
                    onAction={() => updateTheme(name)}
                />
            ))}
        </SubMenu>
    )
}
