import {
    countLines,
    countWords,
    humanize,
    humanizeArray,
    removeSuffix,
    truncateWords,
} from '../string'

describe('string util', () => {
    describe('removeSuffix', () => {
        it("should return the data if it's not a string", () => {
            expect(removeSuffix(null as any, 'hey')).toEqual(null)
            expect(removeSuffix({ foo: 'bar' } as any, 'hey')).toEqual({
                foo: 'bar',
            })
            expect(removeSuffix(1 as any, 'hey')).toEqual(1)
        })

        it('should return the data if the suffix does not end with it', () => {
            expect(removeSuffix('foo', 'hey')).toEqual('foo')
            expect(removeSuffix('heyfoo', 'hey')).toEqual('heyfoo')
            expect(removeSuffix('fooheyfoo', 'hey')).toEqual('fooheyfoo')
        })

        it('should remove the suffix from the data if the data ends with the suffix', () => {
            expect(removeSuffix('foobar', 'bar')).toEqual('foo')
        })
    })

    describe('countLines', () => {
        it('should return 0 because given values are not string', () => {
            expect(countLines(undefined as any)).toEqual(0)
            expect(countLines(null as any)).toEqual(0)
            expect(countLines([] as any)).toEqual(0)
            expect(countLines({} as any)).toEqual(0)
            expect(countLines(12 as any)).toEqual(0)
        })

        it('should return the number of lines in the given text', () => {
            expect(countLines('\n1\n2\n3')).toEqual(4)
        })
    })

    describe('countWords', () => {
        it('should count words in a text with whitespaces', () => {
            expect(countWords('   foo   bar  baz')).toBe(3)
        })

        it('should count words in a text with newlines', () => {
            expect(countWords('   foo  \n\n\r\n bar  \n\n  baz')).toBe(3)
        })

        it('should count words in a text with special chars and numbers', () => {
            expect(countWords('foo@#123$% bar-_&][ baz')).toBe(3)
        })
    })

    describe('truncateWords', () => {
        it('should return first n words in a text with whitespaces', () => {
            expect(truncateWords('   foo   bar  baz', 2)).toBe('   foo   bar')
        })

        it('should return first n words in a text with newlines', () => {
            expect(truncateWords('   foo  \n\n\r\n bar  \n\n  baz', 2)).toBe(
                '   foo  \n\n\r\n bar',
            )
        })

        it('should return empty text when n is 0', () => {
            expect(truncateWords('foo  bar', 0)).toBe('')
        })

        it('should throw an error when n is negative ', () => {
            expect(() => {
                truncateWords('Foo', -1)
            }).toThrow('Unsupported negative words number')
        })

        it('should return the entire string if n is larger then the number of words', () => {
            expect(truncateWords('foo bar baz', 10)).toBe('foo bar baz')
        })

        it('should return first n words in a text with special chars and numbers', () => {
            expect(truncateWords('foo@#123$% bar-_&][ baz', 2)).toBe(
                'foo@#123$% bar-_&][',
            )
        })
    })

    describe('humanize', () => {
        it('should replace underscores with spaces and capitalize first letter', () => {
            expect(humanize('hello_world')).toBe('Hello world')
        })

        it('should insert space before uppercase letters (camelCase)', () => {
            expect(humanize('helloWorld')).toBe('Hello world')
        })

        it('should replace hyphens and dots with spaces', () => {
            expect(humanize('hello-world')).toBe('Hello world')
            expect(humanize('hello.world')).toBe('Hello world')
        })

        it('should trim leading and trailing punctuation', () => {
            expect(humanize('_hello_')).toBe('Hello')
            expect(humanize('.-hello-.')).toBe('Hello')
        })

        it('should collapse multiple separators into one space', () => {
            expect(humanize('hello__world')).toBe('Hello world')
        })
    })

    describe('humanizeArray', () => {
        it('should return empty string for empty array', () => {
            expect(humanizeArray([])).toBe('')
        })

        it('should return string for array of length 1', () => {
            expect(humanizeArray(['plop'])).toBe('plop')
        })

        it('should return string for array with length > 1', () => {
            expect(humanizeArray(['plop', 'plip', 'plap'])).toBe(
                'plop, plip and plap',
            )
        })
    })
})
