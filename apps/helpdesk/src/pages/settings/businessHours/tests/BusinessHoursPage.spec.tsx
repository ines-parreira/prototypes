import { screen } from '@testing-library/react'

import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import { renderWithStoreAndQueryClientAndRouter } from 'tests/renderWithStoreAndQueryClientAndRouter'
import { assumeMock } from 'utils/testing'

import BusinessHoursPage from '../BusinessHoursPage'
import { BUSINESS_HOURS_BASE_URL } from '../constants'

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

        renderWithStoreAndQueryClientAndRouter(<BusinessHoursPage />, {})

        expect(
            screen.queryByText('Custom Business Hours'),
        ).not.toBeInTheDocument()
        expect(screen.getByText('Add business hours')).toBeInTheDocument()
    })

    it('renders CustomBusinessHours when the feature flag is on', () => {
        renderWithStoreAndQueryClientAndRouter(<BusinessHoursPage />, {})

        expect(screen.getByText('Default Business Hours')).toBeInTheDocument()
        expect(screen.getByText('Custom Business Hours')).toBeInTheDocument()
    })

    it('should render the edit custom business hours page', () => {
        renderWithStoreAndQueryClientAndRouter(
            <BusinessHoursPage />,
            {},
            {
                path: BUSINESS_HOURS_BASE_URL,
                route: `${BUSINESS_HOURS_BASE_URL}/1`,
            },
        )

        expect(
            screen.getByText('Edit custom business hours'),
        ).toBeInTheDocument()
    })
})
