import {
    getCharCount,
    getWordCount,
    insertAtomicBlocksForImagesEntities,
} from '../utils'

describe('insertAtomicBlocksForImagesEntities', () => {
    it('should return draftjs raw data with one atomic block wrapping the image', () => {
        const inputRawData = {
            blocks: {
                0: {
                    depth: 0,
                    entityRanges: [],
                    inlineStyleRanges: [],
                    text: 'Paragraph ',
                    type: 'unstyled',
                },
                1: {
                    depth: 0,
                    type: 'unstyled',
                    text: '',
                    entityRanges: [{offset: 0, length: 0, key: 5}],
                    inlineStyleRanges: [],
                },
            },
            entityMap: {
                5: {
                    data: {src: 'image-src'},
                    mutability: 'MUTABLE',
                    text: ' ',
                    type: 'IMAGE',
                },
            },
        }

        const expectedOutput = {
            blocks: {
                0: {
                    depth: 0,
                    entityRanges: [],
                    inlineStyleRanges: [],
                    text: 'Paragraph ',
                    type: 'unstyled',
                },
                1: {
                    depth: 0,
                    type: 'atomic',
                    text: ' ',
                    entityRanges: [{offset: 0, length: 1, key: 5}],
                    inlineStyleRanges: [],
                },
            },
            entityMap: {
                5: {
                    data: {src: 'image-src'},
                    mutability: 'MUTABLE',
                    text: ' ',
                    type: 'IMAGE',
                },
            },
        }

        const outputRawData = insertAtomicBlocksForImagesEntities(
            inputRawData as any
        )
        expect(outputRawData).toEqual(expectedOutput)
    })
})

describe('HelpCenter Editor Counters', () => {
    it('should return the correct number of characters', () => {
        expect(getCharCount('Hello World!')).toEqual(12)
        expect(getCharCount('😁😂😃')).toEqual(3)
        expect(getCharCount('Caractères en français')).toEqual(22)
    })

    it('should return the correct number of words', () => {
        expect(getWordCount('Hello there, how are you? 😂')).toEqual(6)
        expect(getWordCount('😁😃')).toEqual(1)
        expect(getWordCount('😁😂, 😃')).toEqual(2)
    })
})
