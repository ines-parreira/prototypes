import React from 'react'

import { render, screen } from '@testing-library/react'

import { useFlag } from 'core/flags'
import { assumeMock } from 'utils/testing'

import WrappedCustomerMetafields from '../WrappedCustomerMetafields'

jest.mock('core/flags')
const mockUseFlag = assumeMock(useFlag)

describe('<WrappedCustomerMetafields />', () => {
    const defaultProps = {
        integrationId: 123,
        customerId: 456,
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('when ShowShopifyCustomerMetafields feature flag is disabled', () => {
        beforeEach(() => {
            mockUseFlag.mockReturnValue(false)
        })

        it('should return null and not render anything', () => {
            const { container } = render(
                <WrappedCustomerMetafields {...defaultProps} />,
            )

            expect(container.firstChild).toBeNull()
        })
    })

    describe('when ShowShopifyCustomerMetafields feature flag is enabled', () => {
        beforeEach(() => {
            mockUseFlag.mockReturnValue(true)
        })

        it('should render CustomerMetafields', () => {
            render(<WrappedCustomerMetafields {...defaultProps} />)

            expect(screen.getByText('Customer Metafields')).toBeInTheDocument()
        })
    })
})
