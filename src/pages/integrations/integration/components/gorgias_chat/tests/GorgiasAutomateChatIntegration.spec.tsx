import React from 'react'

import { render, screen } from '@testing-library/react'
import { fromJS, Map } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { billingState } from 'fixtures/billing'
import { GorgiasChatMinimumSnippetVersion } from 'models/integration/types'
import { RootState } from 'state/types'

import { GorgiasAutomateChatIntegration } from '../GorgiasAutomateChatIntegration'

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
        Link: () => 'Link',
        NavLink: () => 'NavLink',
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
