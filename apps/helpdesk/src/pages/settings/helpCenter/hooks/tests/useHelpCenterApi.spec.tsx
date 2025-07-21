import { waitFor } from '@testing-library/react'

import * as auth from 'rest_api/auth'
import { renderHook } from 'utils/testing/renderHook'

import {
    HelpCenterApiClientProvider,
    useAbilityChecker,
    useHelpCenterApi,
} from '../useHelpCenterApi'

const TOKEN_EXAMPLE =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiYWNjb3VudF9pZCI6MSwicm9sZSI6eyJuYW1lIjoiYWRtaW4ifSwicnVsZXMiOlt7ImFjdGlvbiI6Im1hbmFnZSIsInN1YmplY3QiOiJhbGwifV0sImlhdCI6MTc0OTU1MTUxMiwiZXhwIjoxNzQ5NTUzMzEyfQ.0DBS0ttuHQARRmOnT9arVW34EMw36GMcTXwj-43KSQo'

describe('HelpCenterApiClientProvider', () => {
    it('should render useHelpCenterApi', async () => {
        jest.spyOn(auth, 'getAccessToken').mockResolvedValue(TOKEN_EXAMPLE)

        const { result } = renderHook(() => useHelpCenterApi(), {
            wrapper: HelpCenterApiClientProvider,
        })
        await waitFor(() => {
            expect(result.current.isReady).toBe(true)
        })
        expect(result.current.client).toBeDefined()
    })

    it('should render useAbilityChecker', async () => {
        jest.spyOn(auth, 'getAccessToken').mockResolvedValue(TOKEN_EXAMPLE)

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
