import { Panel } from '@repo/layout'
import { assumeMock, render } from '@repo/testing'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useIsMobileResolution } from '@gorgias/toolkit-react'

import { CopilotPanel } from '@gorgias/copilot'

import { useCopilotEnabled } from 'hooks/useCopilotEnabled'

import { AppLayout } from '../AppLayout'

jest.mock('@gorgias/copilot')

jest.mock('routes/layout/NavigationSidebar', () => ({
    NavigationSidebar: () => <div>Sidebar</div>,
}))

jest.mock('@gorgias/toolkit-react', () => ({
    ...jest.requireActual('@gorgias/toolkit-react'),
    useIsMobileResolution: jest.fn(),
}))

jest.mock('hooks/useCopilotEnabled', () => ({
    useCopilotEnabled: jest.fn(() => false),
}))

const mockUseIsMobileResolution = useIsMobileResolution as jest.MockedFunction<
    typeof useIsMobileResolution
>
const mockUseCopilotEnabled = assumeMock(useCopilotEnabled)
const mockCopilotPanel = assumeMock(CopilotPanel)

const routePanelConfig = {
    defaultSize: Infinity,
    minSize: 300,
    maxSize: Infinity,
}

describe('AppLayout', () => {
    beforeEach(() => {
        localStorage.clear()
        mockUseIsMobileResolution.mockReturnValue(false)
        mockUseCopilotEnabled.mockReturnValue(false)
        mockCopilotPanel.mockClear()
    })

    it('should render sidebar and children when hasPanel is false', () => {
        render(
            <AppLayout hasPanel={false}>
                <div>main content</div>
            </AppLayout>,
        )
        expect(screen.getByText('main content')).toBeInTheDocument()
        expect(screen.getByText('Sidebar')).toBeInTheDocument()
    })

    it('should render sidebar and children when hasPanel is true', () => {
        render(
            <AppLayout hasPanel={true}>
                <div>main content</div>
            </AppLayout>,
        )
        expect(screen.getByText('main content')).toBeInTheDocument()
        expect(screen.getByText('Sidebar')).toBeInTheDocument()
    })

    it('should render the expanded sidebar at its default width without saved panel sizes', async () => {
        const { container } = render(
            <AppLayout hasPanel={false}>
                <div>main content</div>
            </AppLayout>,
        )
        const mainPanel = container.querySelector(
            '[data-panel-name="main-panel"]',
        )
        const expandedSidebar = container.querySelector(
            '[data-panel-name="sidebar-expanded"]',
        )

        await waitFor(() => {
            expect(mainPanel).not.toHaveStyle({ width: '0px' })
        })
        expect(expandedSidebar).toHaveStyle({ width: '240px' })
        expect(JSON.parse(localStorage.getItem('panel-sizes') ?? '{}')).toEqual(
            {
                'sidebar-expanded': 240,
            },
        )
    })

    it('should render the expanded sidebar at its default width when panel routes are nested', async () => {
        const { container } = render(
            <AppLayout hasPanel={true}>
                <Panel name="route-panel" config={routePanelConfig}>
                    nested panel routes
                </Panel>
            </AppLayout>,
        )
        const expandedSidebar = container.querySelector(
            '[data-panel-name="sidebar-expanded"]',
        )
        const routePanel = container.querySelector(
            '[data-panel-name="route-panel"]',
        )

        await waitFor(() => {
            expect(expandedSidebar).toHaveStyle({ width: '240px' })
            expect(routePanel).not.toHaveStyle({ width: '0px' })
        })
        expect(JSON.parse(localStorage.getItem('panel-sizes') ?? '{}')).toEqual(
            {
                'sidebar-expanded': 240,
            },
        )
    })

    it('mounts the copilot panel when copilot is enabled', () => {
        mockUseCopilotEnabled.mockReturnValue(true)

        render(
            <AppLayout hasPanel={false}>
                <div>main content</div>
            </AppLayout>,
        )

        expect(mockCopilotPanel).toHaveBeenCalled()
    })

    describe('on mobile resolution', () => {
        beforeEach(() => {
            mockUseIsMobileResolution.mockReturnValue(true)
        })

        it('should render main content without showing the navigation sidebar initially', () => {
            render(
                <AppLayout hasPanel={false}>
                    <div>main content</div>
                </AppLayout>,
            )
            expect(screen.getByText('main content')).toBeInTheDocument()
            expect(screen.queryByText('Sidebar')).not.toBeInTheDocument()
        })

        it('should open the sidebar side panel when the menu button is clicked', async () => {
            const user = userEvent.setup()
            render(
                <AppLayout hasPanel={false}>
                    <div>main content</div>
                </AppLayout>,
            )

            await user.click(screen.getByRole('button'))

            expect(screen.getByText('Sidebar')).toBeInTheDocument()
        })
    })
})
