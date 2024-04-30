import React from 'react'
import {render} from '@testing-library/react'

import SLAListController from '../SLAListController'
import useGetSLAPolicies from '../useGetSLAPolicies'

jest.mock('../useGetSLAPolicies')
const mockUseGetSLAPolicies = useGetSLAPolicies as jest.Mock

jest.mock('../../views/Loader', () => () => <div>Loader</div>)
jest.mock('pages/settings/SLAs/features/LandingPage/LandingPage', () => () => (
    <div>LandingPage</div>
))
jest.mock('../../views/SLAListView', () => () => <div>SLAListView</div>)

describe('<SLAListController />', () => {
    it('should render Loader component when isLoading is true', () => {
        mockUseGetSLAPolicies.mockImplementation(() => ({
            data: [],
            isLoading: true,
        }))

        const {getByText} = render(<SLAListController />)

        expect(getByText('Loader')).toBeInTheDocument()
    })

    it('should render LandingPage component when isLoading is false and there is no data to display', () => {
        mockUseGetSLAPolicies.mockImplementation(() => ({
            data: [],
            isLoading: false,
        }))

        const {getByText} = render(<SLAListController />)

        expect(getByText('LandingPage')).toBeInTheDocument()
    })

    it('should render SLAListView component when isLoading is false and there is data to display', () => {
        mockUseGetSLAPolicies.mockImplementation(() => ({
            data: [{}],
            isLoading: false,
        }))

        const {getByText} = render(<SLAListController />)

        expect(getByText('SLAListView')).toBeInTheDocument()
    })
})
