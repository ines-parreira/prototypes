import React from 'react'

import { render, screen } from '@testing-library/react'

import { useFlag } from 'core/flags'

import { assumeMock } from '../../../../utils/testing'
import StoreManagementPage from '../storeManagementPage/StoreManagementPage'
import { StoreManagementProvider } from '../StoreManagementProvider'

jest.mock('core/flags')
const useFlagMock = assumeMock(useFlag)

describe('StoreManagement', () => {
    afterEach(() => {
        useFlagMock.mockClear()
    })
    it('renders the component when the MultiStore feature flag is enabled', () => {
        useFlagMock.mockImplementation(() => true)

        render(
            <StoreManagementProvider>
                <StoreManagementPage />
            </StoreManagementProvider>,
        )

        expect(screen.getByText('Store Management')).toBeInTheDocument()
    })

    it('does not render the component when the MultiStore feature flag is disabled', () => {
        useFlagMock.mockImplementation(() => false)

        const { container } = render(
            <StoreManagementProvider>
                <StoreManagementPage />
            </StoreManagementProvider>,
        )

        expect(container.firstChild).toBeNull()
    })
})
