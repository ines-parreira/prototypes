import React from 'react'

import { render, screen, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import useAppDispatch from 'hooks/useAppDispatch'
import { HelpCenter } from 'models/helpCenter/types'
import { HELP_CENTER_MAX_CREATION } from 'pages/settings/helpCenter/constants'
import { useHelpCenterApi } from 'pages/settings/helpCenter/hooks/useHelpCenterApi'
import { helpCentersFetched } from 'state/entities/helpCenter/helpCenters'
import { assumeMock } from 'utils/testing'

import SelfServiceHelpCentersProvider from '../SelfServiceHelpCentersProvider'

function getShopName() {
    return 'My Shop'
}
const mockHelpCentersList = [
    {
        created_datetime: '2023-12-21T13:01:16.097Z',
        updated_datetime: '2024-04-26T09:16:46.329Z',
        deleted_datetime: null,
        automation_settings_id: 7,
        deactivated_datetime: null,
        default_locale: 'en-US',
        email_integration: {
            id: 5,
            email: 'zp7d01g9zorymjke@email-itay.gorgi.us',
        },
        id: 1,
        name: 'Acme Help Center',
        powered_by_deactivated_datetime: null,
        search_deactivated_datetime: null,
        self_service_deactivated_datetime: null,
        shop_name: getShopName(),
        subdomain: 'acme',
        supported_locales: ['en-US'],
        type: 'faq',
        layout: 'default',
        account_id: 1,
        translations: [],
        redirects: [],
    },
] as unknown as HelpCenter[]

jest.mock('react-router-dom', () => ({
    ...jest.requireActual<Record<string, unknown>>('react-router-dom'),
    useParams: jest.fn().mockReturnValue({
        shopType: 'shopify',
        shopName: getShopName(),
    }),
}))

jest.mock('pages/settings/helpCenter/hooks/useHelpCenterApi')
const mockedUseHelpCenterApi = assumeMock(useHelpCenterApi)

jest.mock('hooks/useAppDispatch')
const mockedUseAppDispatch = assumeMock(useAppDispatch)

const mockStore = configureStore([thunk])()

describe('SelfServiceHelpCentersProvider', () => {
    const mockClient = {
        listHelpCenters: jest.fn(),
    }
    const mockDispatch = jest.fn()

    beforeEach(() => {
        mockedUseHelpCenterApi.mockReturnValue({
            client: mockClient,
        } as unknown as ReturnType<typeof useHelpCenterApi>)
        mockedUseAppDispatch.mockReturnValue(mockDispatch)
    })

    it('should fetch and dispatch help centers list', async () => {
        mockClient.listHelpCenters.mockResolvedValue({
            data: { data: mockHelpCentersList },
        })

        render(
            <Provider store={mockStore}>
                <SelfServiceHelpCentersProvider>
                    <div>Child Component</div>
                </SelfServiceHelpCentersProvider>
            </Provider>,
        )

        await waitFor(() => {
            expect(mockClient.listHelpCenters).toHaveBeenCalledWith({
                shop_name: getShopName(),
                per_page: HELP_CENTER_MAX_CREATION,
            })
        })

        expect(mockDispatch).toHaveBeenCalledWith(
            helpCentersFetched(mockHelpCentersList),
        )
        expect(screen.getByText('Child Component')).toBeInTheDocument()
    })

    it('should not fetch help centers when client is undefined', async () => {
        mockedUseHelpCenterApi.mockReturnValue({
            client: undefined,
        } as unknown as ReturnType<typeof useHelpCenterApi>)

        render(
            <Provider store={mockStore}>
                <SelfServiceHelpCentersProvider>
                    <div>Child Component</div>
                </SelfServiceHelpCentersProvider>
            </Provider>,
        )

        await waitFor(() => {
            expect(mockClient.listHelpCenters).not.toHaveBeenCalled()
        })

        expect(mockDispatch).not.toHaveBeenCalled()
        expect(screen.getByText('Child Component')).toBeInTheDocument()
    })
})
