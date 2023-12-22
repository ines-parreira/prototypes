import {renderHook} from '@testing-library/react-hooks'

import moment from 'moment'
import {
    CUTOFF_DATETIME,
    useIsHiddenByLegacyFlag,
} from 'pages/integrations/integration/components/gorgias_chat/GorgiasChatIntegrationCampaigns/hooks/useIsHiddenByLegacyFlag'
import * as useLocalStorageImports from 'hooks/useLocalStorage'

const useLocalStorageSpy = jest.spyOn(
    useLocalStorageImports,
    'default'
) as jest.Mock

const DT_BEFORE_CUTOFF = moment(CUTOFF_DATETIME).subtract(1, 'day')
const DT_AFTER_CUTOFF = moment(CUTOFF_DATETIME).add(1, 'day')

describe('useIsHiddenByLegacyFlag', () => {
    it('should return false if isHiddenLegacy is false', () => {
        useLocalStorageSpy.mockReturnValue([false])
        const integration = {get: jest.fn(() => DT_BEFORE_CUTOFF)}

        const {result} = renderHook(() =>
            useIsHiddenByLegacyFlag(integration as any)
        )
        expect(result.current).toBe(false)
    })

    it('should return false if integrationCreatedDate is after CUTOFF_DATETIME', () => {
        useLocalStorageSpy.mockReturnValue([true])
        const integration = {
            get: jest.fn(() => DT_AFTER_CUTOFF),
        }

        const {result} = renderHook(() =>
            useIsHiddenByLegacyFlag(integration as any)
        )
        expect(result.current).toBe(false)
    })

    it('should return true if isHiddenLegacy is true and integrationCreatedDate is before CUTOFF_DATETIME', () => {
        useLocalStorageSpy.mockReturnValue([true])
        const integration = {
            get: jest.fn(() => DT_BEFORE_CUTOFF),
        }

        const {result} = renderHook(() =>
            useIsHiddenByLegacyFlag(integration as any)
        )
        expect(result.current).toBe(true)
    })
})
