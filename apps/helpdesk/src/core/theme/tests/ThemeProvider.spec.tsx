import { useContext } from 'react'

import { render, screen, waitFor } from '@testing-library/react'

import type { LegacyTheme } from '@gorgias/axiom'
import { ThemeContext as UIKitThemeContext } from '@gorgias/axiom'
import { THEME_NAME } from '@gorgias/design-tokens'

import AppThemeContext from '../ThemeContext'
import ThemeProvider from '../ThemeProvider'

describe('ThemeProvider', () => {
    it('should provide the theme context and render its children', () => {
        let UIKitTheme
        let AppTheme
        const TestComponent = () => {
            UIKitTheme = useContext(UIKitThemeContext)
            AppTheme = useContext(AppThemeContext)
            return <p>Test component</p>
        }

        const { getByText } = render(
            <ThemeProvider>
                <TestComponent />
            </ThemeProvider>,
        )

        expect(getByText('Test component')).toBeInTheDocument()
        expect(UIKitTheme).toEqual({
            name: THEME_NAME.Light,
            tokens: expect.any(Object),
        })
        expect(AppTheme).toEqual({
            setTheme: expect.any(Function),
            theme: {
                name: THEME_NAME.Light,
                resolvedName: THEME_NAME.Light,
                tokens: expect.any(Object),
            },
        })
    })

    it('should pass iconSpriteUrl to UIKitThemeProvider if the sprite is available', async () => {
        let UIKitTheme: LegacyTheme | null = null

        const TestComponent = () => {
            UIKitTheme = useContext(UIKitThemeContext)
            return <p>Test component</p>
        }

        const object = document.createElement('object')
        object.id = 'icons'
        object.ariaLabel = 'icons'
        object.data = '/test/assets/icons.svg'
        document.body.appendChild(object)

        render(
            <ThemeProvider>
                <TestComponent />
            </ThemeProvider>,
        )

        await waitFor(() => {
            expect(screen.getByText('Test component')).toBeInTheDocument()
            expect(UIKitTheme).toEqual(
                expect.objectContaining({
                    iconSpriteUrl: '/test/assets/icons.svg',
                }),
            )
        })
    })
})
