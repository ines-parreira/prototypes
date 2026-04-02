import { render, screen } from '@testing-library/react'

import { SkillEditorPage } from './SkillEditorPage'

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
        capturedProps = {}
        mockUseLocation.mockReturnValue({
            pathname: '/app/ai-agent/shopify/test-shop/skills/123',
            search: '',
            state: undefined,
        })
    })

    it('renders the skill editor with route params', () => {
        render(<SkillEditorPage />)

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

        render(<SkillEditorPage />)

        expect(capturedProps.routeState).toEqual(routeState)
    })

    it('passes undefined routeState when location.state is empty', () => {
        render(<SkillEditorPage />)

        expect(capturedProps.routeState).toBeUndefined()
    })

    it('passes shopType from route params', () => {
        render(<SkillEditorPage />)

        expect(capturedProps.shopType).toBe('shopify')
    })
})
