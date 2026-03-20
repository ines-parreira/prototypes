import { useFlag } from '@repo/feature-flags'
import { screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import {
    GORGIAS_CHAT_INTEGRATION_TYPE,
    SHOPIFY_INTEGRATION_TYPE,
} from 'constants/integration'
import { entitiesInitialState } from 'fixtures/entities'
import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import { useInstallationStatus } from 'pages/integrations/integration/components/gorgias_chat/hooks/useInstallationStatus'
import type { RootState, StoreDispatch } from 'state/types'
import { renderWithRouter } from 'utils/testing'

import GorgiasChatIntegrationNavigation from '../GorgiasChatIntegrationNavigation'

jest.mock('../GorgiasChatIntegrationConnectedChannel', () => () => {
    return <div data-testid="GorgiasChatIntegrationConnectedChannel" />
})

jest.mock('hooks/aiAgent/useAiAgentAccess', () => ({
    useAiAgentAccess: jest.fn(),
}))

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/hooks/useInstallationStatus',
    () => ({
        useInstallationStatus: jest.fn(),
    }),
)

jest.mock('@repo/feature-flags')
jest.mock('pages/automate/common/hooks/useStoreIntegrations', () => ({
    __esModule: true,
    default: () => [
        {
            id: 1,
            type: 'shopType',
            name: 'shopName',
        },
    ],
}))

const mockUseAiAgentAccess = jest.mocked(useAiAgentAccess)
const mockUseInstallationStatus = jest.mocked(useInstallationStatus)

jest.mock(
    '../GorgiasChatIntegrationQuickReplies/hooks/useIsQuickRepliesEnabled',
    () => ({
        __esModule: true,
        default: () => false,
    }),
)

const mockUseFlag = useFlag as jest.Mock

describe('<GorgiasChatIntegrationNavigation />', () => {
    beforeEach(() => {
        mockUseAiAgentAccess.mockReturnValue({
            hasAccess: false,
            isLoading: false,
        })
    })

    const integration = {
        id: 16,
        name: 'myChat1',
        type: GORGIAS_CHAT_INTEGRATION_TYPE,
        meta: {
            shop_name: 'myStore1',
            shop_type: SHOPIFY_INTEGRATION_TYPE,
        },
    }

    const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>()
    const store = mockStore({ entities: entitiesInitialState })

    beforeEach(() => {
        mockUseFlag.mockReturnValue(false)
        mockUseInstallationStatus.mockReturnValue({
            installed: true,
            installedOnShopifyCheckout: true,
            embeddedSpqInstalled: false,
            minimumSnippetVersion: null,
        })
    })

    it('should render automation features tab', () => {
        mockUseAiAgentAccess.mockReturnValue({
            hasAccess: true,
            isLoading: false,
        })
        renderWithRouter(
            <Provider store={store}>
                <GorgiasChatIntegrationNavigation
                    integration={fromJS(integration)}
                ></GorgiasChatIntegrationNavigation>
            </Provider>,
        )
        expect(screen.getByText('Automation Features')).toBeInTheDocument()
    })

    it('should not render automation features tab', () => {
        renderWithRouter(
            <Provider store={store}>
                <GorgiasChatIntegrationNavigation
                    integration={fromJS(integration)}
                ></GorgiasChatIntegrationNavigation>
            </Provider>,
        )
        expect(
            screen.queryByText('Automation Features'),
        ).not.toBeInTheDocument()
    })

    it('should call useAiAgentAccess with shopName from integration metadata', () => {
        renderWithRouter(
            <Provider store={store}>
                <GorgiasChatIntegrationNavigation
                    integration={fromJS(integration)}
                ></GorgiasChatIntegrationNavigation>
            </Provider>,
        )
        expect(mockUseAiAgentAccess).toHaveBeenCalledWith('myStore1')
    })

    it('should render GorgiasChatIntegrationNavigation', () => {
        const { container } = renderWithRouter(
            <Provider store={store}>
                <GorgiasChatIntegrationNavigation
                    integration={fromJS(integration)}
                ></GorgiasChatIntegrationNavigation>
            </Provider>,
        )

        expect(container).toMatchSnapshot()
    })

    it('should render GorgiasChatIntegrationNavigation with an installation issue icon', () => {
        mockUseInstallationStatus.mockReturnValue({
            installed: false,
            installedOnShopifyCheckout: false,
            embeddedSpqInstalled: false,
            minimumSnippetVersion: null,
        })

        const { container } = renderWithRouter(
            <Provider store={store}>
                <GorgiasChatIntegrationNavigation
                    integration={fromJS(integration)}
                ></GorgiasChatIntegrationNavigation>
            </Provider>,
        )

        expect(container).toMatchSnapshot()
    })
})
