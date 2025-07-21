import { dummyAppDetail } from 'fixtures/apps'

import { DEFAULT_VALUES, mapDefaults } from '../mapDefaults'

describe(`mapDefaults`, () => {
    it('should map data correctly', () => {
        const emptyAppDetail = { ...dummyAppDetail }
        for (const key in DEFAULT_VALUES) {
            //@ts-ignore
            emptyAppDetail[key] = null
        }
        const defaultMappedAppDetail = mapDefaults({
            ...emptyAppDetail,
            isUnapproved: true,
        })
        Object.keys(DEFAULT_VALUES).forEach((key) => {
            //@ts-ignore
            expect(defaultMappedAppDetail[key]).toBe(DEFAULT_VALUES[key])
        })
    })
    it('should do nothing if app is approved', () => {
        expect(mapDefaults(dummyAppDetail)).toBe(dummyAppDetail)
        expect(mapDefaults({ ...dummyAppDetail, title: '' }).title).toBe('')
    })
})
