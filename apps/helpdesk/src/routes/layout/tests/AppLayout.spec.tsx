import { useIsMobileResolution } from '@repo/hooks'
import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { AppLayout } from '../AppLayout'

jest.mock('routes/layout/NavigationSidebar', () => ({
    NavigationSidebar: () => <div>Sidebar</div>,
}))

jest.mock('@repo/hooks', () => ({
    ...jest.requireActual('@repo/hooks'),
    useIsMobileResolution: jest.fn(),
}))

jest.mock('@gorgias/axiom', () => ({
    ...jest.requireActual('@gorgias/axiom'),
    SidePanel: ({ children }: { children?: React.ReactNode }) => (
        <div>{children}</div>
    ),
}))

const mockUseIsMobileResolution = useIsMobileResolution as jest.MockedFunction<
    typeof useIsMobileResolution
>

describe('AppLayout', () => {
    beforeEach(() => {
        mockUseIsMobileResolution.mockReturnValue(false)
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

    describe('on mobile resolution', () => {
        beforeEach(() => {
            mockUseIsMobileResolution.mockReturnValue(true)
        })

        it('should render main content and sidebar in mobile layout', () => {
            render(
                <AppLayout hasPanel={false}>
                    <div>main content</div>
                </AppLayout>,
            )
            expect(screen.getByText('main content')).toBeInTheDocument()
            expect(screen.getByText('Sidebar')).toBeInTheDocument()
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
