import React from 'react'

import { renderHook } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import routerDom, { useParams } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {
    CampaignPerformanceTableDefaultConfigurationViews,
    CampaignTableColumnDefaultSelect,
} from 'domains/reporting/pages/convert/components/CampaignTableStats/constants'
import { useCampaignPerformanceTableSetting } from 'domains/reporting/pages/convert/hooks/useCampaignPerformanceTableSetting'
import { account } from 'fixtures/account'
import { channelConnection } from 'fixtures/channelConnection'
import { entitiesInitialState } from 'fixtures/entities'
import { integrationsState } from 'fixtures/integrations'
import {
    useGetSettingsList,
    useUpdateSetting,
} from 'models/convert/settings/queries'
import { useGetOrCreateChannelConnection } from 'pages/convert/common/hooks/useGetOrCreateChannelConnection'
import { RootState, StoreDispatch } from 'state/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { assumeMock } from 'utils/testing'

const mockStore = configureMockStore<RootState, StoreDispatch>([thunk])
const queryClient = mockQueryClient()

jest.mock('react-router-dom', () => ({
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    ...(jest.requireActual('react-router-dom') as typeof routerDom),
    useParams: jest.fn(),
}))
const useParamsMock = useParams as jest.Mock

jest.mock('models/convert/settings/queries')
const useGetSettingsListMock = assumeMock(useGetSettingsList)
const useUpdateSettingMock = assumeMock(useUpdateSetting)

jest.mock('pages/convert/common/hooks/useGetOrCreateChannelConnection')
const useGetOrCreateChannelConnectionMock = assumeMock(
    useGetOrCreateChannelConnection,
)

describe('useCampaignPerformanceTableSetting', () => {
    const defaultState = {
        entities: entitiesInitialState,
        integrations: fromJS(integrationsState),
        currentAccount: fromJS(account),
    } as RootState

    beforeEach(() => {
        useParamsMock.mockReturnValue({
            integrationId: '1',
        })

        useUpdateSettingMock.mockImplementation(() => {
            return {
                mutateAsync: jest.fn(),
            } as unknown as ReturnType<typeof useUpdateSetting>
        })

        useGetOrCreateChannelConnectionMock.mockReturnValue({
            channelConnection: channelConnection,
        } as any)
    })

    it('should return default order if no Setting available', () => {
        useGetSettingsListMock.mockReturnValue({
            data: [],
            isLoading: false,
        } as any)

        const { result } = renderHook(
            () => useCampaignPerformanceTableSetting(),
            {
                wrapper: ({ children }) => (
                    <Provider store={mockStore(defaultState)}>
                        <QueryClientProvider client={queryClient}>
                            {children}
                        </QueryClientProvider>
                    </Provider>
                ),
            },
        )

        expect(result.current).toEqual({
            isLoading: false,
            columnsOrder: CampaignTableColumnDefaultSelect,
            submitActiveView: expect.any(Function),
            currentView: CampaignPerformanceTableDefaultConfigurationViews,
        })
    })
})
