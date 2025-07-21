import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { RootState } from 'state/types'

export enum SidePanelTab {
    Insights = 'Insights',
    TrendOverview = 'TrendOverview',
}

export type SidePanelProduct = {
    id: string
    name: string
    thumbnail_url?: string
}

export type SidePanelState = {
    product: SidePanelProduct | null
    activeTab: SidePanelTab
}

export const initialState: SidePanelState = {
    product: null,
    activeTab: SidePanelTab.Insights,
}

export const sidePanelSlice = createSlice({
    name: 'sidePanel',
    initialState,
    reducers: {
        setSidePanelData(state, action: PayloadAction<SidePanelProduct>) {
            state.product = action.payload
        },
        setSidePanelActiveTab(state, action: PayloadAction<SidePanelTab>) {
            state.activeTab = action.payload
        },
        closeSidePanel(state) {
            state.product = null
        },
    },
})

export const getSidePanelIsOpen = (state: RootState) =>
    state.ui.stats[sidePanelSlice.name].product !== null

export const getSidePanelActiveTab = (state: RootState) =>
    state.ui.stats[sidePanelSlice.name].activeTab

export const getSidePanelProduct = (state: RootState) =>
    state.ui.stats[sidePanelSlice.name].product

export const { setSidePanelData, closeSidePanel, setSidePanelActiveTab } =
    sidePanelSlice.actions
