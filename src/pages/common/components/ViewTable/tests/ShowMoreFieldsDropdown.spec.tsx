import { fireEvent, render, screen } from '@testing-library/react'
import { List, Map } from 'immutable'
import { Provider } from 'react-redux'
import configureStore from 'redux-mock-store'

import * as Segment from 'common/segment'
import ShowMoreFieldsDropdown from 'pages/common/components/ViewTable/ShowMoreFieldsDropdown'

jest.mock('common/segment', () => ({
    logEvent: jest.fn(),
    SegmentEvent: {
        ShowMoreFieldsClicked: 'ShowMoreFieldsClicked',
    },
}))

const mockStore = configureStore([])

describe('ShowMoreFieldsDropdown', () => {
    let store: any
    let defaultProps: any

    beforeEach(() => {
        defaultProps = {
            config: Map({ mainField: 'field1' }),
            fields: List([
                Map({ name: 'field1', title: 'Field 1' }),
                Map({ name: 'field2', title: 'Field 2' }),
            ]),
            visibleFields: List([
                Map({ name: 'field1', title: 'Field 1' }),
                Map({ name: 'field2', title: 'Field 2' }),
            ]),
            shouldStoreFieldConfig: true,
        }
        store = mockStore({})
        store.dispatch = jest.fn()
    })

    const renderComponent = (props = {}) =>
        render(
            <Provider store={store}>
                <ShowMoreFieldsDropdown {...defaultProps} {...props} />
            </Provider>,
        )

    it('renders the dropdown header "COLUMNS"', () => {
        renderComponent()

        expect(screen.getByText('COLUMNS')).toBeInTheDocument()
    })

    it('renders the mandatory field checkbox as disabled', () => {
        renderComponent()

        const checkbox = screen.getByLabelText('Field 1')

        expect(checkbox).toBeDisabled()
    })

    it('logs event when the dropdown is clicked', () => {
        renderComponent()

        const dropdownToggle = screen.getByRole('button')

        fireEvent.click(dropdownToggle)

        expect(Segment.logEvent).toHaveBeenCalledWith(
            Segment.SegmentEvent.ShowMoreFieldsClicked,
        )
    })
})
