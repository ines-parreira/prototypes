import {render} from '@testing-library/react'
import React from 'react'

import {assumeMock} from 'utils/testing'

import useActiveItem from '../../hooks/useActiveItem'
import GlobalNavigation from '../GlobalNavigation'

jest.mock('../../hooks/useActiveItem', () => jest.fn())
const useActiveItemMock = assumeMock(useActiveItem)

describe('GlobalNavigation', () => {
    beforeEach(() => {
        useActiveItemMock.mockReturnValue('tickets')
    })

    it('should render the home icon', () => {
        const {getByText} = render(<GlobalNavigation />)
        expect(getByText('home')).toBeInTheDocument()
    })
})
