// @flow
import {fromJS} from 'immutable'
import {EditorState} from 'draft-js'
import AxiosMock from 'axios-mock-adapter'
import axios from 'axios'

import prediction, {clearCache, setPredictionKey} from '../index'
import * as DraftTestUtils from '../../../tests/draftTestUtils'
import type {PluginMethods} from '../../types'

const axiosMock = new AxiosMock(axios)

const defaultContext = fromJS({})

const flushPromises = () => new Promise(setImmediate)

const PREDICTION_URL = '/prediction'
const FEEDBACK_URL = '/feedback'

// Setup axios
beforeEach(() => {
    axiosMock.reset()

    window.PHRASE_PREDICTION_URL = PREDICTION_URL
    axiosMock.onPost(PREDICTION_URL).reply(200, {prediction: ''})

    window.PHRASE_FEEDBACK_URL = FEEDBACK_URL
    axiosMock.onPost(FEEDBACK_URL ).reply(200)
})

const getPredictionCalls = () => axiosMock.history.post.filter((call) => call.url === PREDICTION_URL)
const getFeedbackCalls = () => axiosMock.history.post.filter((call) => call.url === FEEDBACK_URL)

// Clear plugin caches
beforeEach(() => {
    clearCache()
    setPredictionKey('')
})

describe('prediction plugin', () => {
    const typeAndPredict = async (
        text: string,
        predictionText: string,
        state: EditorState,
        onChange: (EditorState, PluginMethods) => EditorState,
        plugin: PluginMethods
    ) => {
        axiosMock.onPost(PREDICTION_URL).reply(200, {prediction: predictionText})
        const textState = DraftTestUtils.typeText(state, text)
        const changedState = onChange(textState, plugin)
        plugin.setEditorState(changedState)
        await flushPromises()
        return plugin.getEditorState()
    }

    const createPredictionEntity = (text: string) => {
        return {
            type: 'prediction',
            data: {text},
            mutability: 'IMMUTABLE'
        }
    }

    describe('prediction', () => {
        it('should not request prediction if text is 1 character long', async () => {
            const {onChange} = prediction({context: defaultContext})
            const state = EditorState.createEmpty()
            const plugin = DraftTestUtils.mockPlugin(state)
            await typeAndPredict('H', '', state, onChange, plugin)
            expect(getPredictionCalls()).toHaveLength(0)
        })

        it('should request prediction', async () => {
            const {onChange} = prediction({context: defaultContext})
            const state = EditorState.createEmpty()
            const plugin = DraftTestUtils.mockPlugin(state)
            const text = 'Hi'
            await typeAndPredict(text, ' Marie,', state, onChange, plugin)
            const predictionCalls = getPredictionCalls()
            expect(predictionCalls).toHaveLength(1)
            expect(predictionCalls[0]).toHaveProperty('url', PREDICTION_URL)
            expect(JSON.parse(predictionCalls[0].data)).toMatchObject({
                query: text,
                context: defaultContext.toJS()
            })
        })

        it('should display the prediction', async () => {
            const {onChange} = prediction({context: defaultContext})
            let state = EditorState.createEmpty()
            const plugin = DraftTestUtils.mockPlugin(state)
            const text = 'Hi'
            const predictedText = ' Marie,'

            state = await typeAndPredict(text, predictedText, state, onChange, plugin)

            const content = state.getCurrentContent()
            expect(content.getPlainText()).toBe(text + ' ')
            expect(DraftTestUtils.getLastCreatedEntityRange(content)).toEqual([2, 3])
            expect((DraftTestUtils.getLastCreatedEntity(content): any).toJS()).toEqual(createPredictionEntity(predictedText))
        })

        it('should update the prediction when typing along with the prediction', async () => {
            const {onChange} = prediction({context: defaultContext})
            let state = EditorState.createEmpty()
            const plugin = DraftTestUtils.mockPlugin(state)

            state = await typeAndPredict('Hi', ' Marie,', state, onChange, plugin)
            state = await typeAndPredict(' ', '', state, onChange, plugin)

            const content = state.getCurrentContent()
            expect(content.getPlainText()).toBe('Hi  ')
            expect(getPredictionCalls()).toHaveLength(1) // It should cache results to avoid excessive requests
            expect(DraftTestUtils.getLastCreatedEntityRange(content)).toEqual([3, 4])
            expect((DraftTestUtils.getLastCreatedEntity(content): any).toJS()).toMatchObject(createPredictionEntity('Marie,'))
        })

        it('should hide the prediction and request a new one when new text does not match the previous prediction', async () => {
            const {onChange} = prediction({context: defaultContext})
            let state = EditorState.createEmpty()
            const plugin = DraftTestUtils.mockPlugin(state)

            state = await typeAndPredict('Hi ', 'Marie,', state, onChange, plugin)
            state = await typeAndPredict('P', '', state, onChange, plugin)

            const content = state.getCurrentContent()

            expect(content.getPlainText()).toBe('Hi P')
            expect(getPredictionCalls()).toHaveLength(2)
            expect(DraftTestUtils.getLastCreatedEntityRange(content)).toBeNull()

            const feedbackCalls = getFeedbackCalls()
            expect(feedbackCalls).toHaveLength(1)
            expect(JSON.parse(feedbackCalls[0].data)).toMatchObject({
                result_number_accepted_characters: 0,
                query_text: 'Hi ',
                result_prediction_text: 'Marie,',
                result_prediction_accepted: false
            })
        })
    })
})
