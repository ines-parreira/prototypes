import {createBaseUrl} from '../message-processing'

describe('createBaseUrl', () => {
    it('creates the production url', () => {
        expect(createBaseUrl(true)).toBe('https://aiagent.gorgias.help')
    })

    it('creates the staging url', () => {
        expect(createBaseUrl(false, true)).toBe('https://aiagent.gorgias.rehab')
    })

    it('creates the development url', () => {
        expect(createBaseUrl(false, false)).toBe('http://localhost:9400')
    })
})
