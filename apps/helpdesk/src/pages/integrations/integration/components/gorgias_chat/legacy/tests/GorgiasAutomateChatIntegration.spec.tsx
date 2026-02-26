import React from 'react'

import { useFlag } from '@repo/feature-flags'
import { render, screen } from '@testing-library/react'
import { fromJS, Map } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { billingState } from 'fixtures/billing'
import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import { GorgiasChatMinimumSnippetVersion } from 'models/integration/types'
import type { RootState } from 'state/types'

import { GorgiasAutomateChatIntegration } from '../GorgiasAutomateChatIntegration'

jest.mock('@repo/feature-flags')

jest.mock('pages/automate/common/hooks/useStoreIntegrations', () => {
    return jest.fn(() => [
        {
            id: 1,
            type: 'shopType',
            name: 'shopName',
        },
    ])
})
jest.mock('react-router-dom', () => {
    return {
        ...jest.requireActual('react-router-dom'),
        Link: () => 'Link',
        NavLink: () => 'NavLink',
        useHistory: jest.fn(() => ({
            push: jest.fn(),
            replace: jest.fn(),
            go: jest.fn(),
            goBack: jest.fn(),
            goForward: jest.fn(),
        })),
    }
})

jest.mock(
    'pages/automate/connectedChannels/components/ConnectedChannelsChatView',
    () => ({
        ConnectedChannelsChatView: ({
            shopType,
            shopName,
            channelId,
        }: {
            shopType: string
            shopName: string
            channelId: string
        }) => (
            <div>
                <span>{shopName}</span>
                <span>{shopType}</span>
                <span>{channelId}</span>
            </div>
        ),
    }),
)

jest.mock('hooks/aiAgent/useAiAgentAccess', () => ({
    useAiAgentAccess: jest.fn(),
}))

const mockUseAiAgentAccess = jest.mocked(useAiAgentAccess)
const mockUseFlag = useFlag as jest.Mock

const mockStore = configureMockStore([thunk])

const defaultState = {
    integrations: fromJS({
        integrations: [],
    }),

    billing: fromJS(billingState),
} as RootState
const mockedStore = mockStore({
    ...defaultState,
    entities: {
        chatInstallationStatus: {
            installed: true,
            minimumSnippetVersion: GorgiasChatMinimumSnippetVersion.V3,
        },
    },
})

describe('GorgiasAutomateChatIntegration', () => {
    beforeEach(() => {
        mockUseAiAgentAccess.mockReturnValue({
            hasAccess: false,
            isLoading: false,
        })
        mockUseFlag.mockReturnValue(false)
    })

    it('should render', () => {
        render(
            <Provider store={mockedStore}>
                <GorgiasAutomateChatIntegration
                    integration={Map({
                        meta: Map({
                            shop_integration_id: 1,
                            app_id: 'channelId',
                        }),
                        name: 'integrationName',
                    })}
                />
            </Provider>,
        )

        expect(screen.getByText('shopType')).toBeInTheDocument()
        expect(screen.getByText('channelId')).toBeInTheDocument()
    })
})
