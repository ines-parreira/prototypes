import {render, screen} from '@testing-library/react'
import React from 'react'

import {assumeMock} from 'utils/testing'

import type {ContextValue} from '../../Context'
import useContextValue from '../../hooks/useContextValue'
import Panels from '../Panels'

jest.mock('../../hooks/useContextValue', () => jest.fn())
const useContextValueMock = assumeMock(useContextValue)

describe('Panels', () => {
    beforeEach(() => {
        useContextValueMock.mockReturnValue({totalSize: 1000} as ContextValue)
    })

    it('should render the panels and call the context', () => {
        render(<Panels size={1000}>boop</Panels>)
        const el = screen.getByText('boop')
        expect(el).toBeInTheDocument()
        expect(useContextValue).toHaveBeenCalledWith(el, 1000)
    })
})
