import { reportError } from '@repo/logging'
import type { AxiosInstance, CancelTokenSource } from 'axios'
import axios, { AxiosError, isAxiosError, isCancel } from 'axios'

import { createClient } from 'models/api/resources'

export const PREDICTION_REQUEST_TIMEOUT = 2000
export const PHRASE_PREDICTION_ERROR_TAG_NAME = 'phrase_prediction'
export const REQUEST_PREDICTION_ERROR_TAG_VALUE = 'request_prediction'
export const SEND_FEEDBACK_ERROR_TAG_VALUE = 'send_feedback'

export type QueryContext = Record<string, unknown>

export type PredictionFeedback = {
    queryText: string
    queryContext: QueryContext
    resultPredictionText: string
    resultPredictionAccepted: boolean
    resultNumberAcceptedCharacters: number
    tabKeyUsed: boolean
    divergedPhrase: null
}

export type ClientParams = {
    predictionUrl: string
    feedbackUrl: string
}

export class PhrasePredictionClient {
    private client: AxiosInstance
    private predictionUrl: string
    private feedbackUrl: string
    private cancelTokenSource: CancelTokenSource | null = null

    constructor(predictionUrl: string, feedbackUrl: string) {
        this.predictionUrl = predictionUrl
        this.feedbackUrl = feedbackUrl
        this.client = createClient()
    }

    async requestPrediction(query: string, context: QueryContext) {
        this.cancelPredictionRequest()
        // oxlint-disable-next-line import/no-named-as-default-member -- axios exposes CancelToken.source() on the default export at runtime.
        const cancelTokenSource = axios.CancelToken.source()
        this.cancelTokenSource = cancelTokenSource

        try {
            const response = await this.client.post<{ prediction: string }>(
                this.predictionUrl,
                { query, context },
                {
                    timeout: PREDICTION_REQUEST_TIMEOUT,
                    cancelToken: cancelTokenSource.token,
                },
            )
            return response.data.prediction
        } catch (error) {
            if (isCancel(error)) {
                return ''
            }

            if (isAxiosError(error) && error.code === AxiosError.ECONNABORTED) {
                return ''
            }

            reportError(error, {
                tags: {
                    [PHRASE_PREDICTION_ERROR_TAG_NAME]:
                        REQUEST_PREDICTION_ERROR_TAG_VALUE,
                },
            })
        }
    }

    cancelPredictionRequest() {
        if (this.cancelTokenSource) {
            this.cancelTokenSource.cancel()
        }
    }

    async sendFeedback({
        queryText,
        queryContext,
        resultPredictionText,
        resultPredictionAccepted,
        resultNumberAcceptedCharacters,
        tabKeyUsed,
        divergedPhrase,
    }: PredictionFeedback) {
        try {
            await this.client.post(this.feedbackUrl, {
                query_text: queryText,
                result_prediction_text: resultPredictionText,
                result_prediction_accepted: resultPredictionAccepted,
                result_number_accepted_characters:
                    resultNumberAcceptedCharacters,
                tab_key_used: tabKeyUsed,
                query_context: queryContext,
                diverged_phrase: divergedPhrase,
            })
        } catch (error) {
            reportError(error, {
                tags: {
                    [PHRASE_PREDICTION_ERROR_TAG_NAME]:
                        SEND_FEEDBACK_ERROR_TAG_VALUE,
                },
            })
        }
    }
}

const phrasePredictionClient = new PhrasePredictionClient(
    window.PHRASE_PREDICTION_URL,
    window.PHRASE_FEEDBACK_URL,
)

export default phrasePredictionClient
