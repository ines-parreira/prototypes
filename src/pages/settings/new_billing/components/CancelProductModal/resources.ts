import client from 'models/api/resources'
import {CHURN_MITIGATION_OFFER_ZAPIER_URL} from './constants'

type Payload = {
    productType: string
    accountDomain: string
    userEmail: string
    primaryReason: string
    secondaryReason: string | null
    otherReason: string | null
    correspondingChurnMitigationOfferId: string | null
}

export const sendAcceptedChurnMitigationOfferToSupport = (payload: Payload) => {
    return client
        .post<Payload>(
            CHURN_MITIGATION_OFFER_ZAPIER_URL,
            {data: payload},
            {
                transformRequest: (
                    data: Payload,
                    headers: Record<string, unknown>
                ) => {
                    // We need this in order to prevent CORS policy error.
                    delete headers['X-CSRF-Token']
                    delete headers['X-Gorgias-User-Client']
                    return JSON.stringify(data)
                },
            }
        )
        .then(
            () => {
                return true
            },
            () => {
                return false
            }
        )
}
