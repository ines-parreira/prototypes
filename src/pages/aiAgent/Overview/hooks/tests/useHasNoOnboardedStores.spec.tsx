import { renderHook } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'

import { account } from 'fixtures/account'
import { useStoreConfigurationForAccount } from 'pages/aiAgent/hooks/useStoreConfigurationForAccount'
import { RootState } from 'state/types'
import { mockStore } from 'utils/testing'

import { useHasNoOnboardedStores } from '../useHasNoOnboardedStores'

jest.mock('pages/aiAgent/hooks/useStoreConfigurationForAccount')
const mockUseStoreConfigurationForAccount = jest.mocked(
    useStoreConfigurationForAccount,
)
const defaultState = {
    currentAccount: fromJS(account),
} as RootState

const renderUseHasNoOnboardedStores = () => {
    return renderHook(() => useHasNoOnboardedStores(), {
        wrapper: ({ children }) => (
            <Provider store={mockStore(defaultState)}>{children}</Provider>
        ),
    })
}

describe('useHasNoOnboardedStores', () => {
    it('should return true if storeConfigurations is empty and not loading', () => {
        mockUseStoreConfigurationForAccount.mockReturnValue({
            storeConfigurations: [],
            isLoading: false,
        })

        const { result } = renderUseHasNoOnboardedStores()

        expect(result.current).toBe(true)
    })

    it('should return true if storeConfigurations is undefined and not loading', () => {
        mockUseStoreConfigurationForAccount.mockReturnValue({
            storeConfigurations: undefined,
            isLoading: false,
        })

        const { result } = renderUseHasNoOnboardedStores()

        expect(result.current).toBe(true)
    })

    it('should return false if storeConfigurations is empty and loading', () => {
        mockUseStoreConfigurationForAccount.mockReturnValue({
            storeConfigurations: [],
            isLoading: true,
        })

        const { result } = renderUseHasNoOnboardedStores()

        expect(result.current).toBe(false)
    })

    it('should return false if storeConfigurations is undefined and loading', () => {
        mockUseStoreConfigurationForAccount.mockReturnValue({
            storeConfigurations: undefined,
            isLoading: true,
        })

        const { result } = renderUseHasNoOnboardedStores()

        expect(result.current).toBe(false)
    })

    it('should return false if storeConfigurations is not empty and not loading', () => {
        mockUseStoreConfigurationForAccount.mockReturnValue({
            storeConfigurations: [{ storeName: 'Test Store' } as any],
            isLoading: false,
        })

        const { result } = renderUseHasNoOnboardedStores()

        expect(result.current).toBe(false)
    })
})
