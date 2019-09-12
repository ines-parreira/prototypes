/**
 * Wrapper function using JS promises to create a token for a card using Stripe.js
 *
 * @param creditCard - The data of the credit card to encode.
 * @returns - A Stripe card token.
 */
export const createStripeCardToken = (creditCard: Object): Promise<Object> => {
    return new Promise((resolve, reject) => {
        Stripe.card.createToken(creditCard, (status, response) => {
            if (response.error) {
                reject(response)
            }
            resolve(response)
        })
    })
}
