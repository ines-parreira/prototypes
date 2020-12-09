import {PayloadActionCreator} from '@reduxjs/toolkit'

import {Section} from '../../../models/section/types'

import {
    SECTIONS_FETCHED,
    SECTION_UPDATED,
    SECTION_DELETED,
    SECTION_CREATED,
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
