import {screen} from '@testing-library/react'
import {fromJS} from 'immutable'
import {mockFlags} from 'jest-launchdarkly-mock'
import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {FeatureFlagKey} from 'config/featureFlags'

import {account} from 'fixtures/account'
import {StoreConfiguration} from 'models/aiAgent/types'
import {IntegrationType} from 'models/integration/constants'
import {getStoreConfigurationFixture} from 'pages/automate/aiAgent/fixtures/storeConfiguration.fixtures'
import {useStoreConfiguration} from 'pages/automate/aiAgent/hooks/useStoreConfiguration'
import {getHasAutomate} from 'state/billing/selectors'
import {assumeMock, renderWithRouter} from 'utils/testing'

import AutomateNavbarSectionBlock from '../AutomateNavbarSectionBlock'

jest.mock('state/billing/selectors', () => ({
    __esModule: true,
    getHasAutomate: jest.fn(),
}))
const mockGetHasAutomate = jest.mocked(getHasAutomate)
const mockStore = configureMockStore([thunk])
const MOCK_EMAIL_ADDRESS = 'test@mail.com'

jest.mock('pages/automate/aiAgent/hooks/useStoreConfiguration')
const useStoreConfigurationMock = assumeMock(useStoreConfiguration)

const defaultStoreConfiguration: StoreConfiguration =
    getStoreConfigurationFixture()

const defaultState = {
    currentAccount: fromJS(account),
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

        mockFlags({
            [FeatureFlagKey.AIAgentPreviewModeAllowed]: true,
        })

        useStoreConfigurationMock.mockReturnValue({
            storeConfiguration: defaultStoreConfiguration,
            isLoading: false,
        })
    })

    describe('when hasAutomate is true', () => {
        beforeEach(() => {
            mockGetHasAutomate.mockReturnValue(true)
        })

        it('should render the Preview badge when trial mode is activated', () => {
            useStoreConfigurationMock.mockReturnValue({
                storeConfiguration: {
                    ...defaultStoreConfiguration,
                    deactivatedDatetime: '2024-10-01T00:00:00Z',
                    emailChannelDeactivatedDatetime: '2024-10-01T00:00:00Z',
                    chatChannelDeactivatedDatetime: '2024-10-01T00:00:00Z',
                    trialModeActivatedDatetime: '2024-10-01T00:00:00Z',
                    previewModeActivatedDatetime: '2024-10-01T00:00:00Z',
                    previewModeValidUntilDatetime: '2024-10-01T00:00:00Z',
                    isPreviewModeActive: true,
                },
                isLoading: false,
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

            expect(screen.getByText('PREVIEW')).toBeInTheDocument()
        })

        it('should render the Live badge when AI Agent is enabled', () => {
            useStoreConfigurationMock.mockReturnValue({
                storeConfiguration: {
                    ...defaultStoreConfiguration,
                    deactivatedDatetime: null,
                    emailChannelDeactivatedDatetime: '2024-10-01T00:00:00Z',
                    chatChannelDeactivatedDatetime: '2024-10-01T00:00:00Z',
                },
                isLoading: false,
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

            expect(screen.getByText('LIVE')).toBeInTheDocument()
        })

        it('should render the Live badge when AI Agent is enabled in email channel', () => {
            useStoreConfigurationMock.mockReturnValue({
                storeConfiguration: {
                    ...defaultStoreConfiguration,
                    deactivatedDatetime: '2024-10-01T00:00:00Z',
                    emailChannelDeactivatedDatetime: null,
                    chatChannelDeactivatedDatetime: '2024-10-01T00:00:00Z',
                },
                isLoading: false,
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

            expect(screen.getByText('LIVE')).toBeInTheDocument()
        })

        it('should render the Live badge when AI Agent is enabled in chat channel', () => {
            useStoreConfigurationMock.mockReturnValue({
                storeConfiguration: {
                    ...defaultStoreConfiguration,
                    deactivatedDatetime: '2024-10-01T00:00:00Z',
                    emailChannelDeactivatedDatetime: '2024-10-01T00:00:00Z',
                    chatChannelDeactivatedDatetime: null,
                },
                isLoading: false,
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

            expect(screen.getByText('LIVE')).toBeInTheDocument()
        })

        it('should not render any badge when AI Agent is not enabled nor in preview mode', () => {
            useStoreConfigurationMock.mockReturnValue({
                storeConfiguration: {
                    ...defaultStoreConfiguration,
                    deactivatedDatetime: '2024-10-01T00:00:00Z',
                    chatChannelDeactivatedDatetime: '2024-10-01T00:00:00Z',
                    emailChannelDeactivatedDatetime: '2024-10-01T00:00:00Z',
                },
                isLoading: false,
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

            expect(screen.queryByText('LIVE')).not.toBeInTheDocument()
            expect(screen.queryByText('PREVIEW')).not.toBeInTheDocument()
        })
    })

    describe('when hasAutomate is false', () => {
        beforeEach(() => {
            mockGetHasAutomate.mockReturnValue(false)
        })

        it('should render AI Agent link when hasAiAgentPreview feature flag is true ', () => {
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

        it('should not render the Preview badge when trial mode is not activated ', () => {
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
            expect(screen.queryByText('PREVIEW')).not.toBeInTheDocument()
        })

        it('should render the Preview badge when trial mode is activated', () => {
            useStoreConfigurationMock.mockReturnValue({
                storeConfiguration: {
                    ...defaultStoreConfiguration,
                    deactivatedDatetime: '2024-10-01T00:00:00Z',
                    chatChannelDeactivatedDatetime: '2024-10-01T00:00:00Z',
                    emailChannelDeactivatedDatetime: '2024-10-01T00:00:00Z',
                    trialModeActivatedDatetime: '2024-10-01T00:00:00Z',
                    previewModeActivatedDatetime: '2024-10-01T00:00:00Z',
                    previewModeValidUntilDatetime: '2024-10-01T00:00:00Z',
                    isPreviewModeActive: true,
                },
                isLoading: false,
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

            expect(screen.getByText('PREVIEW')).toBeInTheDocument()
        })

        it('should not render the component with Flows link', () => {
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
})
