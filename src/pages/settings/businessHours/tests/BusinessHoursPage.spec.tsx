import { screen } from '@testing-library/react'

import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import { assumeMock, renderWithStore } from 'utils/testing'

import BusinessHoursPage from '../BusinessHoursPage'

jest.mock('core/flags')
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

        renderWithStore(<BusinessHoursPage />, {})

        expect(
            screen.queryByText('Custom Business Hours'),
        ).not.toBeInTheDocument()
    })

    it('renders CustomBusinessHours when the feature flag is on', () => {
        renderWithStore(<BusinessHoursPage />, {})

        expect(screen.getByText('Custom Business Hours')).toBeInTheDocument()
    })
})
