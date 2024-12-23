import {render, screen} from '@testing-library/react'
import React from 'react'

import {assumeMock} from 'utils/testing'

import useCount from '../../hooks/useCount'
import Badge from '../Badge'

jest.mock('../../hooks/useCount', () => jest.fn())
const useCountMock = assumeMock(useCount)

describe('Badge', () => {
    beforeEach(() => {
        useCountMock.mockReturnValue(0)
    })

    it('should return nothing if there are no notifications', () => {
        const {container} = render(<Badge />)
        expect(container).toBeEmptyDOMElement()
    })

    it('should show the notification count', () => {
        useCountMock.mockReturnValue(19)
        render(<Badge />)
        expect(screen.getByText('19')).toBeInTheDocument()
    })

    it('should show 99+ if there are more than 99 notifications', () => {
        useCountMock.mockReturnValue(200)
        render(<Badge />)
        expect(screen.getByText('99+')).toBeInTheDocument()
    })
})
