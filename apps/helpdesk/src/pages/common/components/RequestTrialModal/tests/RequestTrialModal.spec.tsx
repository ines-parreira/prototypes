import React from 'react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import type { User } from 'config/types/user'
import { UserRole } from 'config/types/user'

import RequestTrialModal from '../RequestTrialModal'

const adminNames = [
    { name: 'Alice Johnson', email: 'alice@company.com', color: '4A90E2' },
    { name: 'Bob Smith', email: 'bob@company.com', color: '4A90E2' },
    { name: 'Carol Williams', email: 'carol@company.com', color: 'E74C3C' },
    { name: 'David Brown', email: 'david@company.com', color: '9B59B6' },
    { name: 'Eva Davis', email: 'eva@company.com', color: '2ECC71' },
    { name: 'Frank Miller', email: 'frank@company.com', color: 'F39C12' },
    { name: 'Grace Wilson', email: 'grace@company.com', color: '1ABC9C' },
    { name: 'Henry Taylor', email: 'henry@company.com', color: 'F1C40F' },
    { name: 'Irene Clark', email: 'irene@company.com', color: 'E67E22' },
]

const mockAdmins: User[] = adminNames.map((admin, index) => {
    const [firstname, lastname] = admin.name.split(' ')
    return {
        id: index + 1,
        name: admin.name,
        email: admin.email,
        active: true,
        bio: null,
        country: 'US',
        language: 'en',
        created_datetime: '2023-01-01T00:00:00Z',
        deactivated_datetime: null,
        external_id: `ext-${index + 1}`,
        firstname,
        lastname,
        meta: {
            profile_picture_url: '',
        },
        updated_datetime: '2023-01-01T00:00:00Z',
        settings: [],
        timezone: 'America/New_York',
        has_2fa_enabled: index % 2 === 0,
        client_id: null,
        role: { name: UserRole.Admin },
    }
})

const defaultProps = {
    title: 'Request Trial',
    subtitle: 'Your admins will be notified',
    accountAdmins: mockAdmins,
    primaryCTALabel: 'Notify Admins',
    isOpen: true,
    onClose: jest.fn(),
    onPrimaryAction: jest.fn(),
}

describe('RequestTrialModal', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders with the correct title and subtitle', () => {
        render(<RequestTrialModal {...defaultProps} />)

        expect(screen.getByText('Request Trial')).toBeInTheDocument()
        expect(
            screen.getByText('Your admins will be notified'),
        ).toBeInTheDocument()
    })

    it('displays the admin list when admins are provided', () => {
        render(<RequestTrialModal {...defaultProps} />)

        expect(screen.getByText('Alice Johnson')).toBeInTheDocument()
        expect(screen.getByText('Bob Smith')).toBeInTheDocument()

        expect(screen.getByText('+1 people')).toBeInTheDocument()
    })

    it('does not display admin list when no admins are provided', () => {
        render(<RequestTrialModal {...defaultProps} accountAdmins={[]} />)

        expect(screen.queryByText('Alice Johnson')).not.toBeInTheDocument()
        expect(screen.queryByText('Bob Smith')).not.toBeInTheDocument()
    })

    it('shows the correct primary button label', () => {
        render(<RequestTrialModal {...defaultProps} />)

        expect(
            screen.getByRole('button', { name: 'Notify Admins' }),
        ).toBeInTheDocument()
    })

    it('calls onClose when Cancel button is clicked', async () => {
        const user = userEvent.setup()
        render(<RequestTrialModal {...defaultProps} />)

        const cancelButton = screen.getByRole('button', { name: 'Cancel' })
        await user.click(cancelButton)

        expect(defaultProps.onClose).toHaveBeenCalledTimes(1)
    })

    it('calls onPrimaryAction with empty note when primary button is clicked without entering a note', async () => {
        const user = userEvent.setup()
        render(<RequestTrialModal {...defaultProps} />)

        const primaryButton = screen.getByRole('button', {
            name: 'Notify Admins',
        })
        await user.click(primaryButton)

        expect(defaultProps.onPrimaryAction).toHaveBeenCalledTimes(1)
        expect(defaultProps.onPrimaryAction).toHaveBeenCalledWith('')
    })

    it('calls onPrimaryAction with note text when primary button is clicked after entering a note', async () => {
        const user = userEvent.setup()
        render(<RequestTrialModal {...defaultProps} />)

        const noteInput = screen.getByRole('textbox', { name: /add a note/i })
        await user.type(noteInput, 'This is a test note')

        const primaryButton = screen.getByRole('button', {
            name: 'Notify Admins',
        })
        await user.click(primaryButton)

        expect(defaultProps.onPrimaryAction).toHaveBeenCalledTimes(1)
        expect(defaultProps.onPrimaryAction).toHaveBeenCalledWith(
            'This is a test note',
        )
    })

    it('trims whitespace from note before submitting', async () => {
        const user = userEvent.setup()
        render(<RequestTrialModal {...defaultProps} />)

        const noteInput = screen.getByRole('textbox', { name: /add a note/i })
        await user.type(noteInput, '   Note with whitespace   ')

        const primaryButton = screen.getByRole('button', {
            name: 'Notify Admins',
        })
        await user.click(primaryButton)

        expect(defaultProps.onPrimaryAction).toHaveBeenCalledWith(
            'Note with whitespace',
        )
    })

    it('does not render the modal when isOpen is false', () => {
        render(<RequestTrialModal {...defaultProps} isOpen={false} />)

        expect(screen.queryByText('Request Trial')).not.toBeInTheDocument()
        expect(
            screen.queryByText('Your admins will be notified'),
        ).not.toBeInTheDocument()
    })
})
