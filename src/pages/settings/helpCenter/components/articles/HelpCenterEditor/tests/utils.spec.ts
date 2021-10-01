import {getCharCount, getWordCount} from '../utils'

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
