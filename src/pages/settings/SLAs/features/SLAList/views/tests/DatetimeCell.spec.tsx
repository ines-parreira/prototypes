import {render} from '@testing-library/react'
import React from 'react'

import {UISLAPolicy} from '../../types'
import DatetimeCell from '../DatetimeCell'

const mockUISLAPolicy = {
    id: '123',
    updatedDatetime: '2021-12-31T00:00:00Z',
} as unknown as UISLAPolicy

jest.mock('hooks/useGetDateAndTimeFormat', () => () => 'MM/DD/YYYY')

describe('<DatetimeCell />', () => {
    it('should render a datetime', () => {
        const {getByText} = render(<DatetimeCell policy={mockUISLAPolicy} />)

        expect(getByText('12/31/2021')).toBeInTheDocument()
    })
})
