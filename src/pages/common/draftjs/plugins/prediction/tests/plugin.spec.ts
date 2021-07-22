import {fromJS, Map} from 'immutable'
import {ContentState, EditorState, SelectionState} from 'draft-js'
import AxiosMock from 'axios-mock-adapter'
import axios from 'axios'

import createPredictionPlugin, {clearCache, setPredictionKey} from '../index'
import * as DraftTestUtils from '../../../tests/draftTestUtils'
import {Plugin, PluginMethods} from '../../types'
import {reportError} from '../../../../../../utils/errors'

jest.mock('../../../../../../utils/errors')

const axiosMock = new AxiosMock(axios)

const defaultContext: Map<any, any> = fromJS({})

const flushPromises = () => new Promise(setImmediate)

const PREDICTION_URL = '/prediction'
const FEEDBACK_URL = '/feedback'

// Setup axios
beforeEach(() => {
    axiosMock.reset()

    window.PHRASE_PREDICTION_URL = PREDICTION_URL
    axiosMock.onPost(PREDICTION_URL).reply(200, {prediction: ''})

    window.PHRASE_FEEDBACK_URL = FEEDBACK_URL
    axiosMock.onPost(FEEDBACK_URL).reply(200)
})

const getPredictionCalls = () =>
    axiosMock.history.post.filter((call) => call.url === PREDICTION_URL)

// It will parse `data` for you
const getFeedbackCalls = () =>
    axiosMock.history.post
        .filter((call) => call.url === FEEDBACK_URL)
        .map((call) => ({
            ...call,
            data: JSON.parse(call.data),
        }))

// Clear plugin caches
beforeEach(() => {
    clearCache()
    setPredictionKey('')
})

describe('prediction plugin', () => {
    const createEmptyStatePredictionPlugin = (context = defaultContext) => {
        const predictionPlugin = createPredictionPlugin({context})
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
        pluginMethods: PluginMethods
    ): Promise<EditorState> => {
        axiosMock
            .onPost(PREDICTION_URL)
            .reply(200, {prediction: predictionText})
        const textState = DraftTestUtils.typeText(
            pluginMethods.getEditorState(),
            text
        )
        if (plugin.onChange) {
            const changedState = plugin.onChange(textState, pluginMethods)
            pluginMethods.setEditorState(changedState)
        }
        await flushPromises() // flush prediction and callback requests
        return pluginMethods.getEditorState()
    }

    const createPredictionEntity = (text: string) => {
        return {
            type: 'prediction',
            data: {text},
            mutability: 'IMMUTABLE',
        }
    }

    const expectToBeTextWithPrediction = (
        contentState: ContentState,
        text: string,
        prediction: string
    ) => {
        expect(contentState.getPlainText()).toBe(text + ' ')
        expect(DraftTestUtils.getLastCreatedEntityRange(contentState)).toEqual([
            text.length,
            text.length + 1,
        ])
        expect(
            ((DraftTestUtils.getLastCreatedEntity(
                contentState
            ) as unknown) as Map<any, any>).toJS()
        ).toMatchObject(createPredictionEntity(prediction))
    }

    const expectToBeTextWithoutPrediction = (
        contentState: ContentState,
        text: string
    ) => {
        expect(contentState.getPlainText()).toBe(text)
        expect(
            DraftTestUtils.getLastCreatedEntityRange(contentState)
        ).toBeNull()
    }

    const expectToSendFeedbackOnce = (
        feedbackMatch: Record<string, unknown>
    ) => {
        const feedbackCalls = getFeedbackCalls()
        expect(feedbackCalls).toHaveLength(1)
        expect(feedbackCalls[0].data).toMatchObject(feedbackMatch)
    }

    describe('onChange()', () => {
        it('should not request prediction if text is 1 character long', async () => {
            const {
                predictionPlugin,
                pluginMethods,
            } = createEmptyStatePredictionPlugin()
            await typeAndPredict('H', '', predictionPlugin, pluginMethods)
            expect(getPredictionCalls()).toHaveLength(0)
        })

        it('should request prediction', async () => {
            const {
                predictionPlugin,
                pluginMethods,
            } = createEmptyStatePredictionPlugin()
            const text = 'Hi'
            await typeAndPredict(
                text,
                ' Marie,',
                predictionPlugin,
                pluginMethods
            )
            const predictionCalls = getPredictionCalls()
            expect(predictionCalls).toHaveLength(1)
            expect(predictionCalls[0]).toHaveProperty('url', PREDICTION_URL)
            expect(JSON.parse(predictionCalls[0].data)).toMatchObject({
                query: text,
                context: defaultContext.toJS(),
            })
        })

        it('should display the prediction', async () => {
            const {
                predictionPlugin,
                pluginMethods,
            } = createEmptyStatePredictionPlugin()
            const text = 'Hi'
            const predictedText = ' Marie,'
            const state = await typeAndPredict(
                text,
                predictedText,
                predictionPlugin,
                pluginMethods
            )
            expectToBeTextWithPrediction(
                state.getCurrentContent(),
                text,
                predictedText
            )
        })

        it('should update the prediction when typing along with the prediction', async () => {
            const {
                predictionPlugin,
                pluginMethods,
            } = createEmptyStatePredictionPlugin()

            await typeAndPredict(
                'Hi',
                ' Marie,',
                predictionPlugin,
                pluginMethods
            )
            await typeAndPredict(' ', '', predictionPlugin, pluginMethods)
            await typeAndPredict('M', '', predictionPlugin, pluginMethods)

            expect(getPredictionCalls()).toHaveLength(1) // It should cache results to avoid excessive requests
            expectToBeTextWithPrediction(
                pluginMethods.getEditorState().getCurrentContent(),
                'Hi M',
                'arie,'
            )
        })

        it('should hide the prediction and request a new one when new text does not match the previous prediction', async () => {
            const {
                predictionPlugin,
                pluginMethods,
            } = createEmptyStatePredictionPlugin()

            await typeAndPredict(
                'Hi ',
                'Marie,',
                predictionPlugin,
                pluginMethods
            )
            await typeAndPredict('P', '', predictionPlugin, pluginMethods)

            expect(getPredictionCalls()).toHaveLength(2)
            expectToBeTextWithoutPrediction(
                pluginMethods.getEditorState().getCurrentContent(),
                'Hi P'
            )
            expectToSendFeedbackOnce({
                result_number_accepted_characters: 0,
                query_text: 'Hi ',
                result_prediction_text: 'Marie,',
                result_prediction_accepted: false,
            })
        })

        it('should remove the prediction if it was completed', async () => {
            const {
                predictionPlugin,
                pluginMethods,
            } = createEmptyStatePredictionPlugin()

            await typeAndPredict(
                'Hi Mari',
                'e',
                predictionPlugin,
                pluginMethods
            )
            await typeAndPredict('e', '', predictionPlugin, pluginMethods)

            expectToBeTextWithoutPrediction(
                pluginMethods.getEditorState().getCurrentContent(),
                'Hi Marie'
            )
            expectToSendFeedbackOnce({
                result_number_accepted_characters: 1,
                query_text: 'Hi Mari',
                result_prediction_text: 'e',
                result_prediction_accepted: true,
            })
        })

        it('should remove the prediction on cursor move', async () => {
            const {
                predictionPlugin,
                pluginMethods,
            } = createEmptyStatePredictionPlugin()

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
                    state.getCurrentContent()
                )
            ).toBeNull()
        })

        it('should remove the prediction on content remove', async () => {
            const {
                predictionPlugin,
                pluginMethods,
            } = createEmptyStatePredictionPlugin()

            await typeAndPredict('Hi', ' Bob', predictionPlugin, pluginMethods)

            let state = pluginMethods.getEditorState()
            state = DraftTestUtils.pressBackspace(state)
            state = predictionPlugin.onChange
                ? predictionPlugin.onChange(state, pluginMethods)
                : state

            expect(
                DraftTestUtils.getLastCreatedEntityRange(
                    state.getCurrentContent()
                )
            ).toBeNull()
        })

        // Regression test for https://github.com/gorgias/gorgias/issues/4553
        it('should hide the prediction on partial input mismatch', async () => {
            const {
                predictionPlugin,
                pluginMethods,
            } = createEmptyStatePredictionPlugin()

            await typeAndPredict(
                "I'm so",
                ' sorry,',
                predictionPlugin,
                pluginMethods
            )
            await typeAndPredict('r', '', predictionPlugin, pluginMethods)

            expectToBeTextWithoutPrediction(
                pluginMethods.getEditorState().getCurrentContent(),
                "I'm sor"
            )
        })

        it.each<[string, () => void]>([
            [
                'network error',
                () => {
                    axiosMock.onPost(PREDICTION_URL).networkError()
                },
            ],
            [
                'timout error',
                () => {
                    axiosMock.onPost(PREDICTION_URL).timeout()
                },
            ],
        ])('should not report %s', async (testName, testSetup) => {
            testSetup()
            const {
                predictionPlugin,
                pluginMethods,
            } = createEmptyStatePredictionPlugin()
            const state = DraftTestUtils.typeText(
                pluginMethods.getEditorState(),
                'Foo'
            )

            predictionPlugin.onChange?.(state, pluginMethods)
            await flushPromises()

            expect(reportError).not.toBeCalled()
        })

        it('should report prediction post errors', async () => {
            axiosMock.onPost(PREDICTION_URL).reply(404)
            const {
                predictionPlugin,
                pluginMethods,
            } = createEmptyStatePredictionPlugin()
            const state = DraftTestUtils.typeText(
                pluginMethods.getEditorState(),
                'Foo'
            )

            predictionPlugin.onChange?.(state, pluginMethods)
            await flushPromises()

            expect(reportError).toHaveBeenLastCalledWith(expect.any(Error))
        })

        describe('text paste', () => {
            it('should support pasting multi-char text that matches the prediction', async () => {
                const {
                    predictionPlugin,
                    pluginMethods,
                } = createEmptyStatePredictionPlugin()

                await typeAndPredict(
                    'Hi ',
                    'Marie,',
                    predictionPlugin,
                    pluginMethods
                )
                await typeAndPredict('Mar', '', predictionPlugin, pluginMethods)

                expectToBeTextWithPrediction(
                    pluginMethods.getEditorState().getCurrentContent(),
                    'Hi Mar',
                    'ie,'
                )
                expect(getFeedbackCalls()).toHaveLength(0)
            })

            it('should remove prediction and send not accepted feedback on pasting text matching prediction partially', async () => {
                const {
                    predictionPlugin,
                    pluginMethods,
                } = createEmptyStatePredictionPlugin()

                await typeAndPredict(
                    'Hi ',
                    'Marie,',
                    predictionPlugin,
                    pluginMethods
                )
                await typeAndPredict(
                    'Mario',
                    '',
                    predictionPlugin,
                    pluginMethods
                )

                expectToBeTextWithoutPrediction(
                    pluginMethods.getEditorState().getCurrentContent(),
                    'Hi Mario'
                )
                expectToSendFeedbackOnce({
                    result_number_accepted_characters: 4,
                    query_text: 'Hi ',
                    result_prediction_text: 'Marie,',
                    result_prediction_accepted: false,
                })
            })

            it('should remove prediction and send accepted feedback on pasting text that completes the prediction', async () => {
                const {
                    predictionPlugin,
                    pluginMethods,
                } = createEmptyStatePredictionPlugin()

                await typeAndPredict(
                    'Hi ',
                    'Marie,',
                    predictionPlugin,
                    pluginMethods
                )
                await typeAndPredict(
                    'Marie,',
                    '',
                    predictionPlugin,
                    pluginMethods
                )

                expectToBeTextWithoutPrediction(
                    pluginMethods.getEditorState().getCurrentContent(),
                    'Hi Marie,'
                )
                expectToSendFeedbackOnce({
                    result_number_accepted_characters: 6,
                    query_text: 'Hi ',
                    result_prediction_text: 'Marie,',
                    result_prediction_accepted: true,
                })
            })

            it('should remove prediction and send successful feedback on pasting text matching prediction with extra chars at the end', async () => {
                const {
                    predictionPlugin,
                    pluginMethods,
                } = createEmptyStatePredictionPlugin()

                await typeAndPredict(
                    'Hi ',
                    'Marie,',
                    predictionPlugin,
                    pluginMethods
                )
                await typeAndPredict(
                    'Marie,',
                    '',
                    predictionPlugin,
                    pluginMethods
                )

                expectToBeTextWithoutPrediction(
                    pluginMethods.getEditorState().getCurrentContent(),
                    'Hi Marie,'
                )
                expectToSendFeedbackOnce({
                    result_number_accepted_characters: 6,
                    query_text: 'Hi ',
                    result_prediction_text: 'Marie,',
                    result_prediction_accepted: true,
                })
            })
        })
    })

    describe('onTab()', () => {
        it('should complete the prediction', async () => {
            const {
                predictionPlugin,
                pluginMethods,
            } = createEmptyStatePredictionPlugin()
            const text = 'Hi'
            const predictedText = ' Marie,'
            await typeAndPredict(
                text,
                predictedText,
                predictionPlugin,
                pluginMethods
            )

            const preventDefault = jest.fn()
            predictionPlugin.onTab &&
                predictionPlugin.onTab({preventDefault} as any, pluginMethods)
            await flushPromises()

            expect(preventDefault).toBeCalled()
            expectToBeTextWithoutPrediction(
                pluginMethods.getEditorState().getCurrentContent(),
                'Hi Marie,'
            )
            expectToSendFeedbackOnce({
                result_number_accepted_characters: 7,
                query_text: 'Hi',
                result_prediction_text: ' Marie,',
                result_prediction_accepted: true,
            })
        })
    })

    describe('onRightArrow()', () => {
        it('should complete the prediction', async () => {
            const {
                predictionPlugin,
                pluginMethods,
            } = createEmptyStatePredictionPlugin()

            await typeAndPredict(
                'Hi',
                ' Marie,',
                predictionPlugin,
                pluginMethods
            )
            await typeAndPredict(' M', '', predictionPlugin, pluginMethods)
            await typeAndPredict('ar', '', predictionPlugin, pluginMethods)

            const preventDefault = jest.fn()
            predictionPlugin.onRightArrow &&
                predictionPlugin.onRightArrow(
                    {preventDefault} as any,
                    pluginMethods
                )
            await flushPromises()

            expect(preventDefault).toBeCalled()
            expectToBeTextWithoutPrediction(
                pluginMethods.getEditorState().getCurrentContent(),
                'Hi Marie,'
            )
            expectToSendFeedbackOnce({
                result_number_accepted_characters: 7,
                query_text: 'Hi',
                result_prediction_text: ' Marie,',
                result_prediction_accepted: true,
            })
        })
    })
})
