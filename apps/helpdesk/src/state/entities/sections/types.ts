import type { PayloadActionCreator } from '@reduxjs/toolkit'

import type { Section } from '../../../models/section/types'
import type {
    SECTION_CREATED,
    SECTION_DELETED,
    SECTION_UPDATED,
    SECTIONS_FETCHED,
} from './constants'

export type SectionsState = {
    [key: string]: Section
}

export type SectionsAction =
    | SectionsFetchedAction
    | SectionCreatedAction
    | SectionDeletedAction
    | SectionUpdatedAction

export type SectionsFetchedAction = PayloadActionCreator<
    Section[],
    typeof SECTIONS_FETCHED
>

export type SectionCreatedAction = PayloadActionCreator<
    Section,
    typeof SECTION_CREATED
>

export type SectionDeletedAction = PayloadActionCreator<
    number,
    typeof SECTION_DELETED
>

export type SectionUpdatedAction = PayloadActionCreator<
    Section,
    typeof SECTION_UPDATED
>
