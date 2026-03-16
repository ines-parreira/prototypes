import type { ReactNode } from 'react'
import React from 'react'

import { renderHook } from '@repo/testing'
import { waitFor } from '@testing-library/react'
import axios from 'axios'

import { createAbility } from 'rest_api/help_center_api/ability'

import {
    HelpCenterApiClientContext,
    HelpCenterApiClientProvider,
    useAbilityChecker,
    useHelpCenterApi,
} from '../useHelpCenterApi'

jest.mock('utils/gorgiasAppsAuth', () => {
    return {
        GorgiasAppAuthService: jest.fn().mockImplementation(() => ({
            accessToken: 'mock-token',
            getAccessToken: jest.fn().mockResolvedValue('Bearer mock-token'),
        })),
    }
})

beforeEach(() => {
    jest.spyOn(axios, 'get').mockResolvedValue({
        data: {
            rules: [{ action: 'manage', subject: 'all' }],
        },
    })
})

afterEach(() => {
    jest.restoreAllMocks()
})

describe('HelpCenterApiClientProvider', () => {
    it('should render useHelpCenterApi', async () => {
        const { result } = renderHook(() => useHelpCenterApi(), {
            wrapper: HelpCenterApiClientProvider,
        })
        await waitFor(() => {
            expect(result.current.isReady).toBe(true)
        })
        expect(result.current.client).toBeDefined()
    })

    it('should render useAbilityChecker with rules from the abilities endpoint', async () => {
        const { result } = renderHook(() => useAbilityChecker(), {
            wrapper: HelpCenterApiClientProvider,
        })
        await waitFor(() => {
            expect(
                result.current.isPassingRulesCheck((ab) =>
                    ab.can('manage', 'all'),
                ),
            ).toBe(true)
        })
    })
})

describe('useAbilityChecker', () => {
    function createWrapper(agentAbility?: ReturnType<typeof createAbility>) {
        return ({ children }: { children: ReactNode }) => (
            <HelpCenterApiClientContext.Provider
                value={{
                    isReady: true,
                    client: undefined,
                    agentAbility,
                }}
            >
                {children}
            </HelpCenterApiClientContext.Provider>
        )
    }

    it('should return null when agentAbility is undefined', () => {
        const { result } = renderHook(() => useAbilityChecker(), {
            wrapper: createWrapper(undefined),
        })

        expect(
            result.current.isPassingRulesCheck((ab) => ab.can('manage', 'all')),
        ).toBeNull()
    })

    it('should return true for permitted actions', () => {
        const ability = createAbility([{ action: 'manage', subject: 'all' }])
        const { result } = renderHook(() => useAbilityChecker(), {
            wrapper: createWrapper(ability),
        })

        expect(
            result.current.isPassingRulesCheck((ab) =>
                ab.can('update', 'HelpCenterEntity'),
            ),
        ).toBe(true)
    })

    it('should return false for unpermitted actions', () => {
        const ability = createAbility([{ action: 'read', subject: 'all' }])
        const { result } = renderHook(() => useAbilityChecker(), {
            wrapper: createWrapper(ability),
        })

        expect(
            result.current.isPassingRulesCheck((ab) =>
                ab.can('update', 'HelpCenterEntity'),
            ),
        ).toBe(false)
    })

    it('should respect subject-specific rules', () => {
        const ability = createAbility([
            { action: 'update', subject: 'ArticleEntity' },
        ])
        const { result } = renderHook(() => useAbilityChecker(), {
            wrapper: createWrapper(ability),
        })

        expect(
            result.current.isPassingRulesCheck((ab) =>
                ab.can('update', 'ArticleEntity'),
            ),
        ).toBe(true)
        expect(
            result.current.isPassingRulesCheck((ab) =>
                ab.can('update', 'CategoryEntity'),
            ),
        ).toBe(false)
    })

    it('should handle empty rules gracefully', () => {
        const ability = createAbility([])
        const { result } = renderHook(() => useAbilityChecker(), {
            wrapper: createWrapper(ability),
        })

        expect(
            result.current.isPassingRulesCheck((ab) => ab.can('manage', 'all')),
        ).toBe(false)
    })

    it('should handle read-only rules like a basic agent', () => {
        const ability = createAbility([{ action: 'read', subject: 'all' }])
        const { result } = renderHook(() => useAbilityChecker(), {
            wrapper: createWrapper(ability),
        })

        expect(
            result.current.isPassingRulesCheck((ab) =>
                ab.can('read', 'HelpCenterEntity'),
            ),
        ).toBe(true)
        expect(
            result.current.isPassingRulesCheck((ab) =>
                ab.can('create', 'HelpCenterEntity'),
            ),
        ).toBe(false)
        expect(
            result.current.isPassingRulesCheck((ab) =>
                ab.can('delete', 'ArticleEntity'),
            ),
        ).toBe(false)
    })
})
