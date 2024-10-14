import {act, render} from '@testing-library/react'
import React from 'react'
import thunk from 'redux-thunk'
import {QueryClientProvider} from '@tanstack/react-query'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import {ConvertSettingsView} from 'pages/convert/settings/ConvertSettingsView'
import {
    convertBundle as mockConvertBundle,
    installBundleMockImplementation,
} from 'fixtures/convertBundle'
import {assumeMock} from 'utils/testing'
import {useInstallBundle} from 'pages/convert/bundles/hooks/useInstallBundle'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'

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
    useConvertGeneralSettings: () => ({data: undefined, isLoading: false}),
}))

const mockStore = configureMockStore([thunk])
const queryClient = mockQueryClient()

describe('<ConvertSettingsView />', () => {
    beforeAll(() => {
        useInstallBundleMock.mockImplementation(installBundleMockImplementation)
    })

    it('should render the disclaimer settings', () => {
        const {getByText} = render(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockStore({})}>
                    <ConvertSettingsView />
                </Provider>
            </QueryClientProvider>
        )
        expect(getByText('Privacy Policy Disclaimer')).toBeInTheDocument()
    })

    it('should render the installation settings', () => {
        const {getAllByRole, getByText} = render(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockStore({})}>
                    <ConvertSettingsView />
                </Provider>
            </QueryClientProvider>
        )
        act(() => {
            getAllByRole('tab')[1].focus()
        })
        expect(
            getByText('Campaign bundle installation method')
        ).toBeInTheDocument()
    })
})
