//@flow
import type {ActionCreatedBy} from '@reduxjs/toolkit'

import type {Section} from '../../../models/section/types.js'

import {
    sectionCreated,
    sectionDeleted,
    sectionUpdated,
    sectionsFetched,
} from './actions.ts'

export type SectionsState = {
    [string]: Section,
}

export type SectionsAction =
    | SectionCreatedAction
    | SectionDeletedAction
    | SectionUpdatedAction
    | SectionsFetchedAction

export type SectionCreatedAction = ActionCreatedBy<typeof sectionCreated>

export type SectionDeletedAction = ActionCreatedBy<typeof sectionDeleted>

export type SectionUpdatedAction = ActionCreatedBy<typeof sectionUpdated>

export type SectionsFetchedAction = ActionCreatedBy<typeof sectionsFetched>
