import client from '@repo/api-resources'
import MockAdapter from 'axios-mock-adapter'
import { omit } from '@gorgias/toolkit'
import { section } from '../../../fixtures/section'
import {
    createSection,
    deleteSection,
    fetchSections,
    updateSection,
} from '../resources'
import type { SectionDraft } from '../types'

const mockedServer = new MockAdapter(client)
const sectionDraft: SectionDraft = omit(section, [
    'id',
    'created_datetime',
    'updated_datetime',
    'uri',
])

describe('section resources', () => {
    beforeEach(() => {
        mockedServer.reset()
    })

    describe('fetchSections', () => {
        it('should resolve with a Section list on success', async () => {
            mockedServer.onGet('/api/view-sections/').reply(200, {
                data: [section, section, section],
            })

            const res = await fetchSections()
            expect(res).toMatchSnapshot()
        })

        it('should reject an error on fail', () => {
            mockedServer
                .onGet('/api/view-sections/')
                .reply(503, { message: 'error' })
            return expect(fetchSections()).rejects.toEqual(
                new Error('Request failed with status code 503'),
            )
        })
    })

    describe('createSection', () => {
        it('should resolve with a new Section on success', async () => {
            mockedServer.onPost('/api/view-sections/').reply(200, section)

            const res = await createSection(sectionDraft)
            expect(res).toMatchSnapshot()
            expect(mockedServer.history).toMatchSnapshot()
        })

        it('should reject an error on fail', () => {
            mockedServer
                .onPost('/api/view-sections/')
                .reply(503, { message: 'error' })
            return expect(createSection(sectionDraft)).rejects.toEqual(
                new Error('Request failed with status code 503'),
            )
        })
    })

    describe('updateSection', () => {
        it('should resolve with an updated Section on success', async () => {
            mockedServer
                .onPut(/\/api\/view-sections\/\d+\//)
                .reply(200, section)

            const res = await updateSection(section)
            expect(res).toMatchSnapshot()
            expect(mockedServer.history).toMatchSnapshot()
        })

        it('should reject an error on fail', () => {
            mockedServer
                .onPut(/\/api\/view-sections\/\d+\//)
                .reply(503, { message: 'error' })
            return expect(updateSection(section)).rejects.toEqual(
                new Error('Request failed with status code 503'),
            )
        })
    })

    describe('deleteSection', () => {
        it('should resolve on success', async () => {
            mockedServer.onDelete(/\/api\/view-sections\/\d+\//).reply(200)

            const res = await deleteSection(1)
            expect(res).toMatchSnapshot()
        })

        it('should reject an error on fail', () => {
            mockedServer
                .onDelete(/\/api\/view-sections\/\d+\//)
                .reply(503, { message: 'error' })
            return expect(deleteSection(1)).rejects.toEqual(
                new Error('Request failed with status code 503'),
            )
        })
    })
})
