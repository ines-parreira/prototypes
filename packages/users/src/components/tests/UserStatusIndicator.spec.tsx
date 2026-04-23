import { assumeMock, render } from '@repo/testing/vitest'

import { mockUser } from '@gorgias/helpdesk-mocks'
import { useAgentsOnlineStatus } from '@gorgias/realtime'

import { UserStatusIndicator } from '../UserStatusIndicator'

vi.mock('@gorgias/realtime')

const useAgentsOnlineStatusMock = assumeMock(useAgentsOnlineStatus)

const ALICE = mockUser({ id: 1, name: 'Alice' })

beforeEach(() => {
    useAgentsOnlineStatusMock.mockReturnValue({ onlineAgents: {} })
})

describe('UserStatusIndicator', () => {
    it('renders a grey, Offline-labeled indicator when the user is not in onlineAgents', () => {
        const { container, getByRole } = render(
            <UserStatusIndicator user={ALICE} />,
        )

        expect(getByRole('img', { name: 'Offline' })).toBeInTheDocument()
        expect(
            container.querySelector('[data-color="grey"]'),
        ).toBeInTheDocument()
    })

    it('renders a green, Online-labeled indicator when the user is in onlineAgents', () => {
        useAgentsOnlineStatusMock.mockReturnValue({
            onlineAgents: { 1: ALICE },
        })

        const { container, getByRole } = render(
            <UserStatusIndicator user={ALICE} />,
        )

        expect(getByRole('img', { name: 'Online' })).toBeInTheDocument()
        expect(
            container.querySelector('[data-color="green"]'),
        ).toBeInTheDocument()
    })

    it('reflects presence changes without remount', () => {
        const { getByRole, rerender } = render(
            <UserStatusIndicator user={ALICE} />,
        )
        expect(getByRole('img', { name: 'Offline' })).toBeInTheDocument()

        useAgentsOnlineStatusMock.mockReturnValue({
            onlineAgents: { 1: ALICE },
        })
        rerender(<UserStatusIndicator user={ALICE} />)

        expect(getByRole('img', { name: 'Online' })).toBeInTheDocument()
    })

    it('renders nothing when the user has no id', () => {
        const { container } = render(
            <UserStatusIndicator
                user={mockUser({ id: undefined, name: 'Anon' })}
            />,
        )

        expect(container).toBeEmptyDOMElement()
    })
})
