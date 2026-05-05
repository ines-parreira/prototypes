import { logEvent, SegmentEvent } from '@repo/logging'
import { assumeMock, render, userEvent } from '@repo/testing'
import { screen, within } from '@testing-library/react'

import { Button, Menu } from '@gorgias/axiom'

import { THEME_NAME, useTheme } from 'core/theme'
import type { HelpdeskThemeName } from 'core/theme'

import { UserMenuThemeSubMenu } from '../UserMenuThemeSubMenu'

jest.mock('core/theme', () => ({
    ...jest.requireActual('core/theme'),
    useTheme: jest.fn(),
    useSetTheme: jest.fn(),
}))

jest.mock('@repo/logging', () => ({
    ...jest.requireActual('@repo/logging'),
    logEvent: jest.fn(),
}))

const useThemeMock = assumeMock(useTheme)
const { useSetTheme } = jest.requireMock('core/theme')
const useSetThemeMock = useSetTheme as jest.Mock
const logEventMock = assumeMock(logEvent)

const renderInMenu = () =>
    render(
        <Menu defaultOpen trigger={<Button>Open menu</Button>}>
            <UserMenuThemeSubMenu />
        </Menu>,
    )

const openSubMenu = async () => {
    const user = userEvent.setup()
    await user.hover(screen.getByRole('menuitem', { name: /Theme:/ }))
    return user
}

describe('UserMenuThemeSubMenu', () => {
    let setThemeSpy: jest.Mock

    beforeEach(() => {
        setThemeSpy = jest.fn()
        useSetThemeMock.mockReturnValue(setThemeSpy)
        useThemeMock.mockReturnValue({
            name: THEME_NAME.Light,
            resolvedName: THEME_NAME.Light,
            tokens: {} as any,
        })
    })

    it('shows the current theme label on the submenu trigger', () => {
        renderInMenu()

        expect(
            screen.getByRole('menuitem', { name: /Theme: Light/ }),
        ).toBeInTheDocument()
    })

    it('uses settingsLabel when it is defined on the theme (system → "System")', () => {
        useThemeMock.mockReturnValue({
            name: 'system',
            resolvedName: THEME_NAME.Light,
            tokens: {} as any,
        })

        renderInMenu()

        expect(
            screen.getByRole('menuitem', { name: /Theme: System/ }),
        ).toBeInTheDocument()
    })

    it('falls back gracefully when the current theme name does not match any known theme', () => {
        useThemeMock.mockReturnValue({
            name: 'unknown' as HelpdeskThemeName,
            resolvedName: THEME_NAME.Light,
            tokens: {} as any,
        })

        renderInMenu()

        expect(
            screen.getByRole('menuitem', { name: /Theme:/ }),
        ).toBeInTheDocument()
    })

    it('omits the Classic theme from the list of selectable options', async () => {
        renderInMenu()
        await openSubMenu()

        const submenu = await screen.findByRole('menu', { name: /Theme:/ })
        expect(
            within(submenu).queryByRole('menuitemradio', { name: 'Classic' }),
        ).not.toBeInTheDocument()
        expect(
            within(submenu).getByRole('menuitemradio', {
                name: 'Use system setting',
            }),
        ).toBeInTheDocument()
        expect(
            within(submenu).getByRole('menuitemradio', { name: 'Dark' }),
        ).toBeInTheDocument()
        expect(
            within(submenu).getByRole('menuitemradio', { name: 'Light' }),
        ).toBeInTheDocument()
    })

    it('marks the current theme as selected in the submenu', async () => {
        useThemeMock.mockReturnValue({
            name: THEME_NAME.Dark,
            resolvedName: THEME_NAME.Dark,
            tokens: {} as any,
        })

        renderInMenu()
        await openSubMenu()

        const submenu = await screen.findByRole('menu', { name: /Theme:/ })
        expect(
            within(submenu).getByRole('menuitemradio', {
                name: 'Dark',
                checked: true,
            }),
        ).toBeInTheDocument()
    })

    it('calls setTheme and logs the theme update when a theme item is selected', async () => {
        renderInMenu()
        const user = await openSubMenu()

        const submenu = await screen.findByRole('menu', { name: /Theme:/ })
        await user.click(
            within(submenu).getByRole('menuitemradio', { name: 'Dark' }),
        )

        expect(setThemeSpy).toHaveBeenCalledWith(THEME_NAME.Dark)
        expect(logEventMock).toHaveBeenCalledWith(SegmentEvent.ThemeUpdate, {
            theme: THEME_NAME.Dark,
        })
    })
})
