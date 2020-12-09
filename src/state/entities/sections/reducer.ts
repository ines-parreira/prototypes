import {createReducer} from '@reduxjs/toolkit'

import {
    sectionCreated,
    sectionDeleted,
    sectionUpdated,
    sectionsFetched,
} from './actions'
import {SectionsState} from './types'

const initialState: SectionsState = {}

const sectionsReducer = createReducer<SectionsState>(initialState, (builder) =>
    builder
        .addCase(sectionsFetched, (state, {payload}) => {
            payload.map((section) => {
                state[section.id.toString()] = section
            })
        })
        .addCase(sectionCreated, (state, {payload}) => {
            state[payload.id.toString()] = payload
        })
        .addCase(sectionDeleted, (state, {payload}) => {
            delete state[payload.toString()]
        })
        .addCase(sectionUpdated, (state, {payload}) => {
            state[payload.id.toString()] = payload
        })
)

export default sectionsReducer
