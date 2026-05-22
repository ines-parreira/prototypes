export type TemplateValidationInputs = {
    productCount: number
    urlButtonCount: number
    qrButtonCount: number
    hasImage: boolean
}

export type TemplateValidationResult =
    | { isValid: true }
    | { isValid: false; reason: string }

const MAX_CAROUSEL_CARDS = 3

// Rules mirror the backend resolver in
// gorgias/g/legacy/integrations/sms/services/template_resolver.py and the
// template inventory in gorgias/g/domains/convert/rcs/templates.py.
// Combos handled here are the ones that produce resolution_path =
// "text_degradation" (or silent feature loss on the 1-product path).
// Truncation cases (e.g. 2 URL buttons → 1-URL template) are intentionally
// allowed because they still render a card or carousel.
export function validateTemplateInputs(
    inputs: TemplateValidationInputs,
): TemplateValidationResult {
    const { productCount, urlButtonCount, qrButtonCount, hasImage } = inputs
    const totalButtons = urlButtonCount + qrButtonCount

    if (productCount > MAX_CAROUSEL_CARDS) {
        return {
            isValid: false,
            reason: `Carousels support at most ${MAX_CAROUSEL_CARDS} products. Remove some or send fewer.`,
        }
    }

    if (productCount >= 1) {
        if (totalButtons === 0) {
            return {
                isValid: false,
                reason: 'Carousels and product cards require at least one button — add a button or remove products to send as text.',
            }
        }

        if (urlButtonCount > 0 && qrButtonCount > 0) {
            return {
                isValid: false,
                reason: 'Buttons must all be the same type (URL or Quick Reply) when products are present.',
            }
        }

        if (productCount >= 2 && qrButtonCount > 0 && qrButtonCount !== 2) {
            return {
                isValid: false,
                reason: 'Quick Reply carousels need exactly 2 Quick Reply buttons. Use 1 URL button or add a second Quick Reply.',
            }
        }
    }

    if (
        productCount === 0 &&
        qrButtonCount === 1 &&
        urlButtonCount === 0 &&
        !hasImage
    ) {
        return {
            isValid: false,
            reason: 'A single Quick Reply with no image has no matching template. Add an image, switch the button to URL, or add a second Quick Reply.',
        }
    }

    return { isValid: true }
}
