import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { useIsMobileResolution } from '@repo/hooks'
import { useParams } from 'react-router-dom'

import { renderHook } from '../../tests/render.utils'
import { useHelpdeskV2MS1Dot5Flag } from '../useHelpdeskV2MS1-5Flag'

vi.mock('@repo/feature-flags', () => ({
    FeatureFlagKey: {
        UIVisionBetaBaseline: 'UIVisionBetaBaseline',
        UIVisionMilestone1: 'UIVisionMilestone1',
        UIVisionMilestone1Dot5: 'UIVisionMilestone1Dot5',
    },
    useFlag: vi.fn(),
}))

vi.mock('@repo/hooks', () => ({
    useIsMobileResolution: vi.fn(),
}))

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom')
    return {
        ...actual,
        useParams: vi.fn(),
    }
})

describe('useHelpdeskV2MS1Dot5Flag', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should return true when all conditions are met', () => {
        vi.mocked(useFlag).mockImplementation((key: string) => {
            if (key === FeatureFlagKey.UIVisionBetaBaseline) return true
            if (key === FeatureFlagKey.UIVisionMilestone1) return true
            if (key === FeatureFlagKey.UIVisionMilestone1Dot5) return true
            return false
        })
        vi.mocked(useIsMobileResolution).mockReturnValue(false)
        vi.mocked(useParams).mockReturnValue({ ticketId: 'new' })

        const { result } = renderHook(() => useHelpdeskV2MS1Dot5Flag())

        expect(result.current).toBe(true)
    })

    it('should return false when UIVisionBetaBaseline is disabled', () => {
        vi.mocked(useFlag).mockImplementation((key: string) => {
            if (key === FeatureFlagKey.UIVisionBetaBaseline) return false
            if (key === FeatureFlagKey.UIVisionMilestone1) return true
            if (key === FeatureFlagKey.UIVisionMilestone1Dot5) return true
            return false
        })
        vi.mocked(useIsMobileResolution).mockReturnValue(false)
        vi.mocked(useParams).mockReturnValue({ ticketId: 'new' })

        const { result } = renderHook(() => useHelpdeskV2MS1Dot5Flag())

        expect(result.current).toBe(false)
    })

    it('should return false when UIVisionMilestone1 is disabled', () => {
        vi.mocked(useFlag).mockImplementation((key: string) => {
            if (key === FeatureFlagKey.UIVisionBetaBaseline) return true
            if (key === FeatureFlagKey.UIVisionMilestone1) return false
            if (key === FeatureFlagKey.UIVisionMilestone1Dot5) return true
            return false
        })
        vi.mocked(useIsMobileResolution).mockReturnValue(false)
        vi.mocked(useParams).mockReturnValue({ ticketId: 'new' })

        const { result } = renderHook(() => useHelpdeskV2MS1Dot5Flag())

        expect(result.current).toBe(false)
    })

    it('should return false when UIVisionMilestone1Dot5 is disabled', () => {
        vi.mocked(useFlag).mockImplementation((key: string) => {
            if (key === FeatureFlagKey.UIVisionBetaBaseline) return true
            if (key === FeatureFlagKey.UIVisionMilestone1) return true
            if (key === FeatureFlagKey.UIVisionMilestone1Dot5) return false
            return false
        })
        vi.mocked(useIsMobileResolution).mockReturnValue(false)
        vi.mocked(useParams).mockReturnValue({ ticketId: 'new' })

        const { result } = renderHook(() => useHelpdeskV2MS1Dot5Flag())

        expect(result.current).toBe(false)
    })

    it('should return false when on mobile resolution', () => {
        vi.mocked(useFlag).mockImplementation((key: string) => {
            if (key === FeatureFlagKey.UIVisionBetaBaseline) return true
            if (key === FeatureFlagKey.UIVisionMilestone1) return true
            if (key === FeatureFlagKey.UIVisionMilestone1Dot5) return true
            return false
        })
        vi.mocked(useIsMobileResolution).mockReturnValue(true)
        vi.mocked(useParams).mockReturnValue({ ticketId: 'new' })

        const { result } = renderHook(() => useHelpdeskV2MS1Dot5Flag())

        expect(result.current).toBe(false)
    })

    it('should return false when ticketId is not "new"', () => {
        vi.mocked(useFlag).mockImplementation((key: string) => {
            if (key === FeatureFlagKey.UIVisionBetaBaseline) return true
            if (key === FeatureFlagKey.UIVisionMilestone1) return true
            if (key === FeatureFlagKey.UIVisionMilestone1Dot5) return true
            return false
        })
        vi.mocked(useIsMobileResolution).mockReturnValue(false)
        vi.mocked(useParams).mockReturnValue({ ticketId: '123' })

        const { result } = renderHook(() => useHelpdeskV2MS1Dot5Flag())

        expect(result.current).toBe(false)
    })

    it('should return false when ticketId is undefined', () => {
        vi.mocked(useFlag).mockImplementation((key: string) => {
            if (key === FeatureFlagKey.UIVisionBetaBaseline) return true
            if (key === FeatureFlagKey.UIVisionMilestone1) return true
            if (key === FeatureFlagKey.UIVisionMilestone1Dot5) return true
            return false
        })
        vi.mocked(useIsMobileResolution).mockReturnValue(false)
        vi.mocked(useParams).mockReturnValue({})

        const { result } = renderHook(() => useHelpdeskV2MS1Dot5Flag())

        expect(result.current).toBe(false)
    })

    it('should return false when all conditions are not met', () => {
        vi.mocked(useFlag).mockImplementation((key: string) => {
            if (key === FeatureFlagKey.UIVisionBetaBaseline) return false
            if (key === FeatureFlagKey.UIVisionMilestone1) return false
            if (key === FeatureFlagKey.UIVisionMilestone1Dot5) return false
            return false
        })
        vi.mocked(useIsMobileResolution).mockReturnValue(true)
        vi.mocked(useParams).mockReturnValue({ ticketId: '123' })

        const { result } = renderHook(() => useHelpdeskV2MS1Dot5Flag())

        expect(result.current).toBe(false)
    })
})
