import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import _get from 'lodash/get'
import React from 'react'

import ThemeList from 'pages/settings/yourProfile/components/ThemeList'
import {THEME_TYPES, THEMES} from 'theme'

describe('ThemeList', () => {
    it('should render all themes', () => {
        const {getByText} = render(
            <ThemeList
                savedTheme={THEME_TYPES.Dark}
                onChangeTheme={jest.fn()}
            />
        )

        Object.values(THEMES).forEach((theme) => {
            expect(
                getByText(_get(theme, 'settingsLabel') || theme.label)
            ).toBeInTheDocument()
            expect(getByText(theme.icon)).toBeInTheDocument()
        })
    })

    it('should update the theme when clicking on a theme', () => {
        const onChangeThemeSpy = jest.fn()

        render(
            <ThemeList
                savedTheme={THEME_TYPES.Dark}
                onChangeTheme={onChangeThemeSpy}
            />
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
        expect(onChangeThemeSpy).toHaveBeenCalledWith('dark')

        // Light
        const lightTheme = screen.getAllByRole('radio')[2]
        expect(lightTheme).toHaveTextContent('Light')
        userEvent.click(lightTheme)
        expect(onChangeThemeSpy).toHaveBeenCalledTimes(3)
        expect(onChangeThemeSpy).toHaveBeenCalledWith('light')

        // Classic
        const classicTheme = screen.getAllByRole('radio')[3]
        expect(classicTheme).toHaveTextContent('Classic')
        userEvent.click(classicTheme)
        expect(onChangeThemeSpy).toHaveBeenCalledTimes(4)
        expect(onChangeThemeSpy).toHaveBeenCalledWith('modern light')
    })
})
