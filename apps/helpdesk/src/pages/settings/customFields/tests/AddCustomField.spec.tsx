import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { OBJECT_TYPES } from 'custom-fields/constants'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import AddCustomField from '../AddCustomField'
import AddFieldForm from '../components/AddFieldForm'

const queryClient = mockQueryClient()

jest.mock('../components/AddFieldForm', () => {
    return jest.fn(() => <div>AddFieldForm</div>)
})

describe('<AddCustomField/>', () => {
    beforeEach(() => {
        queryClient.clear()
    })

    it('should render', () => {
        const { container } = render(
            <MemoryRouter>
                <AddCustomField objectType={OBJECT_TYPES.TICKET} />
            </MemoryRouter>,
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should call AddFieldForm with correct props', () => {
        render(
            <MemoryRouter>
                <AddCustomField objectType={OBJECT_TYPES.TICKET} />
            </MemoryRouter>,
        )

        expect(AddFieldForm).toHaveBeenCalledWith(
            {
                objectType: OBJECT_TYPES.TICKET,
            },
            {},
        )
    })
})
