import {createSelector} from '@reduxjs/toolkit'

import {RootState} from '../../types'

import {SectionsState} from './types'

type SectionByName = {[name: string]: number}

export const sectionsSelector = (state: RootState): SectionsState =>
    state.entities.sections || {}

export const getSectionIdByName = createSelector<
    RootState,
    SectionsState,
    SectionByName
>(sectionsSelector, (sections) =>
    Object.values(sections).reduce<SectionByName>((acc, section) => {
        acc[section.name] = section.id
        return acc
    }, {})
)
