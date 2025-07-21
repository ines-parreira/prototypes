import { getQaScoreDimensionFromObjectPath } from '../qaScoreDimensions'

describe('getQaScoreDimensionFromObjectPath', () => {
    it('should return null if the object path does not contain an qa score dimension', () => {
        expect(
            getQaScoreDimensionFromObjectPath('qa_score_dimensions'),
        ).toBeNull()
    })
    it('should return the qa score dimension from an object path', () => {
        expect(
            getQaScoreDimensionFromObjectPath(
                'qa_score_dimensions[language_proficiency].prediction',
            ),
        ).toBe('language_proficiency')
    })

    it('should return null if string is not valid qa score dimension', () => {
        expect(
            getQaScoreDimensionFromObjectPath(
                'qa_score_dimensions[not_qa_dimension].prediction',
            ),
        ).toBeNull()
    })
})
