import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import { fromJS } from 'immutable'

import { user } from 'fixtures/users'
import { createJob } from 'models/job/resources'

import { MacrosCreateDropdown } from '../MacrosCreateDropdown'

jest.mock('@repo/logging', () => ({
    logEvent: jest.fn(),
    SegmentEvent: {
        MacrosExportClicked: 'macros-export-clicked',
    },
}))
jest.mock('models/job/resources', () => ({
    createJob: jest.fn(() => Promise.resolve()),
}))
jest.mock('../MacrosCSVImportPopover', () => ({
    __esModule: true,
    default: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) =>
        isOpen ? (
            <div role="dialog" aria-label="Import macros from CSV">
                <button type="button" onClick={onClose}>
                    Close
                </button>
            </div>
        ) : null,
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
        const { user } = renderMacrosCreateDropdown()

        await user.click(
            screen.getByRole('button', { name: 'Open macro actions' }),
        )
        await user.click(
            screen.getByRole('menuitem', { name: 'Export macros as CSV' }),
        )

        expect(createJob).toHaveBeenCalled()
    })

    it('should show popup when import clicked', async () => {
        const { user } = renderMacrosCreateDropdown()

        await user.click(
            screen.getByRole('button', { name: 'Open macro actions' }),
        )
        await user.click(
            screen.getByRole('menuitem', { name: 'Import macros from CSV' }),
        )

        expect(
            screen.getByRole('dialog', { name: 'Import macros from CSV' }),
        ).toBeInTheDocument()
    })

    it('should render the create macro action', () => {
        renderMacrosCreateDropdown()

        expect(
            screen.getByRole('button', { name: 'Create macro' }),
        ).toBeInTheDocument()
    })
})
