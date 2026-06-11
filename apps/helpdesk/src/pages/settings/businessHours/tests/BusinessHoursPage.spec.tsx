import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { assumeMock, render } from '@repo/testing'
import { screen } from '@testing-library/react'

import { BusinessHoursPage } from '../BusinessHoursPage'
import { BUSINESS_HOURS_BASE_URL } from '../constants'

jest.mock('@repo/feature-flags')
const useFlagMock = assumeMock(useFlag)

describe('BusinessHoursPage', () => {
    beforeEach(() => {
        useFlagMock.mockImplementation((flag) => {
            if (flag === FeatureFlagKey.CustomBusinessHours) {
                return true
            }
        })
    })

    it('does not render CustomBusinessHours when the feature flag is off', () => {
        useFlagMock.mockImplementation((flag) => {
            if (flag === FeatureFlagKey.CustomBusinessHours) {
                return false
            }
        })

        render(<BusinessHoursPage />, { storeState: {} })

        expect(
            screen.queryByText('Custom Business Hours'),
        ).not.toBeInTheDocument()
        expect(screen.getByText('Add business hours')).toBeInTheDocument()
    })

    it('renders CustomBusinessHours when the feature flag is on', () => {
        render(<BusinessHoursPage />, { storeState: {} })

        expect(screen.getByText('Default Business Hours')).toBeInTheDocument()
        expect(screen.getByText('Custom Business Hours')).toBeInTheDocument()
    })

    it('should render the edit custom business hours page', () => {
        render(<BusinessHoursPage />, {
            storeState: {},
            path: BUSINESS_HOURS_BASE_URL,
            initialEntries: [`${BUSINESS_HOURS_BASE_URL}/1`],
        })

        expect(
            screen.getByText('Edit custom business hours'),
        ).toBeInTheDocument()
    })
})
