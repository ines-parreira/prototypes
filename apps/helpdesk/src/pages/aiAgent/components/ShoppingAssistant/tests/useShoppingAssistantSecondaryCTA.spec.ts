import { renderHook } from '@testing-library/react'

import { getUseShoppingAssistantTrialFlowFixture } from 'pages/aiAgent/fixtures/useShoppingAssistantTrialFlow.fixtures'
import { createMockTrialAccess } from 'pages/aiAgent/trial/hooks/fixtures'
import { EXTERNAL_URLS } from 'pages/aiAgent/trial/hooks/useTrialModalProps'

import { useSecondaryCTA } from '../hooks/useSecondaryCTA'
import {
    PromoCardVariant,
    TrialEventType,
    TrialType,
} from '../types/ShoppingAssistant'
import { logInTrialEvent, logTrialBannerEvent } from '../utils/eventLogger'

jest.mock('../utils/eventLogger', () => ({
    logTrialBannerEvent: jest.fn(),
    logInTrialEvent: jest.fn(),
}))

const mockLogTrialBannerEvent = logTrialBannerEvent as jest.Mock
const mockLogInTrialEvent = logInTrialEvent as jest.Mock

beforeEach(() => {
    jest.clearAllMocks()
})

const createMockTrialFlow = (overrides = {}) =>
    getUseShoppingAssistantTrialFlowFixture(overrides)

describe('useShoppingAssistantSecondaryCTA', () => {
    it('returns "Manage Trial" button for AdminTrialProgress variant when not opted out', () => {
        const trialAccess = createMockTrialAccess({
            hasCurrentStoreTrialOptedOut: false,
            hasAnyTrialOptedOut: false,
        })
        const trialFlow = createMockTrialFlow()

        const { result } = renderHook(() =>
            useSecondaryCTA(
                PromoCardVariant.AdminTrialProgress,
                trialAccess,
                trialFlow,
            ),
        )

        expect(result.current).toEqual({
            label: 'Manage Trial',
            onClick: expect.any(Function),
            disabled: false,
        })

        result.current?.onClick?.()
        expect(mockLogInTrialEvent).toHaveBeenCalledWith(
            TrialEventType.ManageTrial,
            TrialType.ShoppingAssistant,
        )
        expect(trialFlow.openManageTrialModal).toHaveBeenCalled()
    })

    it('returns undefined for AdminTrialProgress variant when opted out', () => {
        const trialAccess = createMockTrialAccess({
            hasCurrentStoreTrialOptedOut: true,
            hasAnyTrialOptedOut: false,
        })
        const trialFlow = createMockTrialFlow()

        const { result } = renderHook(() =>
            useSecondaryCTA(
                PromoCardVariant.AdminTrialProgress,
                trialAccess,
                trialFlow,
            ),
        )

        expect(result.current).toBeUndefined()
    })

    it('returns undefined for LeadTrialProgress variant', () => {
        const trialAccess = createMockTrialAccess({
            hasCurrentStoreTrialOptedOut: false,
            hasAnyTrialOptedOut: false,
        })
        const trialFlow = createMockTrialFlow()

        const { result } = renderHook(() =>
            useSecondaryCTA(
                PromoCardVariant.LeadTrialProgress,
                trialAccess,
                trialFlow,
            ),
        )

        expect(result.current).toBeUndefined()
    })

    it('returns "Book a demo" button when user can notify admin and book demo', () => {
        const trialAccess = createMockTrialAccess({
            canNotifyAdmin: true,
            canBookDemo: true,
        })
        const trialFlow = createMockTrialFlow()

        const { result } = renderHook(() =>
            useSecondaryCTA(
                PromoCardVariant.AdminTrial,
                trialAccess,
                trialFlow,
            ),
        )

        expect(result.current).toEqual({
            label: 'Book a demo',
            href: EXTERNAL_URLS.SHOPPING_ASSISTANT_TRIAL_BOOK_DEMO,
            target: '_blank',
            onClick: expect.any(Function),
            disabled: false,
        })

        result.current?.onClick?.()
        expect(mockLogTrialBannerEvent).toHaveBeenCalledWith(
            TrialEventType.Demo,
            TrialType.ShoppingAssistant,
        )
    })

    it('returns "Learn more" button as default', () => {
        const trialAccess = createMockTrialAccess({
            canNotifyAdmin: false,
            canBookDemo: false,
        })
        const trialFlow = createMockTrialFlow()

        const { result } = renderHook(() =>
            useSecondaryCTA(PromoCardVariant.AdminDemo, trialAccess, trialFlow),
        )

        expect(result.current).toEqual({
            label: 'Learn more',
            href: EXTERNAL_URLS.SHOPPING_ASSISTANT_TRIAL_LEARN_MORE,
            target: '_blank',
            onClick: expect.any(Function),
            disabled: false,
        })

        result.current?.onClick?.()
        expect(mockLogTrialBannerEvent).toHaveBeenCalledWith(
            TrialEventType.Learn,
            TrialType.ShoppingAssistant,
        )
    })
})
