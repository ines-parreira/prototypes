import React from 'react'
import {render} from '@testing-library/react'
import {fromJS} from 'immutable'

import {Theme, ThemeContext, useThemeContext} from 'theme'
import {getEnoughContrastedColor} from 'utils/colors'

import TicketTag from '../TicketTag'

jest.mock('utils/colors')

const getEnoughContrastedColorMock = getEnoughContrastedColor as jest.Mock

describe('<TicketTag />', () => {
    it('should render the tag', () => {
        const label = 'shipping'
        const color = '#123456' // hsl(210, 65%, 20%)

        const {getByText} = render(
            <TicketTag title="Foo" decoration={fromJS({color})}>
                {label}
            </TicketTag>
        )
        const tag = getByText(label)
        expect(tag).toBeInTheDocument()
        expect(tag).toHaveStyle({
            color,
        })
        expect(tag).toHaveStyle({
            backgroundColor: 'hsl(210, 65%, 97%)',
        })
    })

    it('should render the tag for dark theme', () => {
        getEnoughContrastedColorMock.mockReturnValue('#123456')
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
})
