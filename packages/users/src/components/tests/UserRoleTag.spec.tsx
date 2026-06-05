import { UserRole } from '@repo/permissions'
import { render } from '@repo/testing/vitest'
import { screen } from '@testing-library/react'

import { mockUser } from '@gorgias/helpdesk-mocks'

import { ROLE_CONFIG, UserRoleTag } from '../UserRoleTag'

const ACCOUNT_OWNER_ID = 42

describe('UserRoleTag', () => {
    beforeAll(() => {
        window.GORGIAS_STATE = {
            currentAccount: { domain: 'acme', user_id: ACCOUNT_OWNER_ID },
        } as Window['GORGIAS_STATE']
    })

    it('renders the account owner tag for the account owner', () => {
        render(
            <UserRoleTag
                user={mockUser({
                    id: ACCOUNT_OWNER_ID,
                    role: { name: UserRole.Admin },
                })}
            />,
        )

        expect(screen.getByText('Account Owner')).toBeInTheDocument()
    })

    it('renders the configured label for a known role', () => {
        render(
            <UserRoleTag
                user={mockUser({ id: 1, role: { name: UserRole.Admin } })}
            />,
        )

        expect(
            screen.getByText(ROLE_CONFIG[UserRole.Admin].label),
        ).toBeInTheDocument()
    })

    it('renders the raw role for an unknown role', () => {
        render(
            <UserRoleTag
                user={mockUser({ id: 1, role: { name: 'wizard' } })}
            />,
        )

        expect(screen.getByText('wizard')).toBeInTheDocument()
    })

    it('renders nothing when the user has no role', () => {
        const { container } = render(
            <UserRoleTag user={mockUser({ id: 1, role: undefined })} />,
        )

        expect(container).toBeEmptyDOMElement()
    })
})
