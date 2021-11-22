import {createReducer} from '@reduxjs/toolkit'

import {SelfServiceConfigurationsState} from './types'
import {setLoading} from './actions'

const initialState: SelfServiceConfigurationsState = {
    loading: false,
}

const SelfServiceConfigurationsReducer =
    createReducer<SelfServiceConfigurationsState>(initialState, (builder) =>
        builder.addCase(setLoading, (state, {payload}) => {
            state.loading = payload
        })
    )

export default SelfServiceConfigurationsReducer
