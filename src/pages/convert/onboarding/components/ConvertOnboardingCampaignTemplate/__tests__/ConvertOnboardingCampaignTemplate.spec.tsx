import React from 'react'
import {render} from '@testing-library/react'
import {fromJS} from 'immutable'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import {CampaignTemplate} from 'pages/convert/campaigns/templates/types'
import {account} from 'fixtures/account'
import {RootState, StoreDispatch} from 'state/types'
import {billingState} from 'fixtures/billing'
import {PlanName} from 'utils/paywalls'
import ConvertOnboardingCampaignTemplate from '../ConvertOnboardingCampaignTemplate'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

const defaultState: Partial<RootState> = {
    currentAccount: fromJS(account),
    billing: fromJS(billingState),
}

const integration = fromJS({
    id: '1',
    meta: {
        languages: [{language: 'en-US', primary: true}],
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
        const {getByText, getByAltText} = render(
            <Provider store={mockStore(defaultState)}>
                <ConvertOnboardingCampaignTemplate
                    template={template as CampaignTemplate}
                    integration={integration}
                    selected={true}
                />
            </Provider>
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
