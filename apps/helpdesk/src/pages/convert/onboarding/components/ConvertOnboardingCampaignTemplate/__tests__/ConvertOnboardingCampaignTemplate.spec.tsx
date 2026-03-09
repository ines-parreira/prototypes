import React from 'react'

import { PlanName } from '@repo/billing-utils'
import { QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { account } from 'fixtures/account'
import { billingState } from 'fixtures/billing'
import type { CampaignTemplate } from 'pages/convert/campaigns/templates/types'
import type { RootState, StoreDispatch } from 'state/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import ConvertOnboardingCampaignTemplate from '../ConvertOnboardingCampaignTemplate'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])
const queryClient = mockQueryClient()

const defaultState: Partial<RootState> = {
    currentAccount: fromJS(account),
    billing: fromJS(billingState),
}

jest.mock(
    'pages/convert/onboarding/components/ConvertSimplifiedEditorModal',
    () => {
        return jest.fn(() => {
            return <div data-testid="mock-simplified-editor-modal" />
        })
    },
)

const integration = fromJS({
    id: '1',
    meta: {
        languages: [{ language: 'en-US', primary: true }],
        shop_type: 'shopify',
    },
})

describe('ConvertOnboardingCampaignTemplate', () => {
    const template = {
        slug: 'test-slug',
        name: 'Test Campaign',
        preview: 'test-preview.jpg',
        label: 'Increase Conversions',
        onboarding: true,
        estimation: {
            [PlanName.Starter]: '$1,000/month',
            [PlanName.Basic]: '$2,000/month',
            [PlanName.Pro]: '$3,000/month',
        },
        getConfiguration: jest.fn(),
    }

    it('renders campaign template correctly', () => {
        const { getByText, getByAltText } = render(
            <Provider store={mockStore(defaultState)}>
                <QueryClientProvider client={queryClient}>
                    <ConvertOnboardingCampaignTemplate
                        template={template as CampaignTemplate}
                        integration={integration}
                        selected={true}
                        campaign={undefined}
                    />
                </QueryClientProvider>
            </Provider>,
        )

        const campaignLabel = getByText(template.label)
        expect(campaignLabel).toBeInTheDocument()

        const campaignName = getByText(template.name)
        expect(campaignName).toBeInTheDocument()

        const campaignPreview = getByAltText(template.name)
        expect(campaignPreview).toHaveAttribute('src', template.preview)

        const customizeButton = getByText('Customize')
        expect(customizeButton).toBeInTheDocument()

        const estimation = getByText(template.estimation[PlanName.Basic])
        expect(estimation).toBeInTheDocument()
    })
})
