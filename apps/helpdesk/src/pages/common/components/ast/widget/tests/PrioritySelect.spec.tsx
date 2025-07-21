import { fireEvent, render, screen } from '@testing-library/react'
import { fromJS, List } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { useFlag } from 'core/flags'
import { assumeMock } from 'utils/testing'

import PrioritySelect from '../PrioritySelect'

const mockStore = configureMockStore([thunk])

jest.mock('core/flags', () => ({
    useFlag: jest.fn(),
}))

const useFlagMock = assumeMock(useFlag)

describe('<PrioritySelect />', () => {
    const mockSchemas = fromJS({
        definitions: {
            Ticket: {
                properties: {
                    priority: {
                        meta: {
                            enum: List(['low', 'medium', 'high']),
                        },
                    },
                },
            },
        },
    })

    const store = mockStore({
        schemas: mockSchemas,
    })

    const defaultProps = {
        onChange: jest.fn(),
        value: 'medium',
        className: 'test-class',
    }

    beforeEach(() => {
        useFlagMock.mockReturnValue(true)
    })

    const renderComponent = (props = {}) =>
        render(
            <Provider store={store}>
                <PrioritySelect {...defaultProps} {...props} />
            </Provider>,
        )

    it('should not render when the flag is off', () => {
        useFlagMock.mockReturnValue(false)
        const { container } = renderComponent()

        expect(container.firstChild).toBeNull()
    })

    it('should call onChange when selecting a different priority', () => {
        renderComponent()

        fireEvent.click(screen.getByText('high'))

        expect(defaultProps.onChange).toHaveBeenCalledWith('high')
    })

    it('should render all priority options from schemas', () => {
        renderComponent()

        expect(screen.getByText('low')).toBeInTheDocument()
        expect(screen.getByText('medium')).toBeInTheDocument()
        expect(screen.getByText('high')).toBeInTheDocument()
    })

    it('should handle undefined value', () => {
        renderComponent({ value: undefined })

        expect(screen.getByText('Select an option')).toBeInTheDocument()
    })
})
