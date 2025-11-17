import {
    closeSidePanel,
    getSidePanelActiveTab,
    getSidePanelIsOpen,
    getSidePanelProduct,
    initialState,
    setSidePanelActiveTab,
    setSidePanelData,
    sidePanelSlice,
    SidePanelTab,
} from 'domains/reporting/state/ui/stats/sidePanelSlice'
import type { RootState } from 'state/types'

describe('sidePanelSlice', () => {
    it('should set the side panel data', () => {
        const product = { id: '123', name: 'some name', thumbnail_url: '' }

        const state = sidePanelSlice.reducer(
            initialState,
            setSidePanelData(product),
        )

        expect(state.product).toEqual(product)
    })

    it('should close the side panel', () => {
        const state = sidePanelSlice.reducer(initialState, closeSidePanel())

        expect(state.product).toEqual(null)
    })

    it('should set the side panel active tab', () => {
        const state = sidePanelSlice.reducer(
            initialState,
            setSidePanelActiveTab(SidePanelTab.TrendOverview),
        )

        expect(state.activeTab).toEqual(SidePanelTab.TrendOverview)
    })

    describe('selectors', () => {
        const product = { id: '123', name: 'some name', thumbnail_url: '' }

        it('should get the side panel is open state', () => {
            const state = {
                ui: {
                    stats: { sidePanel: { ...initialState, product } },
                },
            } as RootState

            expect(getSidePanelIsOpen(state)).toBe(true)
        })

        it('should get the side panel is closed state', () => {
            const state = {
                ui: {
                    stats: { sidePanel: { ...initialState, product: null } },
                },
            } as RootState

            expect(getSidePanelIsOpen(state)).toBe(false)
        })

        it('should get the side panel active tab', () => {
            const state = {
                ui: {
                    stats: {
                        sidePanel: {
                            ...initialState,
                            activeTab: SidePanelTab.TrendOverview,
                        },
                    },
                },
            } as RootState

            expect(getSidePanelActiveTab(state)).toBe(
                SidePanelTab.TrendOverview,
            )
        })

        it('should get the side panel productId', () => {
            const state = {
                ui: {
                    stats: {
                        sidePanel: {
                            ...initialState,
                            product,
                        },
                    },
                },
            } as RootState

            expect(getSidePanelProduct(state)).toBe(product)
        })
    })
})
