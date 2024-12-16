import {render} from '@testing-library/react'
import React from 'react'

import {assumeMock} from 'utils/testing'

import useIsMobileResolution from '../useIsMobileResolution'
import withIsMobileResolution from '../withIsMobileResolution'
import type {WithIsMobileResolutionProps} from '../withIsMobileResolution'

jest.mock('../useIsMobileResolution', () => jest.fn())
const useIsMobileResolutionMock = assumeMock(useIsMobileResolution)

describe('withIsMobileResolution', () => {
    it('should pass isMobileResolution into the given component', () => {
        useIsMobileResolutionMock.mockReturnValue(true)

        let givenIsMobileResolution: boolean | null = null

        const TestComponent = withIsMobileResolution(
            ({isMobileResolution}: WithIsMobileResolutionProps) => {
                givenIsMobileResolution = isMobileResolution
                return null
            }
        )

        render(<TestComponent />)

        expect(givenIsMobileResolution).toBe(true)
    })
})
