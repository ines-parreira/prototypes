/**
 * Wrapper function using JS promises to create a token for a card using Stripe.js
 */
export const createStripeCardToken = (
    creditCard: stripe.StripeCardTokenData
): Promise<stripe.StripeCardTokenResponse> => {
    return new Promise((resolve, reject) => {
        Stripe.card.createToken(creditCard, (status, response) => {
            if (response.error) {
                reject(response)
            }
            resolve(response)
        })
    })
}
