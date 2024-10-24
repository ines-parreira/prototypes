import {useUpdateSlaPolicy} from '@gorgias/api-queries'
import {QueryClientProvider} from '@tanstack/react-query'
import {render} from '@testing-library/react'
import React from 'react'

import {mockQueryClient} from 'tests/reactQueryTestingUtils'

import SLAListController from '../SLAListController'
import useGetSLAPolicies from '../useGetSLAPolicies'

jest.mock('../useGetSLAPolicies')
const mockUseGetSLAPolicies = useGetSLAPolicies as jest.Mock

jest.mock('pages/settings/SLAs/features/Loader/Loader', () => () => (
    <div>Loader</div>
))
jest.mock('pages/settings/SLAs/features/LandingPage/LandingPage', () => () => (
    <div>LandingPage</div>
))
jest.mock('../../views/SLAListView', () => () => <div>SLAListView</div>)

jest.mock('hooks/useAppDispatch', () => jest.fn())

jest.mock('@gorgias/api-queries')
const mockUseUpdateSlaPolicy = useUpdateSlaPolicy as jest.Mock

const queryClient = mockQueryClient()

describe('<SLAListController />', () => {
    beforeEach(() => {
        mockUseUpdateSlaPolicy.mockImplementation(() => ({
            mutateAsync: jest.fn(),
        }))
    })

    it('should render Loader component when isLoading is true', () => {
        mockUseGetSLAPolicies.mockImplementation(() => ({
            data: [],
            isLoading: true,
        }))

        const {getByText} = render(
            <QueryClientProvider client={queryClient}>
                <SLAListController />
            </QueryClientProvider>
        )

        expect(getByText('Loader')).toBeInTheDocument()
    })

    it('should render LandingPage component when isLoading is false and there is no data to display', () => {
        mockUseGetSLAPolicies.mockImplementation(() => ({
            data: [],
            isLoading: false,
        }))

        const {getByText} = render(
            <QueryClientProvider client={queryClient}>
                <SLAListController />
            </QueryClientProvider>
        )

        expect(getByText('LandingPage')).toBeInTheDocument()
    })

    it('should render SLAListView component when isLoading is false and there is data to display', () => {
        mockUseGetSLAPolicies.mockImplementation(() => ({
            data: [{}],
            isLoading: false,
        }))

        const {getByText} = render(
            <QueryClientProvider client={queryClient}>
                <SLAListController />
            </QueryClientProvider>
        )

        expect(getByText('SLAListView')).toBeInTheDocument()
    })
})
