import type { RawDraftContentState } from 'draft-js'
import {
    ContentState,
    convertFromRaw,
    convertToRaw,
    EditorState,
    Modifier,
    SelectionState,
} from 'draft-js'

import { draftjsGorgiasCustomBlockRenderers } from 'common/editor'

import {
    convertToRawWithoutPredictions,
    createPrediction,
    getPredictionText,
    insertPrediction,
    removeFirstNCharsOfPrediction,
} from '../utils'

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
            let { predictionKey, editorState } =
                createStateWithPrediction('foo')
            editorState = removeFirstNCharsOfPrediction(
                predictionKey,
                editorState,
                2,
            )
            predictionKey = getLastCharEntityKey(editorState)
            expect(getPredictionText(predictionKey, editorState)).toBe('o')
        })

        it('should clear prediction text if n is bigger than prediction length', () => {
            let { predictionKey, editorState } =
                createStateWithPrediction('foo')
            editorState = removeFirstNCharsOfPrediction(
                predictionKey,
                editorState,
                4,
            )
            predictionKey = getLastCharEntityKey(editorState)
            expect(getPredictionText(predictionKey, editorState)).toBe('')
        })
    })

    describe('convertToRawWithoutPredictions()', () => {
        it('should remove prediction entities from entityMap', () => {
            const state = EditorState.createEmpty()
            const predictionKey = createPrediction('test prediction', state)
            const editorState = insertPrediction(predictionKey, state)
            const contentState = editorState.getCurrentContent()

            const rawContent = convertToRaw(contentState)
            const hasPredictionBefore = Object.values(
                rawContent.entityMap,
            ).some((entity: any) => entity.type === 'prediction')
            expect(hasPredictionBefore).toBe(true)

            const cleanedRawContent =
                convertToRawWithoutPredictions(contentState)
            const hasPredictionAfter = Object.values(
                cleanedRawContent.entityMap,
            ).some((entity: any) => entity.type === 'prediction')
            expect(hasPredictionAfter).toBe(false)
        })

        it('should remove orphaned entities that are not referenced by any block', () => {
            const rawContentWithOrphanedEntity = {
                blocks: [
                    {
                        key: 'test-block',
                        text: 'Hello world',
                        type: 'unstyled',
                        depth: 0,
                        inlineStyleRanges: [],
                        entityRanges: [],
                        data: {},
                    },
                ],
                entityMap: {
                    '0': {
                        type: draftjsGorgiasCustomBlockRenderers.Img,
                        mutability: 'IMMUTABLE',
                        data: {
                            src: 'https://example.com/image.png',
                            width: 400,
                        },
                    },
                },
            }

            const contentState = convertFromRaw(
                rawContentWithOrphanedEntity as RawDraftContentState,
            )
            const cleanedRawContent =
                convertToRawWithoutPredictions(contentState)

            const hasImageAfter = Object.values(
                cleanedRawContent.entityMap,
            ).some(
                (entity: any) =>
                    entity.type === draftjsGorgiasCustomBlockRenderers.Img,
            )
            expect(hasImageAfter).toBe(false)
        })

        it('should remove image/video entities that are in non-atomic blocks', () => {
            const rawContentWithMisplacedImage = {
                blocks: [
                    {
                        key: 'test-block',
                        text: 'HMMMM  ',
                        type: 'unstyled',
                        depth: 0,
                        inlineStyleRanges: [],
                        entityRanges: [{ offset: 6, length: 1, key: 0 }],
                        data: {},
                    },
                ],
                entityMap: {
                    '0': {
                        type: draftjsGorgiasCustomBlockRenderers.Img,
                        mutability: 'IMMUTABLE',
                        data: {
                            src: 'https://example.com/image.png',
                            width: 400,
                        },
                    },
                },
            }

            const contentState = convertFromRaw(
                rawContentWithMisplacedImage as RawDraftContentState,
            )
            const cleanedRawContent =
                convertToRawWithoutPredictions(contentState)

            const hasImage = Object.values(cleanedRawContent.entityMap).some(
                (entity: any) =>
                    entity.type === draftjsGorgiasCustomBlockRenderers.Img,
            )
            expect(hasImage).toBe(false)
        })

        it('should keep entities that are referenced by blocks', () => {
            let contentState = ContentState.createFromText('Hello world')

            contentState = contentState.createEntity('link', 'MUTABLE', {
                url: 'https://example.com',
            })
            const linkEntityKey = contentState.getLastCreatedEntityKey()

            const firstBlock = contentState.getFirstBlock()
            const selection = SelectionState.createEmpty(firstBlock.getKey())
                .set('anchorOffset', 0)
                .set('focusOffset', 5) as SelectionState

            contentState = Modifier.applyEntity(
                contentState,
                selection,
                linkEntityKey,
            )

            const rawContent = convertToRaw(contentState)
            const hasLinkBefore = Object.values(rawContent.entityMap).some(
                (entity: any) => entity.type === 'link',
            )
            expect(hasLinkBefore).toBe(true)

            const cleanedRawContent =
                convertToRawWithoutPredictions(contentState)
            const hasLinkAfter = Object.values(
                cleanedRawContent.entityMap,
            ).some((entity: any) => entity.type === 'link')
            expect(hasLinkAfter).toBe(true)
        })
    })
})
