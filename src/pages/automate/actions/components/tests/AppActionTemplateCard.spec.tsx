import React from 'react'
import {screen} from '@testing-library/react'
import {QueryClientProvider} from '@tanstack/react-query'
import {useFlags} from 'launchdarkly-react-client-sdk'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {renderWithRouter} from 'utils/testing'
import AppActionTemplateCard from '../AppActionTemplateCard'

const mockUseFlags = jest.mocked(useFlags)

const queryClient = mockQueryClient()

describe('<AppActionTemplateCard />', () => {
    beforeEach(() => {
        jest.resetAllMocks()
        mockUseFlags.mockReturnValue({})
    })

    it('should render component', () => {
        renderWithRouter(
            <QueryClientProvider client={queryClient}>
                <AppActionTemplateCard
                    app={{app_id: '1', type: 'app'}}
                    shopName="test-shop"
                    templateId="1"
                    templateName="test template"
                />
            </QueryClientProvider>,
            {
                path: `:shopType/:shopName/ai-agent/actions/new`,
                route: 'shopify/test-shop/ai-agent/actions/new',
            }
        )

        expect(screen.getByText('test template')).toBeInTheDocument()
    })
})
