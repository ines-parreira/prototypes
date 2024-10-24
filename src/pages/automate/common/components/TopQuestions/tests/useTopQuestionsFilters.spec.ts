import {waitFor} from '@testing-library/react'
import {renderHook} from '@testing-library/react-hooks'

import {HelpCenter} from 'models/helpCenter/types'
import {ShopifyIntegration} from 'models/integration/types'
import {NonEmptyArray} from 'types'
import {assumeMock} from 'utils/testing'

import {useFirstStoreAndHelpCenterWithTopQuestions} from '../useFirstStoreAndHelpCenterWithTopQuestions'
import {useTopQuestionsFilters} from '../useTopQuestionsFilters'
import {
    StoreWithHelpCenters,
    useTopQuestionsStoresWithHelpCenters,
} from '../useTopQuestionsStoresWithHelpCenters'

const storesWithHelpCentersFixture: StoreWithHelpCenters[] = [
    {
        store: {id: 1, name: 'Store 1'} as ShopifyIntegration,
        helpCenters: [
            {id: 11, name: 'Help Center 11'},
            {id: 12, name: 'Help Center 12'},
        ] as unknown as NonEmptyArray<HelpCenter>,
    },
    {
        store: {id: 2, name: 'Store 2'} as ShopifyIntegration,
        helpCenters: [
            {id: 21, name: 'Help Center 21'},
            {id: 22, name: 'Help Center 22'},
            {id: 23, name: 'Help Center 23'},
        ] as unknown as NonEmptyArray<HelpCenter>,
    },
    {
        store: {id: 3, name: 'Store 3'} as ShopifyIntegration,
        helpCenters: [
            {id: 31, name: 'Help Center 31'},
            {id: 32, name: 'Help Center 32'},
        ] as unknown as NonEmptyArray<HelpCenter>,
    },
]

jest.mock('../useTopQuestionsStoresWithHelpCenters')
const mockUseTopQuestionsStoresWithHelpCenters = assumeMock(
    useTopQuestionsStoresWithHelpCenters
)

jest.mock('../useFirstStoreAndHelpCenterWithTopQuestions')
const mockUseFirstStoreAndHelpCenterWithTopQuestions = assumeMock(
    useFirstStoreAndHelpCenterWithTopQuestions
)

describe('useTopQuestionsFilters', () => {
    beforeEach(() => {
        jest.resetAllMocks()
        mockUseTopQuestionsStoresWithHelpCenters.mockReturnValue({
            isLoading: false,
            storesWithHelpCenters: storesWithHelpCentersFixture,
        })
        mockUseFirstStoreAndHelpCenterWithTopQuestions.mockReturnValue({
            isLoading: false,
            firstMatchingStoreAndHelpCenter: undefined,
        })
    })
    it('handles loading state correctly', () => {
        mockUseTopQuestionsStoresWithHelpCenters.mockReturnValue({
            isLoading: true,
            storesWithHelpCenters: [],
        })

        const {result} = renderHook(() => useTopQuestionsFilters({}))

        expect(result.current.isLoading).toBe(true)
        expect(result.current.selectedStore).toBeUndefined()
        expect(result.current.selectedHelpCenter).toBeUndefined()
    })

    it('returns loading if useFirstStoreAndHelpCenterWithTopQuestions is loading', () => {
        mockUseFirstStoreAndHelpCenterWithTopQuestions.mockReturnValue({
            isLoading: true,
            firstMatchingStoreAndHelpCenter: undefined,
        })

        const {result} = renderHook(() => useTopQuestionsFilters({}))

        expect(result.current.isLoading).toBe(true)
        expect(result.current.selectedStore).toBeUndefined()
        expect(result.current.selectedHelpCenter).toBeUndefined()
    })

    it('returns the default selected store and help center when not loading', () => {
        const {result} = renderHook(() => useTopQuestionsFilters({}))

        expect(result.current.isLoading).toBe(false)
        expect(result.current.selectedStore).toEqual(
            storesWithHelpCentersFixture[0].store
        )
        expect(result.current.selectedHelpCenter).toEqual(
            storesWithHelpCentersFixture[0].helpCenters[0]
        )
    })

    it('updates the selected store and help center based on initial values', () => {
        const {result} = renderHook(() =>
            useTopQuestionsFilters({initialStoreId: 2, initialHelpCenterId: 23})
        )

        expect(result.current.selectedStore).toEqual(
            storesWithHelpCentersFixture[1].store
        )
        expect(result.current.selectedHelpCenter).toEqual(
            storesWithHelpCentersFixture[1].helpCenters[2]
        )
    })

    it('updates the selected store and help center when only initialStoreId', () => {
        const {result} = renderHook(() =>
            useTopQuestionsFilters({initialStoreId: 3})
        )

        expect(result.current.selectedStore).toEqual(
            storesWithHelpCentersFixture[2].store
        )
        expect(result.current.selectedHelpCenter).toEqual(
            storesWithHelpCentersFixture[2].helpCenters[0]
        )
    })

    it('returns undefined store and help-center when there is no available store', () => {
        mockUseTopQuestionsStoresWithHelpCenters.mockReturnValue({
            isLoading: false,
            storesWithHelpCenters: [],
        })

        const {result} = renderHook(() =>
            useTopQuestionsFilters({initialStoreId: 3})
        )

        expect(result.current.selectedStore).toBeUndefined()
        expect(result.current.selectedHelpCenter).toBeUndefined()
    })

    it('updates the selected store and help center when only initialHelpCenterId', () => {
        const {result} = renderHook(() =>
            useTopQuestionsFilters({initialHelpCenterId: 32})
        )

        expect(result.current.selectedStore).toEqual(
            storesWithHelpCentersFixture[2].store
        )
        expect(result.current.selectedHelpCenter).toEqual(
            storesWithHelpCentersFixture[2].helpCenters[1]
        )
    })

    it('updates the selected values when initialHelpCenterId value is not a valid value', () => {
        const {result} = renderHook(() =>
            useTopQuestionsFilters({initialStoreId: 2, initialHelpCenterId: 40})
        )

        expect(result.current.selectedStore).toEqual(
            storesWithHelpCentersFixture[1].store
        )
        expect(result.current.selectedHelpCenter).toEqual(
            storesWithHelpCentersFixture[1].helpCenters[0]
        )
    })

    it('updates the selected values when initialStoreId value is not a valid value', () => {
        const {result} = renderHook(() =>
            useTopQuestionsFilters({initialStoreId: 7, initialHelpCenterId: 22})
        )

        expect(result.current.selectedStore).toEqual(
            storesWithHelpCentersFixture[1].store
        )
        expect(result.current.selectedHelpCenter).toEqual(
            storesWithHelpCentersFixture[1].helpCenters[1]
        )
    })

    it('selects first available help-center if the selected store changes', async () => {
        const {result} = renderHook(() => useTopQuestionsFilters({}))

        expect(result.current.selectedStore).toEqual(
            storesWithHelpCentersFixture[0].store
        )
        expect(result.current.selectedHelpCenter).toEqual(
            storesWithHelpCentersFixture[0].helpCenters[0]
        )

        result.current.storeFilter?.setSelectedStoreIntegrationId(2)

        expect(result.current.selectedStore).toEqual(
            storesWithHelpCentersFixture[1].store
        )

        await waitFor(() =>
            expect(result.current.selectedHelpCenter).toEqual(
                storesWithHelpCentersFixture[1].helpCenters[0]
            )
        )
    })

    it('uses the first store and help-center with top questions when available', async () => {
        mockUseFirstStoreAndHelpCenterWithTopQuestions.mockReturnValue({
            isLoading: false,
            firstMatchingStoreAndHelpCenter: {
                firstMatchingStore: storesWithHelpCentersFixture[1].store,
                firstMatchingHelpCenter:
                    storesWithHelpCentersFixture[1].helpCenters[1],
            },
        })

        const {result} = renderHook(() => useTopQuestionsFilters({}))

        await waitFor(() => {
            expect(result.current.selectedStore).toEqual(
                storesWithHelpCentersFixture[1].store
            )
            expect(result.current.selectedHelpCenter).toEqual(
                storesWithHelpCentersFixture[1].helpCenters[1]
            )
        })
    })
})
