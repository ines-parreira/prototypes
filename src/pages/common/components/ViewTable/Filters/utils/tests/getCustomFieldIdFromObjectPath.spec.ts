import getCustomFieldIdFromObjectPath from '../getCustomFieldIdFromObjectPath'

describe('getCustomFieldIdFromObjectPath', () => {
    it('should return null if the object path does not contain an id', () => {
        expect(getCustomFieldIdFromObjectPath('custom_fields')).toBeNull()
    })
    it('should return the id from an object path', () => {
        expect(getCustomFieldIdFromObjectPath('custom_fields[123].value')).toBe(
            123
        )
    })
})
