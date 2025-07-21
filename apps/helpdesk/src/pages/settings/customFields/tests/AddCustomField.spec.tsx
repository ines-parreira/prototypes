import { render } from '@testing-library/react'

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
            <AddCustomField objectType={OBJECT_TYPES.TICKET} />,
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should call AddFieldForm with correct props', () => {
        render(<AddCustomField objectType={OBJECT_TYPES.TICKET} />)

        expect(AddFieldForm).toHaveBeenCalledWith(
            {
                objectType: OBJECT_TYPES.TICKET,
            },
            {},
        )
    })
})
