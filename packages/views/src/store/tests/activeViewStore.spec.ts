import {
    activeViewStore,
    clearActiveViewId,
    setActiveViewId,
} from '../activeViewStore'

const { mockSetItem, mockRemoveItem } = vi.hoisted(() => ({
    mockSetItem: vi.fn().mockResolvedValue(undefined),
    mockRemoveItem: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@repo/browser-storage', () => ({
    localForageManager: {
        getTable: vi.fn(() => ({
            getItem: vi.fn().mockResolvedValue(null),
            setItem: mockSetItem,
            removeItem: mockRemoveItem,
        })),
    },
}))

beforeEach(() => {
    clearActiveViewId()
    vi.clearAllMocks()
})

describe('activeViewStore', () => {
    it('initializes with null activeViewId', () => {
        expect(activeViewStore.getState().activeViewId).toBeNull()
    })

    it('persists activeViewId to storage on set', () => {
        setActiveViewId(42)

        expect(mockSetItem).toHaveBeenCalledWith(
            'active-view',
            expect.stringContaining('"activeViewId":42'),
        )
    })

    it('persists null to storage on clear', () => {
        setActiveViewId(42)
        vi.clearAllMocks()

        clearActiveViewId()

        expect(mockSetItem).toHaveBeenCalledWith(
            'active-view',
            expect.stringContaining('"activeViewId":null'),
        )
    })
})
