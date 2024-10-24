import {render} from '@testing-library/react'
import React from 'react'

import Loader from '../Loader'

jest.mock('pages/settings/SLAs/features/PageHeader/PageHeader', () => () => (
    <div>PageHeader</div>
))
jest.mock('pages/common/components/Loader/Loader', () => () => (
    <div>Loader</div>
))

describe('<Loader />', () => {
    it('should render a loader', () => {
        const {getByText} = render(<Loader />)

        expect(getByText('PageHeader')).toBeInTheDocument()
        expect(getByText('Loader')).toBeInTheDocument()
    })
})
