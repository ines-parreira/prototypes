import { RootState } from 'state/types'
import {
    closeSidePanel,
    getSidePanelActiveTab,
    getSidePanelIsOpen,
    getSidePanelProductId,
    initialState,
    setSidePanelActiveTab,
    setSidePanelData,
    sidePanelSlice,
    SidePanelTab,
} from 'state/ui/stats/sidePanelSlice'

describe('sidePanelSlice', () => {
    it('should set the side panel data', () => {
        const state = sidePanelSlice.reducer(
            initialState,
            setSidePanelData('123'),
        )

        expect(state.productId).toEqual('123')
    })

    it('should close the side panel', () => {
        const state = sidePanelSlice.reducer(initialState, closeSidePanel())

        expect(state.productId).toEqual(null)
    })

    it('should set the side panel active tab', () => {
        const state = sidePanelSlice.reducer(
            initialState,
            setSidePanelActiveTab(SidePanelTab.trendOverview),
        )

        expect(state.activeTab).toEqual(SidePanelTab.trendOverview)
    })

    describe('selectors', () => {
        it('should get the side panel is open state', () => {
            const state = {
                ui: {
                    stats: { sidePanel: { ...initialState, productId: '123' } },
                },
            } as RootState

            expect(getSidePanelIsOpen(state)).toBe(true)
        })

        it('should get the side panel is closed state', () => {
            const state = {
                ui: {
                    stats: { sidePanel: { ...initialState, productId: null } },
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
                            activeTab: SidePanelTab.trendOverview,
                        },
                    },
                },
            } as RootState

            expect(getSidePanelActiveTab(state)).toBe(
                SidePanelTab.trendOverview,
            )
        })

        it('should get the side panel productId', () => {
            const productId = '123'
            const state = {
                ui: {
                    stats: {
                        sidePanel: {
                            ...initialState,
                            productId,
                        },
                    },
                },
            } as RootState

            expect(getSidePanelProductId(state)).toBe(productId)
        })
    })
})
