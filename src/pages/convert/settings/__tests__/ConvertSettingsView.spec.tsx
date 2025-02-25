import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { act, render } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {
    installBundleMockImplementation,
    convertBundle as mockConvertBundle,
} from 'fixtures/convertBundle'
import { useIsConvertSubscriber } from 'pages/common/hooks/useIsConvertSubscriber'
import { useInstallBundle } from 'pages/convert/bundles/hooks/useInstallBundle'
import { ConvertSettingsView } from 'pages/convert/settings/ConvertSettingsView'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { assumeMock } from 'utils/testing'

jest.mock('pages/convert/bundles/hooks/useInstallBundle')
const useInstallBundleMock = assumeMock(useInstallBundle)

jest.mock('react-router-dom', () => ({
    useParams: () => ['1'],
}))

jest.mock('pages/convert/bundles/hooks/useGetConvertBundle', () => ({
    useGetConvertBundle: () => ({
        bundle: mockConvertBundle,
        isLoading: false,
    }),
}))

jest.mock('pages/stats/convert/hooks/useConvertGeneralSettings', () => ({
    useConvertGeneralSettings: () => ({ data: undefined, isLoading: false }),
}))

jest.mock('pages/common/hooks/useIsConvertSubscriber')
const useIsConvertSubscriberMock = assumeMock(useIsConvertSubscriber)

const mockStore = configureMockStore([thunk])
const queryClient = mockQueryClient()

describe('<ConvertSettingsView />', () => {
    beforeAll(() => {
        useInstallBundleMock.mockImplementation(installBundleMockImplementation)
        useIsConvertSubscriberMock.mockReturnValue(true)
    })

    it('should render the disclaimer settings', () => {
        const { getByText } = render(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockStore({})}>
                    <ConvertSettingsView />
                </Provider>
            </QueryClientProvider>,
        )
        expect(getByText('Privacy Policy Disclaimer')).toBeInTheDocument()
    })

    it('should render the installation settings', () => {
        const { getAllByRole, getByText } = render(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockStore({})}>
                    <ConvertSettingsView />
                </Provider>
            </QueryClientProvider>,
        )
        act(() => {
            getAllByRole('tab')[1].focus()
        })
        expect(
            getByText('Campaign bundle installation method'),
        ).toBeInTheDocument()
    })

    it("shouldn't render the general settings", () => {
        useIsConvertSubscriberMock.mockReturnValue(false)

        const { queryByText } = render(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockStore({})}>
                    <ConvertSettingsView />
                </Provider>
            </QueryClientProvider>,
        )

        expect(queryByText('General Settings')).not.toBeInTheDocument()
    })
})
