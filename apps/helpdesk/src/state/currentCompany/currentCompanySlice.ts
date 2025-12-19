import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

import type { RootState } from 'state/types'

export enum CompanyTier {
    // NEW values
    Band1 = 'band_1', // SMB
    Band2 = 'band_2', // Commercial
    Band3 = 'band_3', // Enterprise
    Band4 = 'band_4', // Named Accounts
    // DEPRECATED values
    Tier1 = 'tier_1', // SMB 1
    Tier2 = 'tier_2', // SMB 2
    Tier3 = 'tier_3', // Commercial 1
    Tier4 = 'tier_4', // Commercial 2
    Tier5 = 'tier_5', // Enterprise 1
    Tier6 = 'tier_6', // Enterprise 2
}

export type CurrentCompanyState = {
    fixed_gmv_band?: CompanyTier | null
}

export const initialState: CurrentCompanyState = {}

export const currentCompanySlice = createSlice({
    name: 'currentCompany',
    initialState,
    reducers: {
        setCompanyGmvBand(state, action: PayloadAction<CompanyTier | null>) {
            state.fixed_gmv_band = action.payload
        },
        resetCompanyState() {
            return initialState
        },
    },
})

export const { setCompanyGmvBand, resetCompanyState } =
    currentCompanySlice.actions

export const getCurrentCompanyState = (state: RootState) =>
    state.currentCompany || {}

export const getCompanyFixedGmvBandTier = (
    state: RootState,
): CompanyTier | null => state.currentCompany?.fixed_gmv_band || null

export default currentCompanySlice.reducer
