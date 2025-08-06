import { renderHook } from '@testing-library/react'

import { EXTERNAL_URLS } from 'pages/aiAgent/trial/hooks/useTrialModalProps'

import { useSecondaryCTA } from '../hooks/useSecondaryCTA'
import {
    PromoCardVariant,
    ShoppingAssistantEventType,
} from '../types/ShoppingAssistant'
import { logShoppingAssistantEvent } from '../utils/eventLogger'

jest.mock('../utils/eventLogger', () => ({
    logShoppingAssistantEvent: jest.fn(),
}))

const mockLogShoppingAssistantEvent = logShoppingAssistantEvent as jest.Mock

beforeEach(() => {
    jest.clearAllMocks()
})

describe('useSecondaryCTA', () => {
    it('returns "Manage Trial" button for AdminTrialProgress variant when not opted out', () => {
        const trialAccess = {
            hasCurrentStoreTrialOptedOut: false,
            hasAnyTrialOptedOut: false,
        }

        const { result } = renderHook(() =>
            useSecondaryCTA(PromoCardVariant.AdminTrialProgress, trialAccess),
        )

        expect(result.current).toEqual({
            label: 'Manage Trial',
            onClick: expect.any(Function),
            disabled: false,
        })
    })

    it('returns undefined for AdminTrialProgress variant when opted out', () => {
        const trialAccess = {
            hasCurrentStoreTrialOptedOut: true,
            hasAnyTrialOptedOut: false,
        }

        const { result } = renderHook(() =>
            useSecondaryCTA(PromoCardVariant.AdminTrialProgress, trialAccess),
        )

        expect(result.current).toBeUndefined()
    })

    it('returns undefined for LeadTrialProgress variant', () => {
        const trialAccess = {
            hasCurrentStoreTrialOptedOut: false,
            hasAnyTrialOptedOut: false,
        }

        const { result } = renderHook(() =>
            useSecondaryCTA(PromoCardVariant.LeadTrialProgress, trialAccess),
        )

        expect(result.current).toBeUndefined()
    })

    it('returns "Book a demo" button when user can notify admin and book demo', () => {
        const trialAccess = {
            canNotifyAdmin: true,
            canBookDemo: true,
        }

        const { result } = renderHook(() =>
            useSecondaryCTA(PromoCardVariant.AdminTrial, trialAccess),
        )

        expect(result.current).toEqual({
            label: 'Book a demo',
            href: EXTERNAL_URLS.SHOPPING_ASSISTANT_TRIAL_BOOK_DEMO,
            onClick: expect.any(Function),
            disabled: false,
        })

        result.current?.onClick?.()
        expect(mockLogShoppingAssistantEvent).toHaveBeenCalledWith(
            ShoppingAssistantEventType.Demo,
        )
    })

    it('returns "Learn more" button as default', () => {
        const trialAccess = {
            canNotifyAdmin: false,
            canBookDemo: false,
        }

        const { result } = renderHook(() =>
            useSecondaryCTA(PromoCardVariant.AdminDemo, trialAccess),
        )

        expect(result.current).toEqual({
            label: 'Learn more',
            href: EXTERNAL_URLS.SHOPPING_ASSISTANT_TRIAL_LEARN_MORE,
            onClick: expect.any(Function),
            disabled: false,
        })

        result.current?.onClick?.()
        expect(mockLogShoppingAssistantEvent).toHaveBeenCalledWith(
            ShoppingAssistantEventType.Learn,
        )
    })
})
