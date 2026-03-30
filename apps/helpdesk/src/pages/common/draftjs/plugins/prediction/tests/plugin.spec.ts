import { assumeMock, flushPromises } from '@repo/testing'
import type { ContentState, SelectionState } from 'draft-js'
import { EditorState } from 'draft-js'
import type { Map } from 'immutable'
import { fromJS } from 'immutable'

import type { Plugin, PluginMethods } from 'pages/common/draftjs/plugins/types'
import * as DraftTestUtils from 'pages/common/draftjs/tests/draftTestUtils'

import client from '../client'
import createPredictionPlugin, { clearCache } from '../index'
import { cachedSelection, predictionKey } from '../state'

const variationMock = jest.fn(() => true)

jest.mock('@repo/logging')
jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlag: jest.fn((flag, defaultValue) => defaultValue),
    getLDClient: jest.fn(() => ({
        variation: variationMock,
        waitForInitialization: jest.fn(() => Promise.resolve()),
        on: jest.fn(),
        off: jest.fn(),
        allFlags: jest.fn(() => ({})),
    })),
}))
jest.mock('../client')

const defaultContext: Map<any, any> = fromJS({})

beforeEach(() => {
    clearCache()
    predictionKey.set(null)
    cachedSelection.set(null)
    jest.clearAllMocks()
    jest.useFakeTimers()
    variationMock.mockReturnValue(true)
})

describe('prediction plugin', () => {
    const createEmptyStatePredictionPlugin = (context = defaultContext) => {
        const predictionPlugin = createPredictionPlugin({
            context,
            debounce: 200,
        })
        const state = EditorState.createEmpty()
        const pluginMethods = DraftTestUtils.mockPluginMethods(state)
        return {
            predictionPlugin,
            pluginMethods,
        }
    }

    const typeAndPredict = async (
        text: string,
        predictionText: string,
        plugin: Plugin,
        pluginMethods: PluginMethods,
        advanceTimers = true,
    ): Promise<EditorState> => {
        assumeMock(client.requestPrediction).mockResolvedValue(predictionText)
        const textState = DraftTestUtils.typeText(
            pluginMethods.getEditorState(),
            text,
        )
        if (plugin.onChange) {
            const changedState = plugin.onChange(textState, pluginMethods)
            pluginMethods.setEditorState(changedState)
        }
        if (advanceTimers) {
            jest.runAllTimers() // advance timers to trigger debounced function
        }
        await flushPromises() // flush prediction and callback requests
        return pluginMethods.getEditorState()
    }

    const createPredictionEntity = (text: string) => {
        return {
            type: 'prediction',
            data: { text },
            mutability: 'IMMUTABLE',
        }
    }

    const expectToBeTextWithPrediction = (
        contentState: ContentState,
        text: string,
        prediction: string,
    ) => {
        expect(contentState.getPlainText()).toBe(text + ' ')
        expect(DraftTestUtils.getLastCreatedEntityRange(contentState)).toEqual([
            text.length,
            text.length + 1,
        ])
        expect(
            (
                DraftTestUtils.getLastCreatedEntity(
                    contentState,
                ) as unknown as Map<any, any>
            ).toJS(),
        ).toMatchObject(createPredictionEntity(prediction))
    }

    const expectToBeTextWithoutPrediction = (
        contentState: ContentState,
        text: string,
    ) => {
        expect(contentState.getPlainText()).toBe(text)
        expect(
            DraftTestUtils.getLastCreatedEntityRange(contentState),
        ).toBeNull()
    }

    describe('onChange()', () => {
        it('should not request prediction if text is 1 character long', async () => {
            const { predictionPlugin, pluginMethods } =
                createEmptyStatePredictionPlugin()
            await typeAndPredict('H', '', predictionPlugin, pluginMethods)
            expect(client.requestPrediction).not.toHaveBeenCalled()
        })

        it('should request prediction', async () => {
            const { predictionPlugin, pluginMethods } =
                createEmptyStatePredictionPlugin()
            const text = 'Hi'

            await typeAndPredict(
                text,
                ' Marie,',
                predictionPlugin,
                pluginMethods,
            )

            expect(client.requestPrediction).toHaveBeenCalledTimes(1)
            expect(client.requestPrediction).toHaveBeenCalledWith(
                text,
                defaultContext.toJS(),
            )
        })

        it('should throttle request prediction', async () => {
            const { predictionPlugin, pluginMethods } =
                createEmptyStatePredictionPlugin()
            const text = 'Hi'

            await typeAndPredict(
                text,
                '',
                predictionPlugin,
                pluginMethods,
                false,
            )
            await typeAndPredict(
                ' ',
                '',
                predictionPlugin,
                pluginMethods,
                false,
            )
            await typeAndPredict(
                'M',
                '',
                predictionPlugin,
                pluginMethods,
                false,
            )
            await typeAndPredict(
                'a',
                '',
                predictionPlugin,
                pluginMethods,
                false,
            )
            await typeAndPredict(
                'y',
                '',
                predictionPlugin,
                pluginMethods,
                false,
            )
            jest.runAllTimers()
            await flushPromises()

            // Should have 2 calls: 1 leading (immediate) + 1 trailing (after debounce)
            expect(client.requestPrediction).toHaveBeenCalledTimes(2)
        })

        it('should display the prediction', async () => {
            const { predictionPlugin, pluginMethods } =
                createEmptyStatePredictionPlugin()
            const text = 'Hi'
            const predictedText = ' Marie,'
            const state = await typeAndPredict(
                text,
                predictedText,
                predictionPlugin,
                pluginMethods,
            )
            expectToBeTextWithPrediction(
                state.getCurrentContent(),
                text,
                predictedText,
            )
        })

        it('should update the prediction when typing along with the prediction', async () => {
            const { predictionPlugin, pluginMethods } =
                createEmptyStatePredictionPlugin()

            await typeAndPredict(
                'Hi',
                ' Marie,',
                predictionPlugin,
                pluginMethods,
            )
            await typeAndPredict(' ', '', predictionPlugin, pluginMethods)
            await typeAndPredict('M', '', predictionPlugin, pluginMethods)

            expect(client.requestPrediction).toHaveBeenCalledTimes(1) // It should cache results to avoid excessive requests
            expectToBeTextWithPrediction(
                pluginMethods.getEditorState().getCurrentContent(),
                'Hi M',
                'arie,',
            )
        })

        it('should hide the prediction and request a new one when new text does not match the previous prediction', async () => {
            const { predictionPlugin, pluginMethods } =
                createEmptyStatePredictionPlugin()

            await typeAndPredict(
                'Hi ',
                'Marie,',
                predictionPlugin,
                pluginMethods,
            )
            await typeAndPredict(
                'P',
                '',
                predictionPlugin,
                pluginMethods,
                false,
            )
            jest.runAllTimers()
            await flushPromises()

            // Should have 2 calls: one for "Hi " and one for "Hi P" (leading edge of new debounce window)
            expect(client.requestPrediction).toHaveBeenCalledTimes(2)
            expectToBeTextWithoutPrediction(
                pluginMethods.getEditorState().getCurrentContent(),
                'Hi P',
            )
            expect(client.sendFeedback).toHaveBeenCalledTimes(1)
            expect(client.sendFeedback).toHaveBeenCalledWith({
                queryText: 'Hi ',
                resultNumberAcceptedCharacters: 0,
                resultPredictionText: 'Marie,',
                resultPredictionAccepted: false,
                queryContext: {},
                tabKeyUsed: false,
                divergedPhrase: null,
            })
        })

        it('should remove the prediction if it was completed', async () => {
            const { predictionPlugin, pluginMethods } =
                createEmptyStatePredictionPlugin()

            await typeAndPredict(
                'Hi Mari',
                'e',
                predictionPlugin,
                pluginMethods,
            )
            await typeAndPredict('e', '', predictionPlugin, pluginMethods)

            expectToBeTextWithoutPrediction(
                pluginMethods.getEditorState().getCurrentContent(),
                'Hi Marie',
            )
            expect(client.sendFeedback).toHaveBeenCalledTimes(1)
            expect(client.sendFeedback).toHaveBeenCalledWith({
                queryText: 'Hi Mari',
                resultNumberAcceptedCharacters: 1,
                resultPredictionText: 'e',
                resultPredictionAccepted: false,
                queryContext: {},
                tabKeyUsed: false,
                divergedPhrase: null,
            })
        })

        it('should remove the prediction on cursor move', async () => {
            const { predictionPlugin, pluginMethods } =
                createEmptyStatePredictionPlugin()

            await typeAndPredict('Hi', ' Bob', predictionPlugin, pluginMethods)

            let state = pluginMethods.getEditorState()
            const newSelection = state
                .getSelection()
                .set('anchorOffset', 0)
                .set('focusOffset', 0) as SelectionState
            state = EditorState.forceSelection(state, newSelection)
            state = predictionPlugin.onChange
                ? predictionPlugin.onChange(state, pluginMethods)
                : state

            expect(
                DraftTestUtils.getLastCreatedEntityRange(
                    state.getCurrentContent(),
                ),
            ).toBeNull()
        })

        it('should remove the prediction on content remove', async () => {
            const { predictionPlugin, pluginMethods } =
                createEmptyStatePredictionPlugin()

            await typeAndPredict('Hi', ' Bob', predictionPlugin, pluginMethods)

            let state = pluginMethods.getEditorState()
            state = DraftTestUtils.pressBackspace(state)
            state = predictionPlugin.onChange
                ? predictionPlugin.onChange(state, pluginMethods)
                : state

            expect(
                DraftTestUtils.getLastCreatedEntityRange(
                    state.getCurrentContent(),
                ),
            ).toBeNull()
        })

        // Regression test for https://github.com/gorgias/gorgias/issues/4553
        it('should hide the prediction on partial input mismatch', async () => {
            const { predictionPlugin, pluginMethods } =
                createEmptyStatePredictionPlugin()

            await typeAndPredict(
                "I'm so",
                ' sorry,',
                predictionPlugin,
                pluginMethods,
            )
            await typeAndPredict('r', '', predictionPlugin, pluginMethods)

            expectToBeTextWithoutPrediction(
                pluginMethods.getEditorState().getCurrentContent(),
                "I'm sor",
            )
        })

        describe('text paste', () => {
            it('should support pasting multi-char text that matches the prediction', async () => {
                const { predictionPlugin, pluginMethods } =
                    createEmptyStatePredictionPlugin()

                await typeAndPredict(
                    'Hi ',
                    'Marie,',
                    predictionPlugin,
                    pluginMethods,
                )
                await typeAndPredict('Mar', '', predictionPlugin, pluginMethods)

                expectToBeTextWithPrediction(
                    pluginMethods.getEditorState().getCurrentContent(),
                    'Hi Mar',
                    'ie,',
                )
                expect(client.sendFeedback).toHaveBeenCalledTimes(0)
            })

            it('should remove prediction and send not accepted feedback on pasting text matching prediction partially', async () => {
                const { predictionPlugin, pluginMethods } =
                    createEmptyStatePredictionPlugin()

                await typeAndPredict(
                    'Hi ',
                    'Marie,',
                    predictionPlugin,
                    pluginMethods,
                )
                await typeAndPredict(
                    'Mario',
                    '',
                    predictionPlugin,
                    pluginMethods,
                )

                expectToBeTextWithoutPrediction(
                    pluginMethods.getEditorState().getCurrentContent(),
                    'Hi Mario',
                )
                expect(client.sendFeedback).toHaveBeenCalledTimes(1)
                expect(client.sendFeedback).toHaveBeenCalledWith({
                    queryText: 'Hi ',
                    resultNumberAcceptedCharacters: 4,
                    resultPredictionText: 'Marie,',
                    resultPredictionAccepted: false,
                    queryContext: {},
                    tabKeyUsed: false,
                    divergedPhrase: null,
                })
            })

            it('should remove prediction and send accepted feedback on pasting text that completes the prediction', async () => {
                const { predictionPlugin, pluginMethods } =
                    createEmptyStatePredictionPlugin()

                await typeAndPredict(
                    'Hi ',
                    'Marie,',
                    predictionPlugin,
                    pluginMethods,
                )
                await typeAndPredict(
                    'Marie,',
                    '',
                    predictionPlugin,
                    pluginMethods,
                )

                expectToBeTextWithoutPrediction(
                    pluginMethods.getEditorState().getCurrentContent(),
                    'Hi Marie,',
                )
                expect(client.sendFeedback).toHaveBeenCalledTimes(1)
                expect(client.sendFeedback).toHaveBeenCalledWith({
                    queryText: 'Hi ',
                    resultNumberAcceptedCharacters: 6,
                    resultPredictionText: 'Marie,',
                    resultPredictionAccepted: false,
                    queryContext: {},
                    tabKeyUsed: false,
                    divergedPhrase: null,
                })
            })

            it('should remove prediction and send successful feedback on pasting text matching prediction with extra chars at the end', async () => {
                const { predictionPlugin, pluginMethods } =
                    createEmptyStatePredictionPlugin()

                await typeAndPredict(
                    'Hi ',
                    'Marie,',
                    predictionPlugin,
                    pluginMethods,
                )
                await typeAndPredict(
                    'Marie,',
                    '',
                    predictionPlugin,
                    pluginMethods,
                )

                expectToBeTextWithoutPrediction(
                    pluginMethods.getEditorState().getCurrentContent(),
                    'Hi Marie,',
                )
                expect(client.sendFeedback).toHaveBeenCalledTimes(1)
                expect(client.sendFeedback).toHaveBeenCalledWith({
                    queryText: 'Hi ',
                    resultNumberAcceptedCharacters: 6,
                    resultPredictionText: 'Marie,',
                    resultPredictionAccepted: false,
                    queryContext: {},
                    tabKeyUsed: false,
                    divergedPhrase: null,
                })
            })
        })
    })

    describe('onTab()', () => {
        it('should complete the prediction', async () => {
            const { predictionPlugin, pluginMethods } =
                createEmptyStatePredictionPlugin()
            const text = 'Hi'
            const predictedText = ' Marie,'
            await typeAndPredict(
                text,
                predictedText,
                predictionPlugin,
                pluginMethods,
            )

            const preventDefault = jest.fn()
            predictionPlugin.onTab &&
                predictionPlugin.onTab({ preventDefault } as any, pluginMethods)
            await flushPromises()

            expect(preventDefault).toBeCalled()
            expectToBeTextWithoutPrediction(
                pluginMethods.getEditorState().getCurrentContent(),
                'Hi Marie,',
            )
            expect(client.sendFeedback).toHaveBeenCalledTimes(1)
            expect(client.sendFeedback).toHaveBeenCalledWith({
                queryText: 'Hi',
                resultNumberAcceptedCharacters: 7,
                resultPredictionText: ' Marie,',
                resultPredictionAccepted: true,
                queryContext: {},
                tabKeyUsed: true,
                divergedPhrase: null,
            })
        })
    })

    describe('onRightArrow()', () => {
        it('should complete the prediction', async () => {
            const { predictionPlugin, pluginMethods } =
                createEmptyStatePredictionPlugin()

            await typeAndPredict(
                'Hi',
                ' Marie,',
                predictionPlugin,
                pluginMethods,
            )
            await typeAndPredict(' M', '', predictionPlugin, pluginMethods)
            await typeAndPredict('ar', '', predictionPlugin, pluginMethods)

            const preventDefault = jest.fn()
            predictionPlugin.onRightArrow &&
                predictionPlugin.onRightArrow(
                    { preventDefault } as any,
                    pluginMethods,
                )
            await flushPromises()

            expect(preventDefault).toBeCalled()
            expectToBeTextWithoutPrediction(
                pluginMethods.getEditorState().getCurrentContent(),
                'Hi Marie,',
            )
            expect(client.sendFeedback).toHaveBeenCalledTimes(1)
            expect(client.sendFeedback).toHaveBeenCalledWith({
                queryText: 'Hi',
                resultNumberAcceptedCharacters: 7,
                resultPredictionText: ' Marie,',
                resultPredictionAccepted: true,
                queryContext: {},
                tabKeyUsed: true,
                divergedPhrase: null,
            })
        })
    })
})
