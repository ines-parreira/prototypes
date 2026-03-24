import { reportError } from '@repo/logging'
import { AxiosError } from 'axios'
import AxiosMock from 'axios-mock-adapter'

import axiosClient from 'models/api/resources'

import type { PredictionFeedback, QueryContext } from '../client'
import {
    PHRASE_PREDICTION_ERROR_TAG_NAME,
    PhrasePredictionClient,
    PREDICTION_REQUEST_TIMEOUT,
    REQUEST_PREDICTION_ERROR_TAG_VALUE,
    SEND_FEEDBACK_ERROR_TAG_VALUE,
} from '../client'

const axiosMock = new AxiosMock(axiosClient)
jest.mock('@repo/logging')

const PHRASE_PREDICTION_URL = 'https://gorgias.com/api/prediction'
const PHRASE_FEEDBACK_URL = 'https://gorgias.com/api/feedback'
const client = new PhrasePredictionClient(
    PHRASE_PREDICTION_URL,
    PHRASE_FEEDBACK_URL,
)

describe('phrase prediction client', () => {
    beforeEach(() => {
        axiosMock.reset()
    })

    describe('requestPrediction', () => {
        const query = 'some query'
        const context: QueryContext = {
            foo: 'bar',
        }
        const response = { prediction: 'some prediction' }

        beforeEach(() => {
            axiosMock.onPost(PHRASE_PREDICTION_URL).reply(200, response)
        })

        it('should call prediction url', async () => {
            const prediction = await client.requestPrediction(query, context)

            expect(prediction).toBe(response.prediction)
        })

        it('should send query and context in the payload', async () => {
            await client.requestPrediction(query, context)

            const { post } = axiosMock.history
            expect(post).toHaveLength(1)
            expect(post[0].url).toBe(PHRASE_PREDICTION_URL)
            expect(post[0].data).toEqual(
                JSON.stringify({
                    query,
                    context,
                }),
            )
        })

        it('should set the prediction timeout', async () => {
            await client.requestPrediction(query, context)

            const { post } = axiosMock.history
            expect(post[0].timeout).toBe(PREDICTION_REQUEST_TIMEOUT)
        })

        it('should cancel ongoing previous request and return empty string', async () => {
            const secondQuery = 'second query'
            const secondResponse = 'second response'

            axiosMock.onPost(PHRASE_PREDICTION_URL).reply((req) => {
                const data: { query: string } = JSON.parse(req.data)
                if (data.query === secondQuery) {
                    return [200, { prediction: secondResponse }]
                }
                return [404]
            })

            const request1 = client.requestPrediction(query, context)
            const request2 = client.requestPrediction(secondQuery, context)

            const [response1, response2] = await Promise.all([
                request1,
                request2,
            ])

            expect(response1).toBe('')
            expect(response2).toBe(secondResponse)
        })

        it(`should report error with "${PHRASE_PREDICTION_ERROR_TAG_NAME}" tag set to "${REQUEST_PREDICTION_ERROR_TAG_VALUE}"`, async () => {
            axiosMock.onPost(PHRASE_PREDICTION_URL).reply(404)

            await client.requestPrediction(query, context)

            expect(reportError).toHaveBeenCalledWith(expect.any(AxiosError), {
                tags: {
                    [PHRASE_PREDICTION_ERROR_TAG_NAME]:
                        REQUEST_PREDICTION_ERROR_TAG_VALUE,
                },
            })
        })

        it('should return an empty string and not report error on request timeout', async () => {
            axiosMock.onPost(PHRASE_PREDICTION_URL).timeout()

            const prediction = await client.requestPrediction(query, context)

            expect(reportError).not.toHaveBeenCalled()
            expect(prediction).toBe('')
        })
    })

    describe('cancelPredictionRequest', () => {
        it('should return empty string on request cancel', async () => {
            axiosMock.onPost(PHRASE_PREDICTION_URL).reply(404)
            const request = client.requestPrediction('someQuery', {
                foo: 'bar',
            })

            client.cancelPredictionRequest()
            const prediction = await request

            expect(prediction).toBe('')
        })
    })

    describe('sendFeedback', () => {
        beforeEach(() => {
            axiosMock.onPost(PHRASE_FEEDBACK_URL).reply(200)
        })

        const feedback: PredictionFeedback = {
            queryText: 'some query',
            queryContext: {
                foo: 'bar',
            },
            resultPredictionText: 'some prediction',
            resultPredictionAccepted: true,
            resultNumberAcceptedCharacters: 4,
            tabKeyUsed: false,
            divergedPhrase: null,
        }

        it('should call feedback url with the feedback payload', async () => {
            await client.sendFeedback(feedback)

            const { post } = axiosMock.history
            expect(post).toHaveLength(1)
            expect(post[0].url).toBe(PHRASE_FEEDBACK_URL)
            expect(JSON.parse(post[0].data)).toEqual({
                query_text: 'some query',
                query_context: feedback.queryContext,
                result_prediction_text: feedback.resultPredictionText,
                result_prediction_accepted: feedback.resultPredictionAccepted,
                result_number_accepted_characters:
                    feedback.resultNumberAcceptedCharacters,
                tab_key_used: feedback.tabKeyUsed,
                diverged_phrase: null,
            })
        })

        it('should not snake case the props of the context', async () => {
            const queryContext = {
                fooBar: 'baz',
            }
            await client.sendFeedback({
                ...feedback,
                queryContext,
            })

            const { post } = axiosMock.history
            expect(JSON.parse(post[0].data)).toHaveProperty(
                'query_context',
                queryContext,
            )
        })

        it(`should report error with "${PHRASE_PREDICTION_ERROR_TAG_NAME}" tag set to "${SEND_FEEDBACK_ERROR_TAG_VALUE}"`, async () => {
            axiosMock.onPost(PHRASE_FEEDBACK_URL).reply(404)

            await client.sendFeedback(feedback)

            expect(reportError).toHaveBeenCalledWith(expect.any(AxiosError), {
                tags: {
                    [PHRASE_PREDICTION_ERROR_TAG_NAME]:
                        SEND_FEEDBACK_ERROR_TAG_VALUE,
                },
            })
        })
    })
})
