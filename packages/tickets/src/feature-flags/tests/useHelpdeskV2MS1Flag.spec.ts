import {
    FeatureFlagKey,
    useFlag,
    useHelpdeskV2BaselineFlag,
} from '@repo/feature-flags'
import { useIsMobileResolution } from '@repo/hooks'
import { useParams } from 'react-router-dom'

import { renderHook } from '../../tests/render.utils'
import { useHelpdeskV2MS1Flag } from '../useHelpdeskV2MS1Flag'

vi.mock('@repo/feature-flags', () => ({
    FeatureFlagKey: {
        UIVisionMilestone1: 'UIVisionMilestone1',
    },
    useFlag: vi.fn(),
    useHelpdeskV2BaselineFlag: vi.fn(),
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

describe('useHelpdeskV2MS1Flag', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should return true when all conditions are met', () => {
        vi.mocked(useHelpdeskV2BaselineFlag).mockReturnValue({
            hasUIVisionBetaBaselineFlag: true,
            hasUIVisionBeta: true,
            onToggle: vi.fn(),
        })
        vi.mocked(useFlag).mockImplementation((key: string) => {
            if (key === FeatureFlagKey.UIVisionMilestone1) return true
            return false
        })
        vi.mocked(useIsMobileResolution).mockReturnValue(false)
        vi.mocked(useParams).mockReturnValue({ ticketId: '123' })

        const { result } = renderHook(() => useHelpdeskV2MS1Flag())

        expect(result.current).toBe(true)
    })

    it('should return false when UIVisionBetaBaseline is disabled', () => {
        vi.mocked(useHelpdeskV2BaselineFlag).mockReturnValue({
            hasUIVisionBetaBaselineFlag: false,
            hasUIVisionBeta: false,
            onToggle: vi.fn(),
        })
        vi.mocked(useFlag).mockImplementation((key: string) => {
            if (key === FeatureFlagKey.UIVisionMilestone1) return true
            return false
        })
        vi.mocked(useIsMobileResolution).mockReturnValue(false)
        vi.mocked(useParams).mockReturnValue({ ticketId: '123' })

        const { result } = renderHook(() => useHelpdeskV2MS1Flag())

        expect(result.current).toBe(false)
    })

    it('should return false when UIVisionMilestone1 is disabled', () => {
        vi.mocked(useHelpdeskV2BaselineFlag).mockReturnValue({
            hasUIVisionBetaBaselineFlag: true,
            hasUIVisionBeta: true,
            onToggle: vi.fn(),
        })
        vi.mocked(useFlag).mockImplementation((key: string) => {
            if (key === FeatureFlagKey.UIVisionMilestone1) return false
            return false
        })
        vi.mocked(useIsMobileResolution).mockReturnValue(false)
        vi.mocked(useParams).mockReturnValue({ ticketId: '123' })

        const { result } = renderHook(() => useHelpdeskV2MS1Flag())

        expect(result.current).toBe(false)
    })

    it('should return false when on mobile resolution', () => {
        vi.mocked(useHelpdeskV2BaselineFlag).mockReturnValue({
            hasUIVisionBetaBaselineFlag: true,
            hasUIVisionBeta: true,
            onToggle: vi.fn(),
        })
        vi.mocked(useFlag).mockImplementation((key: string) => {
            if (key === FeatureFlagKey.UIVisionMilestone1) return true
            return false
        })
        vi.mocked(useIsMobileResolution).mockReturnValue(true)
        vi.mocked(useParams).mockReturnValue({ ticketId: '123' })

        const { result } = renderHook(() => useHelpdeskV2MS1Flag())

        expect(result.current).toBe(false)
    })

    it('should return false when ticketId is "new"', () => {
        vi.mocked(useHelpdeskV2BaselineFlag).mockReturnValue({
            hasUIVisionBetaBaselineFlag: true,
            hasUIVisionBeta: true,
            onToggle: vi.fn(),
        })
        vi.mocked(useFlag).mockImplementation((key: string) => {
            if (key === FeatureFlagKey.UIVisionMilestone1) return true
            return false
        })
        vi.mocked(useIsMobileResolution).mockReturnValue(false)
        vi.mocked(useParams).mockReturnValue({ ticketId: 'new' })

        const { result } = renderHook(() => useHelpdeskV2MS1Flag())

        expect(result.current).toBe(false)
    })

    it('should return true when ticketId is undefined', () => {
        vi.mocked(useHelpdeskV2BaselineFlag).mockReturnValue({
            hasUIVisionBetaBaselineFlag: true,
            hasUIVisionBeta: true,
            onToggle: vi.fn(),
        })
        vi.mocked(useFlag).mockImplementation((key: string) => {
            if (key === FeatureFlagKey.UIVisionMilestone1) return true
            return false
        })
        vi.mocked(useIsMobileResolution).mockReturnValue(false)
        vi.mocked(useParams).mockReturnValue({})

        const { result } = renderHook(() => useHelpdeskV2MS1Flag())

        expect(result.current).toBe(true)
    })

    it('should return false when all conditions are not met', () => {
        vi.mocked(useHelpdeskV2BaselineFlag).mockReturnValue({
            hasUIVisionBetaBaselineFlag: false,
            hasUIVisionBeta: false,
            onToggle: vi.fn(),
        })
        vi.mocked(useFlag).mockImplementation((key: string) => {
            if (key === FeatureFlagKey.UIVisionMilestone1) return false
            return false
        })
        vi.mocked(useIsMobileResolution).mockReturnValue(true)
        vi.mocked(useParams).mockReturnValue({ ticketId: 'new' })

        const { result } = renderHook(() => useHelpdeskV2MS1Flag())

        expect(result.current).toBe(false)
    })
})
