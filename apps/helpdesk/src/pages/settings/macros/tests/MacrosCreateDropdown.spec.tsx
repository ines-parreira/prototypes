import { history } from '@repo/routing'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { user } from 'fixtures/users'
import { createJob } from 'models/job/resources'
import { RootState } from 'state/types'
import { renderWithRouter } from 'utils/testing'

import { MacrosCreateDropdown } from '../MacrosCreateDropdown'

jest.mock('models/job/resources', () => ({
    createJob: jest.fn(() => Promise.resolve()),
}))

describe('<MacrosCreateDropdown/>', () => {
    const defaultStore = configureMockStore([thunk])({
        currentUser: fromJS(user),
    } as RootState)

    it('should render', () => {
        const { container } = renderWithRouter(
            <Provider store={defaultStore}>
                <MacrosCreateDropdown />
            </Provider>,
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should start job when download clicked', () => {
        const { getByText } = renderWithRouter(
            <Provider store={defaultStore}>
                <MacrosCreateDropdown />
            </Provider>,
        )
        fireEvent.click(getByText('Export macros as CSV'))
        expect(createJob).toHaveBeenCalled()
    })

    it('should show popup when import clicked', async () => {
        const { getByText } = renderWithRouter(
            <Provider store={defaultStore}>
                <MacrosCreateDropdown />
            </Provider>,
        )
        fireEvent.click(getByText('Import macros from CSV'))
        await waitFor(() =>
            expect(
                screen.getByText(
                    'You can import your macros into gorgias using a CSV. More information on macros variables',
                ),
            ).toBeTruthy(),
        )
    })
    it('should redirect when creating new macro', () => {
        const { getByText } = renderWithRouter(
            <Provider store={defaultStore}>
                <MacrosCreateDropdown />
            </Provider>,
        )

        fireEvent.click(getByText('Create macro'))
        expect(history.push).toHaveBeenNthCalledWith(
            1,
            '/app/settings/macros/new',
        )
    })
})
