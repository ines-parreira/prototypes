import {renderHook} from '@testing-library/react-hooks'

import {FeatureFlagKey} from 'config/featureFlags'
import {useFlag} from 'core/flags'
import useAppSelector from 'hooks/useAppSelector'

import {assumeMock} from 'utils/testing'

import {useAiAgentItemEnabled} from '../useAiAgentItemEnabled'

jest.mock('hooks/useAppSelector')
const useAppSelectorMock = assumeMock(useAppSelector)

jest.mock('core/flags')
const useFlagMock = assumeMock(useFlag)

describe('useAiAgentItemEnabled', () => {
    it.each([
        {
            aIAgentPreviewModeAllowed: true,
            hasAutomate: true,
        },
        {
            aIAgentPreviewModeAllowed: true,
            hasAutomate: false,
        },
        {
            aIAgentPreviewModeAllowed: false,
            hasAutomate: true,
        },
    ])(
        'returns true if ConvAiStandaloneMenu is true and one of hasAutomate or hasAiAgentPreview is true (aIAgentPreviewModeAllowed = $aIAgentPreviewModeAllowed, hasAutomate = $hasAutomate)',
        ({aIAgentPreviewModeAllowed, hasAutomate}) => {
            mockFlags({
                convAiStandaloneMenu: true,
                aIAgentPreviewModeAllowed,
                hasAutomate,
            })

            const {result} = renderHook(() => useAiAgentItemEnabled())

            expect(result.current).toBe(true)
        }
    )

    it.each([
        {
            aIAgentPreviewModeAllowed: true,
            hasAutomate: true,
        },
        {
            aIAgentPreviewModeAllowed: true,
            hasAutomate: false,
        },
        {
            aIAgentPreviewModeAllowed: false,
            hasAutomate: true,
        },
    ])(
        'returns false if ConvAiStandaloneMenu is false, regardless of other conditions (aIAgentPreviewModeAllowed = $aIAgentPreviewModeAllowed, hasAutomate = $hasAutomate)',
        ({aIAgentPreviewModeAllowed, hasAutomate}) => {
            mockFlags({
                convAiStandaloneMenu: false,
                aIAgentPreviewModeAllowed,
                hasAutomate,
            })

            const {result} = renderHook(() => useAiAgentItemEnabled())

            expect(result.current).toBe(false)
        }
    )

    it('returns false if both hasAutomate and hasAiAgentPreview are false, even if hasAiAgentStandaloneMenu is true', () => {
        mockFlags({
            convAiStandaloneMenu: true,
            aIAgentPreviewModeAllowed: false,
            hasAutomate: false,
        })

        const {result} = renderHook(() => useAiAgentItemEnabled())

        expect(result.current).toBe(false)
    })

    it('returns false if all conditions are false', () => {
        mockFlags({
            convAiStandaloneMenu: false,
            aIAgentPreviewModeAllowed: false,
            hasAutomate: false,
        })

        const {result} = renderHook(() => useAiAgentItemEnabled())

        expect(result.current).toBe(false)
    })
})

function mockFlags({
    convAiStandaloneMenu,
    aIAgentPreviewModeAllowed,
    hasAutomate,
}: {
    convAiStandaloneMenu: boolean
    aIAgentPreviewModeAllowed: boolean
    hasAutomate: boolean
}) {
    useFlagMock.mockImplementation((key: FeatureFlagKey) => {
        switch (key) {
            case FeatureFlagKey.ConvAiStandaloneMenu:
                return convAiStandaloneMenu
            case FeatureFlagKey.AIAgentPreviewModeAllowed:
                return aIAgentPreviewModeAllowed
            default:
                return false
        }
    })
    useAppSelectorMock.mockReturnValue(hasAutomate)
}
