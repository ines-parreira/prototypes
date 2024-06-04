import React from 'react'
import {render} from '@testing-library/react'

import useCandu from 'candu/useCandu'

import HomePageLink from '../HomePageLink'

jest.mock('candu/useCandu')

const useCanduMock = useCandu as jest.Mock

describe('<HomePageLink />', () => {
    it('should not render the link if candu has not loaded', () => {
        const {queryByTestId} = render(<HomePageLink />)

        expect(queryByTestId('home-page-link')).toBe(null)
    })

    it('should render the link if candu has some nodes injected', () => {
        useCanduMock.mockReturnValue(true)

        const {baseElement, queryByTestId} = render(<HomePageLink />)

        expect(queryByTestId('home-page-link')).not.toBe(null)
        expect(baseElement).toMatchSnapshot()
    })
})
