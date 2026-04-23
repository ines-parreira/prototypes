import { assumeMock, render } from '@repo/testing/vitest'

import { mockUser } from '@gorgias/helpdesk-mocks'
import { useAgentsOnlineStatus } from '@gorgias/realtime'

import { UserAvatar } from '../UserAvatar'

vi.mock('@gorgias/realtime')

const useAgentsOnlineStatusMock = assumeMock(useAgentsOnlineStatus)

const ALICE = mockUser({ id: 1, name: 'Alice' })

beforeEach(() => {
    useAgentsOnlineStatusMock.mockReturnValue({ onlineAgents: {} })
})

describe('UserAvatar', () => {
    it('renders the status indicator by default', () => {
        const { getByRole } = render(<UserAvatar user={ALICE} />)

        expect(getByRole('img', { name: 'Offline' })).toBeInTheDocument()
    })

    it('omits the status indicator when withStatus is false', () => {
        const { queryByRole } = render(
            <UserAvatar user={ALICE} withStatus={false} />,
        )

        expect(queryByRole('img', { name: 'Offline' })).not.toBeInTheDocument()
        expect(queryByRole('img', { name: 'Online' })).not.toBeInTheDocument()
    })

    it('renders nothing when the user has no id', () => {
        const { container } = render(
            <UserAvatar user={mockUser({ id: undefined, name: 'Anon' })} />,
        )

        expect(container).toBeEmptyDOMElement()
    })
})
