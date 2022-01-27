import React from 'react'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import {fireEvent, render, waitFor, screen} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'

import {createJob} from 'models/job/resources'
import {MacrosManageDropdown} from '../MacrosManageDropdown'

jest.mock('models/job/resources', () => ({
    createJob: jest.fn(() => Promise.resolve()),
}))

describe('<MacrosManageDropdown/>', () => {
    const defaultStore = configureMockStore([thunk])()

    it('should render', () => {
        const {container} = render(
            <Provider store={defaultStore}>
                <MacrosManageDropdown />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should start job when download clicked', () => {
        const {getByText} = render(
            <Provider store={defaultStore}>
                <MacrosManageDropdown />
            </Provider>
        )
        fireEvent.click(getByText('Export macros as CSV'))
        expect(createJob).toHaveBeenCalled()
    })

    it('should show popup when import clicked', async () => {
        const {getByText} = render(
            <Provider store={defaultStore}>
                <MacrosManageDropdown />
            </Provider>
        )
        fireEvent.click(getByText('Import macros from CSV'))
        await waitFor(() =>
            expect(
                screen.getByText(
                    'You can import your macros into gorgias using a CSV. More information on macros variables'
                )
            ).toBeTruthy()
        )
    })
})
