import React from 'react'
import {screen} from '@testing-library/react'
import {QueryClientProvider} from '@tanstack/react-query'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {renderWithRouter} from 'utils/testing'
import AppIntegrationDisabledModal from '../AppIntegrationDisabledModal'

const queryClient = mockQueryClient()

describe('<AppIntegrationDisabledModal />', () => {
    it('should render component', () => {
        renderWithRouter(
            <QueryClientProvider client={queryClient}>
                <AppIntegrationDisabledModal
                    actionAppConfiguration={{type: 'shopify'}}
                    isOpen={true}
                    setOpen={jest.fn()}
                    templateName="test template"
                />
            </QueryClientProvider>
        )

        expect(screen.getByText('test template')).toBeInTheDocument()
    })
})
