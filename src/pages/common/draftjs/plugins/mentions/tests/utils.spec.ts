import {fromJS} from 'immutable'

import {defaultSuggestionsFilter, getTypeByTrigger, getWordAt} from '../utils'

describe('getWordAt', () => {
    it('finds a word in between sentences', () => {
        const expected = {
            word: 'is',
            begin: 5,
            end: 7,
        }
        expect(getWordAt('this is a test', 5)).toEqual(expected)
    })

    it('finds the first word', () => {
        const expected = {
            word: 'this',
            begin: 0,
            end: 4,
        }
        expect(getWordAt('this is a test', 0)).toEqual(expected)
    })

    it('finds the last word', () => {
        const expected = {
            word: 'test',
            begin: 10,
            end: 14,
        }
        expect(getWordAt('this is a test', 15)).toEqual(expected)
    })
})

describe('getTypeByTrigger', () => {
    it('returns "mention" for trigger "@"', () => {
        expect(getTypeByTrigger('@')).toEqual('mention')
    })

    it('returns ":mention" for trigger ":"', () => {
        expect(getTypeByTrigger(':')).toEqual(':mention')
    })

    it('returns "-mention" for trigger "-"', () => {
        expect(getTypeByTrigger('-')).toEqual('-mention')
    })
})

describe('defaultSuggestionsFilter()', () => {
    const suggestions = fromJS([
        {name: 'Severine Smith'},
        {name: 'Séverine Dupont'},
        {name: 'Jean Bon'},
        {name: 'Πόπη Κουρούπη'},
    ])

    const expectedResults = fromJS([
        {name: 'Severine Smith'},
        {name: 'Séverine Dupont'},
    ])

    const greekResults = fromJS([{name: 'Πόπη Κουρούπη'}])

    describe('should return matching suggestions', () => {
        it('when the search value contains diacritics', () => {
            const results = defaultSuggestionsFilter('séverine', suggestions)
            expect(results).toEqual(expectedResults)
        })

        it('when the search value does not contain diacritics', () => {
            const results = defaultSuggestionsFilter('severine', suggestions)
            expect(results).toEqual(expectedResults)
        })

        it('when the search value contains greek characters', () => {
            const results = defaultSuggestionsFilter('Πόπη', suggestions)
            expect(results).toEqual(greekResults)
        })

        it("when some suggestion doesn't have a name", () => {
            const suggestions = fromJS([
                {name: 'Severine Smith'},
                {name: 'Séverine Dupont'},
                {},
                {name: 'Jean Bon'},
            ])

            const results = defaultSuggestionsFilter('severine', suggestions)
            expect(results).toEqual(expectedResults)
        })
    })
})
