import {
    act,
    fireEvent,
    render,
    screen,
    within,
    waitFor,
} from '@testing-library/react'
import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {IntegrationType} from 'models/integration/constants'
import {useListActionsApps} from 'models/workflows/queries'
import {RootState, StoreDispatch} from 'state/types'

import ActionsPlatformCreateTemplateView from '../ActionsPlatformCreateTemplateView'
import useApps from '../hooks/useApps'
import useCreateActionTemplate from '../hooks/useCreateActionTemplate'

jest.mock('models/workflows/queries')
jest.mock('../hooks/useApps')
jest.mock('../hooks/useCreateActionTemplate')

const mockUseListActionsApps = jest.mocked(useListActionsApps)
const mockUseApps = jest.mocked(useApps)
const mockUseCreateActionTemplate = jest.mocked(useCreateActionTemplate)
const mockStore = configureMockStore<RootState, StoreDispatch>([thunk])()

mockUseListActionsApps.mockReturnValue({
    data: [
        {
            id: 'someid2',
            auth_type: 'api-key',
            auth_settings: {
                url: 'https://example.com',
            },
        },
    ],
    isInitialLoading: false,
} as unknown as ReturnType<typeof useListActionsApps>)
mockUseApps.mockReturnValue({
    apps: [
        {
            id: 'someid2',
            name: 'test app',
            icon: '/assets/img/integrations/app.png',
            type: IntegrationType.App,
        },
        {
            icon: '/assets/img/integrations/shopify.png',
            id: 'shopify',
            name: 'Shopify',
            type: IntegrationType.Shopify,
        },
        {
            icon: '/assets/img/integrations/recharge.png',
            id: 'recharge',
            name: 'Recharge',
            type: IntegrationType.Recharge,
        },
    ],
    isLoading: false,
} as unknown as ReturnType<typeof mockUseApps>)
mockUseCreateActionTemplate.mockReturnValue({
    createActionTemplate: jest.fn(),
    isLoading: false,
})

describe('<ActionsPlatformCreateTemplateView />', () => {
    it('should render create template visual builder', () => {
        render(
            <Provider store={mockStore}>
                <ActionsPlatformCreateTemplateView />
            </Provider>
        )

        expect(
            screen.getByPlaceholderText('e.g. Update shipping address')
        ).toBeInTheDocument()
    })

    it('should require to select App(s)', async () => {
        render(
            <Provider store={mockStore}>
                <ActionsPlatformCreateTemplateView />
            </Provider>
        )

        act(() => {
            fireEvent.focus(
                within(screen.getByRole('combobox')).getByText('Select App(s)')
            )
        })

        act(() => {
            fireEvent.click(screen.getByText('Shopify'))
        })

        act(() => {
            fireEvent.click(screen.getByText('Use'))
        })

        await waitFor(() => {
            expect(screen.queryByText('Select App(s)')).not.toBeInTheDocument()
        })
    })
})
