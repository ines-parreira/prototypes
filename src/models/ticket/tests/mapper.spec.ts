import {mapNormalizedToArray} from 'models/ticket/mappers'

describe('mapNormalizedToArray', () => {
    it('should return an array of objects', () => {
        const input = {
            1: {
                id: 1,
                name: 'test',
            },
            2: {
                id: 2,
                name: 'test2',
            },
        }
        const output = [
            {
                id: 1,
                name: 'test',
            },
            {
                id: 2,
                name: 'test2',
            },
        ]
        expect(mapNormalizedToArray(input)).toEqual(output)
    })
})
