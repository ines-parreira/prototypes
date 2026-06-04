import { render } from '@repo/testing'
import { act, screen } from '@testing-library/react'

import { helpCenterKeys } from 'models/helpCenter/queries'

import { SkillEditorPage } from './SkillEditorPage'

const mockInvalidateQueries = jest.fn()
jest.mock('@tanstack/react-query', () => ({
    ...jest.requireActual('@tanstack/react-query'),
    useQueryClient: () => ({
        invalidateQueries: mockInvalidateQueries,
    }),
}))
const mockUseLocation = jest.fn()
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: () => ({
        shopType: 'shopify',
        shopName: 'test-shop',
        skillId: '123',
    }),
    useLocation: () => mockUseLocation(),
    useHistory: () => ({ push: jest.fn() }),
}))
jest.mock('pages/aiAgent/hooks/useAiAgentNavigation', () => ({
    useAiAgentNavigation: () => ({
        routes: {
            skills: '/app/ai-agent/shopify/test-shop/skills',
        },
    }),
}))
const mockUseAiAgentHelpCenter = jest.fn()
jest.mock('pages/aiAgent/hooks/useAiAgentHelpCenter', () => ({
    useAiAgentHelpCenter: () => mockUseAiAgentHelpCenter(),
}))
const renderWithProviders = (ui: React.ReactElement) => {
    return {
        ...render(<>{ui}</>, {}),
    }
}
let capturedProps: Record<string, unknown> = {}
jest.mock(
    'pages/aiAgent/components/KnowledgeEditor/KnowledgeEditorSkill/KnowledgeEditorSkill',
    () => ({
        KnowledgeEditorSkill: (props: Record<string, unknown>) => {
            capturedProps = props
            return (
                <div>
                    Skill Editor: {String(props.shopName)} -{' '}
                    {String(props.skillId)}
                </div>
            )
        },
    }),
)
describe('SkillEditorPage', () => {
    beforeEach(() => {
        mockInvalidateQueries.mockClear()
        capturedProps = {}
        mockUseLocation.mockReturnValue({
            pathname: '/app/ai-agent/shopify/test-shop/skills/123',
            search: '',
            state: undefined,
        })
        mockUseAiAgentHelpCenter.mockReturnValue({
            id: 42,
            default_locale: 'en-US',
        })
    })
    it('renders the skill editor with route params', () => {
        renderWithProviders(<SkillEditorPage />)
        expect(
            screen.getByText('Skill Editor: test-shop - 123'),
        ).toBeInTheDocument()
    })
    it('passes routeState from location.state', () => {
        const routeState = {
            title: 'Order Status',
            intents: ['order::status'],
        }
        mockUseLocation.mockReturnValue({
            pathname: '/app/ai-agent/shopify/test-shop/skills/new',
            search: '',
            state: routeState,
        })
        renderWithProviders(<SkillEditorPage />)
        expect(capturedProps.routeState).toEqual(routeState)
    })
    it('passes undefined routeState when location.state is empty', () => {
        renderWithProviders(<SkillEditorPage />)
        expect(capturedProps.routeState).toBeUndefined()
    })
    it('passes shopType from route params', () => {
        renderWithProviders(<SkillEditorPage />)
        expect(capturedProps.shopType).toBe('shopify')
    })
    it('invalidates the intents query when onUpdate is called', () => {
        renderWithProviders(<SkillEditorPage />)
        act(() => {
            ;(capturedProps.onUpdate as () => void)()
        })
        expect(mockInvalidateQueries).toHaveBeenCalledWith(
            helpCenterKeys.intents(42),
        )
    })
    it('invalidates the intents query when onDelete is called', () => {
        renderWithProviders(<SkillEditorPage />)
        act(() => {
            ;(capturedProps.onDelete as () => void)()
        })
        expect(mockInvalidateQueries).toHaveBeenCalledWith(
            helpCenterKeys.intents(42),
        )
    })
    it('does not invalidate intents when the help center is not loaded', () => {
        mockUseAiAgentHelpCenter.mockReturnValue(undefined)
        renderWithProviders(<SkillEditorPage />)
        act(() => {
            ;(capturedProps.onUpdate as () => void)()
        })
        expect(mockInvalidateQueries).not.toHaveBeenCalled()
    })
    it('passes undefined initialVersionId when versionId is absent from the URL', () => {
        renderWithProviders(<SkillEditorPage />)
        expect(capturedProps.initialVersionId).toBeUndefined()
    })
    it('parses versionId from the URL and passes it as initialVersionId', () => {
        mockUseLocation.mockReturnValue({
            pathname: '/app/ai-agent/shopify/test-shop/skills/123',
            search: '?versionId=17',
            state: undefined,
        })
        renderWithProviders(<SkillEditorPage />)
        expect(capturedProps.initialVersionId).toBe(17)
    })
    it('passes undefined initialVersionId when versionId is non-numeric', () => {
        mockUseLocation.mockReturnValue({
            pathname: '/app/ai-agent/shopify/test-shop/skills/123',
            search: '?versionId=mock-version-abc',
            state: undefined,
        })
        renderWithProviders(<SkillEditorPage />)
        expect(capturedProps.initialVersionId).toBeUndefined()
    })
})
