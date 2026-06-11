import React from 'react'

import { useHelpdeskV2WayfindingMS1Flag } from '@repo/feature-flags'
import { assumeMock, render, userEvent } from '@repo/testing'
import { screen } from '@testing-library/react'

import { THEME_CONFIGS, THEME_NAME } from 'core/theme'
import { ThemeList } from 'pages/settings/yourProfile/components/ThemeList'

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useHelpdeskV2WayfindingMS1Flag: jest.fn(),
}))

const useHelpdeskV2WayfindingMS1FlagMock = assumeMock(
    useHelpdeskV2WayfindingMS1Flag,
)

describe('ThemeList', () => {
    beforeEach(() => {
        useHelpdeskV2WayfindingMS1FlagMock.mockReturnValue(false)
    })

    it('should render all themes', () => {
        const { getByText } = render(
            <ThemeList
                savedTheme={THEME_NAME.Dark}
                onChangeTheme={jest.fn()}
            />,
        )

        THEME_CONFIGS.forEach((themeConfig) => {
            expect(
                getByText(themeConfig.settingsLabel || themeConfig.label),
            ).toBeInTheDocument()
            expect(getByText(themeConfig.icon)).toBeInTheDocument()
        })
    })

    it('should update the theme when clicking on a theme', () => {
        const onChangeThemeSpy = jest.fn()

        render(
            <ThemeList
                savedTheme={THEME_NAME.Dark}
                onChangeTheme={onChangeThemeSpy}
            />,
        )

        expect(screen.getAllByRole('radio').length).toBe(4)

        // System
        const systemTheme = screen.getAllByRole('radio')[0]
        expect(systemTheme).toHaveTextContent('System')
        userEvent.click(systemTheme)
        expect(onChangeThemeSpy).toHaveBeenCalledTimes(1)
        expect(onChangeThemeSpy).toHaveBeenCalledWith('system')

        // Dark
        const darkTheme = screen.getAllByRole('radio')[1]
        expect(darkTheme).toHaveTextContent('Dark')
        userEvent.click(darkTheme)
        expect(onChangeThemeSpy).toHaveBeenCalledTimes(2)
        expect(onChangeThemeSpy).toHaveBeenCalledWith(THEME_NAME.Dark)

        // Light
        const lightTheme = screen.getAllByRole('radio')[2]
        expect(lightTheme).toHaveTextContent('Light')
        userEvent.click(lightTheme)
        expect(onChangeThemeSpy).toHaveBeenCalledTimes(3)
        expect(onChangeThemeSpy).toHaveBeenCalledWith(THEME_NAME.Light)

        // Classic
        const classicTheme = screen.getAllByRole('radio')[3]
        expect(classicTheme).toHaveTextContent('Classic')
        userEvent.click(classicTheme)
        expect(onChangeThemeSpy).toHaveBeenCalledTimes(4)
        expect(onChangeThemeSpy).toHaveBeenCalledWith(THEME_NAME.Classic)
    })

    it('should hide the Classic theme when the wayfinding MS1 flag is on', () => {
        useHelpdeskV2WayfindingMS1FlagMock.mockReturnValue(true)

        const { queryByText } = render(
            <ThemeList
                savedTheme={THEME_NAME.Dark}
                onChangeTheme={jest.fn()}
            />,
        )

        expect(screen.getAllByRole('radio').length).toBe(3)
        expect(queryByText('Classic')).not.toBeInTheDocument()
    })
})
