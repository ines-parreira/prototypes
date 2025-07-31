import React from 'react'

import { userEvent } from '@repo/testing'
import { render, screen } from '@testing-library/react'

import { User, UserRole } from 'config/types/user'
import TwoFactorAuthenticationDisableModal from 'pages/settings/yourProfile/twoFactorAuthentication/TwoFactorAuthenticationDisableModal'
import { assumeMock } from 'utils/testing'

import { OwnershipModal } from '../OwnershipModal'
import { Statuses } from '../Statuses'

jest.mock('../OwnershipModal', () => ({
    OwnershipModal: jest.fn(() => <div>OwnershipModal</div>),
}))

jest.mock(
    'pages/settings/yourProfile/twoFactorAuthentication/TwoFactorAuthenticationDisableModal',
    () => ({
        __esModule: true,
        default: jest.fn(() => <div>TwoFactorAuthenticationDisableModal</div>),
    }),
)

const mockedOwnershipModal = assumeMock(OwnershipModal)
const mockedTwoFactorAuthenticationDisableModal = assumeMock(
    TwoFactorAuthenticationDisableModal,
)

const props = {
    agentId: 1,
    has2FA: false,
    set2FA: jest.fn(),
    rawData: {
        email: '',
        name: 'M. Love',
        role: { name: UserRole.Admin },
    } as User,
    isAccountOwner: true,
    isViewingAccountOwner: false,
}

describe('Statuses', () => {
    it('should toggle the correct statues / actions according to props', () => {
        const { rerender } = render(<Statuses {...props} />)

        expect(screen.getByText('2FA Disabled'))
        expect(screen.queryByText('Reset 2FA Token')).not.toBeInTheDocument()
        expect(screen.queryByText('Account Owner')).not.toBeInTheDocument()
        expect(screen.queryByText('Set as Account Owner')).toBeInTheDocument()

        rerender(<Statuses {...props} has2FA isViewingAccountOwner={true} />)
        expect(screen.getByText('2FA Enabled'))
        expect(screen.queryByText('Reset 2FA Token')).toBeInTheDocument()
        expect(screen.queryByText('Account Owner')).toBeInTheDocument()
        expect(
            screen.queryByText('Set as Account Owner'),
        ).not.toBeInTheDocument()
    })

    it('should render `OwnershipModal` when clicking set owner button', () => {
        render(<Statuses {...props} />)

        userEvent.click(screen.getByText('Set as Account Owner'))
        expect(mockedOwnershipModal).toHaveBeenLastCalledWith(
            {
                agentId: props.agentId,
                name: props.rawData.name,
                isModalOpen: true,
                setModalOpen: expect.any(Function),
            },
            {},
        )
    })

    it('should render `TwoFADisableModal` when clicking reset button', () => {
        render(<Statuses {...props} has2FA />)

        userEvent.click(screen.getByText('Reset 2FA Token'))
        expect(
            mockedTwoFactorAuthenticationDisableModal,
        ).toHaveBeenLastCalledWith(
            expect.objectContaining({ isOpen: true }),
            {},
        )
    })
})
