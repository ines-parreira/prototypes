import React from 'react'
import {render, screen} from '@testing-library/react'
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

describe('<TicketTag />', () => {
    it('should render the tag', () => {
        const text = 'shipping'
        const color = '#123456'

        const {container} = render(
            <TicketTag text={text} decoration={fromJS({color})} />
        )
        const tag = screen.getByText(text)

        expect(tag).toBeInTheDocument()
        expect(container.firstChild).toHaveStyle({
            color: '#fff',
        })
        expect(container.firstChild).toHaveStyle({
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
        const color = '#123456'

        const {container} = render(
            <ThemeContext.Provider
                value={
                    {theme: Theme.Dark} as ReturnType<typeof useThemeContext>
                }
            >
                <TicketTag text={label} decoration={fromJS({color})} />
            </ThemeContext.Provider>
        )

        expect(screen.getByText(label)).toBeInTheDocument()
        expect(container.firstChild).toHaveStyle({
            color: '#123456',
        })
        expect(container.firstChild).toHaveStyle({
            backgroundColor: 'hsl(210, 65%, 10%)',
        })
    })

    it('should let color choice be handled by Tag when tag color is invalid', () => {
        const label = 'shipping'
        const color = '#'

        const {container} = render(
            <TicketTag text={label} decoration={fromJS({color})} />
        )

        expect(container.firstChild).not.toHaveAttribute('style')
        expect(container.firstChild).toHaveClass('black')
    })
})
