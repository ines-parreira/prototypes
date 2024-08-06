import React from 'react'
import {screen} from '@testing-library/react'
import {mockFlags} from 'jest-launchdarkly-mock'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import {fromJS} from 'immutable'
import configureMockStore from 'redux-mock-store'

import {renderWithRouter} from 'utils/testing'
import {getHasAutomate} from 'state/billing/selectors'
import {FeatureFlagKey} from 'config/featureFlags'
import {IntegrationType} from 'models/integration/constants'

import AutomateNavbarSectionBlock from '../AutomateNavbarSectionBlock'

jest.mock('state/billing/selectors', () => ({
    __esModule: true,
    getHasAutomate: jest.fn(),
}))
const mockGetHasAutomate = jest.mocked(getHasAutomate)
const mockStore = configureMockStore([thunk])
const MOCK_EMAIL_ADDRESS = 'test@mail.com'

const defaultState = {
    integrations: fromJS({
        integrations: [
            {
                id: 1,
                type: IntegrationType.Email,
                name: 'My email integration',
                meta: {
                    address: MOCK_EMAIL_ADDRESS,
                },
            },
        ],
    }),
    entities: {
        helpCenter: {
            helpCenters: {
                helpCentersById: {
                    '1': {id: 1, name: 'help center 1', type: 'faq'},
                    '2': {id: 2, name: 'help center 2', type: 'faq'},
                },
            },
        },
    },
}

const renderComponent = (children: any) =>
    renderWithRouter(
        <Provider store={mockStore(defaultState)}>{children}</Provider>
    )

describe('AutomateNavbarSectionBlock', () => {
    const shopType = IntegrationType.Shopify
    const shopName = 'test-shop'
    const onToggle = jest.fn()
    const name = 'Test Name'
    const isExpanded = true
    const shouldRenderCanduIds = true

    beforeEach(() => {
        jest.resetAllMocks()
    })
    it('should render the component with AI Agent link when hasAiAgentTrial is true and hasAutomate is false', () => {
        mockFlags({
            [FeatureFlagKey.AiAgentTrialMode]: true,
        })
        mockGetHasAutomate.mockReturnValue(false)

        renderComponent(
            <AutomateNavbarSectionBlock
                shopType={shopType}
                shopName={shopName}
                onToggle={onToggle}
                name={name}
                isExpanded={isExpanded}
                shouldRenderCanduIds={shouldRenderCanduIds}
            />
        )

        expect(screen.getByText('AI Agent')).toBeInTheDocument()
    })

    it('should not render the component with Flows link when hasAutomate is false', () => {
        mockGetHasAutomate.mockReturnValue(false)
        mockFlags({
            [FeatureFlagKey.AiAgentTrialMode]: true,
        })

        renderComponent(
            <AutomateNavbarSectionBlock
                shopType={shopType}
                shopName={shopName}
                onToggle={onToggle}
                name={name}
                isExpanded={isExpanded}
                shouldRenderCanduIds={shouldRenderCanduIds}
            />
        )

        expect(screen.queryByText('Flows')).not.toBeInTheDocument()
    })
})
