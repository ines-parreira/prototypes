import _pick from 'lodash/pick'

import client from '../api/resources'
import {ApiListResponsePagination} from '../api/types'

import {Section, SectionDraft} from './types'

export const fetchSections = async () => {
    const res = await client.get<ApiListResponsePagination<Section[]>>(
        '/api/view-sections/'
    )
    return res.data
}

export const createSection = async (sectionDraft: SectionDraft) => {
    const res = await client.post<Section>('/api/view-sections/', sectionDraft)
    return res.data
}

export const updateSection = async (section: Section) => {
    const res = await client.put<Section>(
        `/api/view-sections/${section.id}/`,
        _pick(section, ['decoration', 'name'])
    )
    return res.data
}

export const deleteSection = async (sectionId: number) => {
    void (await client.delete(`/api/view-sections/${sectionId}/`))
}
