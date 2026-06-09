import { render } from '@repo/testing'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useHistory } from 'react-router-dom'

import { MobileAppLayout } from '../MobileAppLayout'

jest.mock('routes/layout/NavigationSidebar', () => ({
    NavigationSidebar: () => <div>Sidebar</div>,
}))

jest.mock('routes/layout/MobileHeaderActions', () => ({
    MobileHeaderActions: () => <div>Header Actions</div>,
}))

jest.mock('@gorgias/axiom', () => ({
    ...jest.requireActual('@gorgias/axiom'),
    SidePanel: ({
        children,
        isOpen,
    }: {
        children?: React.ReactNode
        isOpen?: boolean
    }) => (isOpen ? <div>{children}</div> : null),
}))

jest.mock('hooks/useCopilotEnabled', () => ({
    useCopilotEnabled: jest.fn(() => false),
}))

jest.mock('pages/CollapsibleColumn', () => ({
    CollapsibleColumn: () => null,
}))

jest.mock('copilot/CopilotWorkspaceContainer', () => ({
    CopilotWorkspaceContainer: () => null,
}))

function NavigateButton({ to }: { to: string }) {
    const history = useHistory()
    return <button onClick={() => history.push(to)}>Navigate</button>
}

describe('MobileAppLayout', () => {
    it('renders header actions in the header', () => {
        render(
            <MobileAppLayout width={400}>
                <div>main content</div>
            </MobileAppLayout>,
        )

        expect(screen.getByText('Header Actions')).toBeInTheDocument()
    })

    it('does not show the navigation sidebar initially', () => {
        render(
            <MobileAppLayout width={400}>
                <div>main content</div>
            </MobileAppLayout>,
        )

        expect(screen.getByText('main content')).toBeInTheDocument()
        expect(screen.queryByText('Sidebar')).not.toBeInTheDocument()
    })

    it('opens the navigation sidebar when the menu button is clicked', async () => {
        const user = userEvent.setup()
        render(
            <MobileAppLayout width={400}>
                <div>main content</div>
            </MobileAppLayout>,
        )

        await user.click(screen.getByRole('button'))

        expect(screen.getByText('Sidebar')).toBeInTheDocument()
    })

    it('closes the navigation sidebar when the route changes', async () => {
        const user = userEvent.setup()
        render(
            <>
                <MobileAppLayout width={400}>
                    <div>main content</div>
                </MobileAppLayout>
                <NavigateButton to="/new-route" />
            </>,
            { initialEntries: ['/current-route'] },
        )

        const [menuButton] = screen.getAllByRole('button')
        await user.click(menuButton)
        expect(screen.getByText('Sidebar')).toBeInTheDocument()

        await user.click(screen.getByRole('button', { name: 'Navigate' }))

        await waitFor(() => {
            expect(screen.queryByText('Sidebar')).not.toBeInTheDocument()
        })
    })
})
