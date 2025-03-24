import { act } from '@testing-library/react'
import { renderHook } from '@testing-library/react-hooks'
import { createMemoryHistory } from 'history'
import { Route, Router } from 'react-router-dom'

import { FocusActivationModal } from '../../utils'
import { useActivationModalDisclosure } from '../useActivationModalDisclosure'

const renderHookWithRouter = (initialEntry = '/') => {
    const history = createMemoryHistory({ initialEntries: [initialEntry] })
    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <Router history={history}>
            <Route path="/:shopName?">{children}</Route>
        </Router>
    )

    return {
        ...renderHook(() => useActivationModalDisclosure(), { wrapper }),
        history,
    }
}

describe('useActivationModalDisclosure', () => {
    it('should initialize with modal hidden when no search param is present', () => {
        const { result } = renderHookWithRouter()

        expect(result.current.isModalVisible).toBe(false)
    })

    it('should initialize with modal visible when search param is present', () => {
        const { result } = renderHookWithRouter(
            `/?${FocusActivationModal.searchParam}=true`,
        )

        expect(result.current.isModalVisible).toBe(true)
    })

    it('should show modal when search param is added to URL', async () => {
        const { result, history, waitForNextUpdate } = renderHookWithRouter()

        expect(result.current.isModalVisible).toBe(false)

        act(() => {
            history.push(`/?${FocusActivationModal.searchParam}=true`)
        })

        await waitForNextUpdate()

        expect(result.current.isModalVisible).toBe(true)
    })

    it('should close modal and remove search param when closeModal is called', () => {
        const { result, history } = renderHookWithRouter(
            `/?${FocusActivationModal.searchParam}=true&otherParam=value`,
        )

        expect(result.current.isModalVisible).toBe(true)

        act(() => {
            result.current.closeModal()
        })

        expect(result.current.isModalVisible).toBe(false)
        expect(history.location.search).toBe('?otherParam=value')
    })

    it('should allow manually setting modal visibility', () => {
        const { result } = renderHookWithRouter()

        expect(result.current.isModalVisible).toBe(false)

        act(() => {
            result.current.setIsModalVisible(true)
        })

        expect(result.current.isModalVisible).toBe(true)

        act(() => {
            result.current.setIsModalVisible(false)
        })

        expect(result.current.isModalVisible).toBe(false)
    })

    describe('shopName extraction', () => {
        const searchParamStoreName = 'store-from-search'
        const routeParamStoreName = 'store-from-route'

        it('should extract store name from search param over route param', () => {
            const { result } = renderHookWithRouter(
                `/?${FocusActivationModal.searchParam}=${searchParamStoreName}&otherParam=value`,
            )

            expect(result.current.shopName).toBe(searchParamStoreName)
        })

        it('should fallback to route param when search param is not present', () => {
            const { result } = renderHookWithRouter(`/${routeParamStoreName}`)

            expect(result.current.shopName).toBe(routeParamStoreName)
        })

        it('should return undefined when no search param or route param is present', () => {
            const { result } = renderHookWithRouter()

            expect(result.current.shopName).toBe(undefined)
        })

        it('should return undefined when search param is "true"', () => {
            const { result } = renderHookWithRouter(
                `/?${FocusActivationModal.searchParam}=true`,
            )

            expect(result.current.shopName).toBe(undefined)
        })
    })
})
