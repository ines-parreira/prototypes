import { render } from '@repo/testing'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { fromJS } from 'immutable'

import { user } from 'fixtures/users'
import { createJob } from 'models/job/resources'

import { MacrosCreateDropdown } from '../MacrosCreateDropdown'

jest.mock('models/job/resources', () => ({
    createJob: jest.fn(() => Promise.resolve()),
}))

const renderMacrosCreateDropdown = () =>
    render(<MacrosCreateDropdown />, {
        storeState: {
            currentUser: fromJS(user),
        },
    })

describe('<MacrosCreateDropdown/>', () => {
    it('should render available macro actions', () => {
        renderMacrosCreateDropdown()

        expect(
            screen.getByRole('button', { name: 'Create macro' }),
        ).toBeEnabled()
        expect(screen.getByText('Import macros from CSV')).toBeInTheDocument()
        expect(screen.getByText('Export macros as CSV')).toBeInTheDocument()
    })

    it('should start job when download clicked', async () => {
        const user = userEvent.setup()
        renderMacrosCreateDropdown()

        await user.click(screen.getByText('Export macros as CSV'))

        expect(createJob).toHaveBeenCalled()
    })

    it('should show popup when import clicked', async () => {
        const user = userEvent.setup()
        renderMacrosCreateDropdown()

        await user.click(screen.getByText('Import macros from CSV'))

        await waitFor(() =>
            expect(
                screen.getByText(
                    'You can import your macros into gorgias using a CSV. More information on macros variables',
                ),
            ).toBeTruthy(),
        )
    })

    it('should render the create macro action', () => {
        renderMacrosCreateDropdown()

        expect(
            screen.getByRole('button', { name: 'Create macro' }),
        ).toBeInTheDocument()
    })
})
