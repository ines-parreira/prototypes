import React from 'react'
import {render} from '@testing-library/react'
import {fromJS} from 'immutable'

import {Theme, ThemeContext, useThemeContext} from 'theme'
import {getEnoughContrastedColor} from 'utils/colors'

import TicketTag from '../TicketTag'

jest.mock(
    'utils/colors',
    () =>
        ({
            ...jest.requireActual('utils/colors'),
            getEnoughContrastedColor: jest.fn(),
        } as Record<string, any>)
)

const mockedDefaultColor = '#733326' // hsl(10, 50%, 30%)
jest.mock(
    '@gorgias/design-tokens/dist/tokens/color/merchantLight.json',
    () => ({
        Light: {
            Main: {
                Secondary: {
                    value: '#733326',
                },
            },
        },
    })
)

describe('<TicketTag />', () => {
    it('should render the tag', () => {
        const label = 'shipping'
        const color = '#123456'

        const {getByText} = render(
            <TicketTag title="Foo" decoration={fromJS({color})}>
                {label}
            </TicketTag>
        )
        const tag = getByText(label)
        expect(tag).toBeInTheDocument()
        expect(tag).toHaveStyle({
            color: '#fff',
        })
        expect(tag).toHaveStyle({
            backgroundColor: color,
        })
    })

    it('should render the tag for dark theme', () => {
        ;(
            getEnoughContrastedColor as jest.MockedFunction<
                typeof getEnoughContrastedColor
            >
        ).mockReturnValue('#123456')

        const label = 'shipping'
        const color = '#123456' // hsl(210, 65%, 20%)

        const {getByText} = render(
            <ThemeContext.Provider
                value={
                    {theme: Theme.Dark} as ReturnType<typeof useThemeContext>
                }
            >
                <TicketTag title="Foo" decoration={fromJS({color})}>
                    {label}
                </TicketTag>
            </ThemeContext.Provider>
        )
        const tag = getByText(label)
        expect(tag).toHaveStyle({
            color: '#123456',
        })
        expect(tag).toHaveStyle({
            backgroundColor: 'hsl(210, 65%, 10%)',
        })
    })

    it('should fallback to default color when tag color is invalid', () => {
        const label = 'shipping'
        const color = '#'

        const {getByText} = render(
            <TicketTag decoration={fromJS({color})}>{label}</TicketTag>
        )
        const tag = getByText(label)
        expect(tag).toHaveStyle({
            color: '#fff',
        })
        expect(tag).toHaveStyle({
            backgroundColor: mockedDefaultColor,
        })
    })
})
