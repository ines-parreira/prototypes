import { fireEvent, screen } from '@testing-library/react'

import { renderWithStoreAndQueryClientAndRouter } from 'tests/renderWithStoreAndQueryClientAndRouter'

import AddCustomBusinessHoursModal from '../AddCustomBusinessHoursModal'

jest.mock('../AddCustomBusinessHoursModalGeneralSection', () => () => (
    <div>AddCustomBusinessHoursModalGeneralSection</div>
))

jest.mock('../CustomBusinessHoursIntegrationsTable', () => () => (
    <div>CustomBusinessHoursIntegrationsTable</div>
))

const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
}
const renderComponent = (props = defaultProps) => {
    return renderWithStoreAndQueryClientAndRouter(
        <AddCustomBusinessHoursModal {...props} />,
        {},
    )
}

describe('AddCustomBusinessHoursModal', () => {
    it('renders the modal with correct title and sections', () => {
        renderComponent()

        expect(
            screen.getByText('Add Custom Business Hours'),
        ).toBeInTheDocument()

        expect(
            screen.getByText('AddCustomBusinessHoursModalGeneralSection'),
        ).toBeInTheDocument()

        expect(
            screen.getByText('CustomBusinessHoursIntegrationsTable'),
        ).toBeInTheDocument()
    })

    it('renders both action buttons', () => {
        renderComponent()

        expect(
            screen.getByRole('button', { name: 'Cancel' }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: 'Add Business Hours' }),
        ).toBeInTheDocument()
    })

    it('calls onClose when Cancel button is clicked', () => {
        renderComponent()

        const cancelButton = screen.getByRole('button', { name: 'Cancel' })
        fireEvent.click(cancelButton)

        expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
    })
})
