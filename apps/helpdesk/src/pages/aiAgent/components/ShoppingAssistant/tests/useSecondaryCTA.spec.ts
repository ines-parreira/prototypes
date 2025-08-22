import { renderHook } from '@testing-library/react'

import { getUseShoppingAssistantTrialFlowFixture } from 'pages/aiAgent/fixtures/useShoppingAssistantTrialFlow.fixtures'
import { createMockTrialAccess } from 'pages/aiAgent/trial/hooks/fixtures'
import { EXTERNAL_URLS } from 'pages/aiAgent/trial/hooks/useTrialModalProps'

import { useSecondaryCTA } from '../hooks/useSecondaryCTA'
import {
    PromoCardVariant,
    ShoppingAssistantEventType,
} from '../types/ShoppingAssistant'
import {
    logShoppingAssistantEvent,
    logShoppingAssistantInTrialEvent,
} from '../utils/eventLogger'

jest.mock('../utils/eventLogger', () => ({
    logShoppingAssistantEvent: jest.fn(),
    logShoppingAssistantInTrialEvent: jest.fn(),
}))

const mockLogShoppingAssistantEvent = logShoppingAssistantEvent as jest.Mock
const mockLogShoppingAssistantInTrialEvent =
    logShoppingAssistantInTrialEvent as jest.Mock

beforeEach(() => {
    jest.clearAllMocks()
})

const createMockTrialFlow = (overrides = {}) =>
    getUseShoppingAssistantTrialFlowFixture(overrides)

describe('useSecondaryCTA', () => {
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
        expect(mockLogShoppingAssistantInTrialEvent).toHaveBeenCalledWith(
            ShoppingAssistantEventType.ManageTrial,
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
        expect(mockLogShoppingAssistantEvent).toHaveBeenCalledWith(
            ShoppingAssistantEventType.Demo,
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
        expect(mockLogShoppingAssistantEvent).toHaveBeenCalledWith(
            ShoppingAssistantEventType.Learn,
        )
    })
})
