import {createAction} from '@reduxjs/toolkit'

import {Section} from '../../../models/section/types'

import {
    SECTIONS_FETCHED,
    SECTION_CREATED,
    SECTION_DELETED,
    SECTION_UPDATED,
} from './constants'

export const sectionsFetched = createAction<Section[]>(SECTIONS_FETCHED)

export const sectionCreated = createAction<Section>(SECTION_CREATED)

export const sectionUpdated = createAction<Section>(SECTION_UPDATED)

export const sectionDeleted = createAction<number>(SECTION_DELETED)
