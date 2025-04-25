import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import isEmpty from 'lodash/isEmpty'

import { RootState } from 'state/types'

export enum SidePanelTab {
    insights = 'insights',
    trendOverview = 'trendOverview',
}

export type SidePanelState = {
    productId: string | null
    activeTab: SidePanelTab
}

export const initialState: SidePanelState = {
    productId: null,
    activeTab: SidePanelTab.insights,
}

export const sidePanelSlice = createSlice({
    name: 'sidePanel',
    initialState,
    reducers: {
        setSidePanelData(state, action: PayloadAction<string>) {
            state.productId = action.payload
        },
        setSidePanelActiveTab(state, action: PayloadAction<SidePanelTab>) {
            state.activeTab = action.payload
        },
        closeSidePanel(state) {
            state.productId = null
        },
    },
})

export const getSidePanelIsOpen = (state: RootState) =>
    !isEmpty(state.ui.stats[sidePanelSlice.name].productId)

export const getSidePanelActiveTab = (state: RootState) =>
    state.ui.stats[sidePanelSlice.name].activeTab

export const { setSidePanelData, closeSidePanel, setSidePanelActiveTab } =
    sidePanelSlice.actions
