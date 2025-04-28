import { render } from '@testing-library/react'

import { useGmvInfluencedCtaButton } from 'pages/aiAgent/Overview/hooks/kpis/useGmvInfluencedCtaButton'
import { renderHook } from 'utils/testing/renderHook'

describe('useGmvInfluencedCtaButton', () => {
    it('should render nothing when gmvInfluencedLoading = true', () => {
        const props = {
            aiAgentType: 'support' as const,
            gmvInfluenced: undefined,
            gmvInfluencedLoading: true,
            isOnNewPlan: false,
            showEarlyAccessModal: jest.fn(),
            showActivationModal: jest.fn(),
        }
        const { result } = renderHook(() => useGmvInfluencedCtaButton(props))
        expect(result.current).toBeUndefined()
    })

    it('should render nothing when gmvInfluenced !== 0', () => {
        const props = {
            aiAgentType: 'support' as const,
            gmvInfluenced: 100,
            gmvInfluencedLoading: false,
            isOnNewPlan: false,
            showEarlyAccessModal: jest.fn(),
            showActivationModal: jest.fn(),
        }
        const { result } = renderHook(() => useGmvInfluencedCtaButton(props))
        expect(result.current).toBeUndefined()
    })

    it.each(['mixed' as const, 'sales' as const])(
        'should render nothing when %s',
        (aiAgentType) => {
            const props = {
                aiAgentType,
                gmvInfluenced: 0,
                gmvInfluencedLoading: false,
                isOnNewPlan: false,
                showEarlyAccessModal: jest.fn(),
                showActivationModal: jest.fn(),
            }
            const { result } = renderHook(() =>
                useGmvInfluencedCtaButton(props),
            )
            expect(result.current).toBeUndefined()
        },
    )

    it('should render the Upgrade button when aiAgentType is support + not on new plan + gmvInfluenced = 0', () => {
        const props = {
            aiAgentType: 'support' as const,
            gmvInfluenced: 0,
            gmvInfluencedLoading: false,
            isOnNewPlan: false,
            showEarlyAccessModal: jest.fn(),
            showActivationModal: jest.fn(),
        }
        const { result } = renderHook(() => useGmvInfluencedCtaButton(props))

        const { findByText } = render(<>{result.current}</>)
        expect(findByText('Upgrade')).toBeDefined()
    })

    it('should render the Activate button when aiAgentType is support + not on new plan + gmvInfluenced = 0', () => {
        const props = {
            aiAgentType: 'support' as const,
            gmvInfluenced: 0,
            gmvInfluencedLoading: false,
            isOnNewPlan: true,
            showEarlyAccessModal: jest.fn(),
            showActivationModal: jest.fn(),
        }
        const { result } = renderHook(() => useGmvInfluencedCtaButton(props))

        const { findByText } = render(<>{result.current}</>)
        expect(findByText('Activate')).toBeDefined()
    })
})
