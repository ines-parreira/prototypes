// @flow
import {EditorState} from 'draft-js'

import {
    createPrediction,
    getPredictionText,
    insertPrediction,
    removeFirstNCharsOfPrediction,
} from '../utils.ts'

describe('utils', () => {
    const createStateWithPrediction = (text: string) => {
        const state = EditorState.createEmpty()
        const predictionKey = createPrediction(text, state)
        return {
            predictionKey,
            editorState: insertPrediction(predictionKey, state),
        }
    }

    const getLastCharEntityKey = (editorState: EditorState) => {
        const lastBlock = editorState.getCurrentContent().getLastBlock()
        return lastBlock.getEntityAt(lastBlock.getLength() - 1)
    }

    describe('removeFirstNCharsOfPrediction()', () => {
        it('should remove first n characters and update prediction', () => {
            let {predictionKey, editorState} = createStateWithPrediction('foo')
            editorState = removeFirstNCharsOfPrediction(
                predictionKey,
                editorState,
                2
            )
            predictionKey = getLastCharEntityKey(editorState)
            expect(getPredictionText(predictionKey, editorState)).toBe('o')
        })

        it('should clear prediction text if n is bigger than prediction length', () => {
            let {predictionKey, editorState} = createStateWithPrediction('foo')
            editorState = removeFirstNCharsOfPrediction(
                predictionKey,
                editorState,
                4
            )
            predictionKey = getLastCharEntityKey(editorState)
            expect(getPredictionText(predictionKey, editorState)).toBe('')
        })
    })
})
