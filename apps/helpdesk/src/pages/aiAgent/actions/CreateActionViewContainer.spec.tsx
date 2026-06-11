import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import { Route } from 'react-router'

import { useActionCentralizedLibraryEnabled } from 'hooks/integrations/useActionCentralizedLibraryEnabled'

import { CreateActionViewContainer } from './CreateActionViewContainer'

jest.mock('hooks/integrations/useActionCentralizedLibraryEnabled', () => {
    const actual = jest.requireActual(
        'hooks/integrations/useActionCentralizedLibraryEnabled',
    )
    return {
        ...actual,
        useActionCentralizedLibraryEnabled: jest.fn(),
    }
})

jest.mock('pages/aiAgent/actionsV2/ActionCreateWizardView', () => ({
    __esModule: true,
    ActionCreateWizardView: () => <div>Wizard View Mock</div>,
}))

jest.mock('./CreateActionView', () => ({
    __esModule: true,
    CreateActionView: () => <div>Legacy View Mock</div>,
}))

jest.mock('./providers/GuidanceReferenceProvider', () => ({
    __esModule: true,
    GuidanceReferenceProvider: ({
        children,
    }: {
        children: React.ReactNode
    }) => <>{children}</>,
}))

jest.mock('./providers/StoreTrackstarProvider', () => ({
    __esModule: true,
    StoreTrackstarProvider: ({ children }: { children: React.ReactNode }) => (
        <>{children}</>
    ),
}))

const mockUseActionCentralizedLibraryEnabled = jest.mocked(
    useActionCentralizedLibraryEnabled,
)

const path = '/app/ai-agent/:shopType/:shopName/actions/new'
const entry = '/app/ai-agent/shopify/shopify-store/actions/new'

const renderContainer = () =>
    render(
        <Route path={path}>
            <CreateActionViewContainer />
        </Route>,
        { initialEntries: [entry] },
    )

describe('<CreateActionViewContainer />', () => {
    it('renders a skeleton while the milestone flag is loading', () => {
        mockUseActionCentralizedLibraryEnabled.mockReturnValue({
            isEnabled: false,
            milestone: 'OFF',
            isLoading: true,
        })

        renderContainer()

        expect(screen.queryByText('Wizard View Mock')).not.toBeInTheDocument()
        expect(screen.queryByText('Legacy View Mock')).not.toBeInTheDocument()
    })

    it('renders the legacy view when the milestone is OFF', () => {
        mockUseActionCentralizedLibraryEnabled.mockReturnValue({
            isEnabled: false,
            milestone: 'OFF',
            isLoading: false,
        })

        renderContainer()

        expect(screen.getByText('Legacy View Mock')).toBeInTheDocument()
        expect(screen.queryByText('Wizard View Mock')).not.toBeInTheDocument()
    })

    it('renders the legacy view when the milestone is below MILESTONE-2', () => {
        mockUseActionCentralizedLibraryEnabled.mockReturnValue({
            isEnabled: true,
            milestone: 'MILESTONE-1',
            isLoading: false,
        })

        renderContainer()

        expect(screen.getByText('Legacy View Mock')).toBeInTheDocument()
        expect(screen.queryByText('Wizard View Mock')).not.toBeInTheDocument()
    })

    it('renders the wizard view at MILESTONE-2', () => {
        mockUseActionCentralizedLibraryEnabled.mockReturnValue({
            isEnabled: true,
            milestone: 'MILESTONE-2',
            isLoading: false,
        })

        renderContainer()

        expect(screen.getByText('Wizard View Mock')).toBeInTheDocument()
        expect(screen.queryByText('Legacy View Mock')).not.toBeInTheDocument()
    })

    it('renders the wizard view at MILESTONE-3 (any milestone >= 2)', () => {
        mockUseActionCentralizedLibraryEnabled.mockReturnValue({
            isEnabled: true,
            milestone: 'MILESTONE-3',
            isLoading: false,
        })

        renderContainer()

        expect(screen.getByText('Wizard View Mock')).toBeInTheDocument()
        expect(screen.queryByText('Legacy View Mock')).not.toBeInTheDocument()
    })
})
