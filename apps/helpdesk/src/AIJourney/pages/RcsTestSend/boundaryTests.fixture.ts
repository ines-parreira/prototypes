import type { RcsContext, RcsProduct } from 'AIJourney/types/RcsTestSend'

export type BoundaryTestCase = {
    id: string
    batch: 'api' | 'visual'
    name: string
    description: string
    expected:
        | { kind: 'twilio_ok' }
        | { kind: 'twilio_error'; code: number }
        | { kind: 'render_check'; observe: string[] }
    rcs_context: RcsContext
}

const PLACEHOLDER_IMAGE =
    'https://cdn.shopify.com/s/files/1/2218/2875/files/OB209-HybridButtonDown-Navy-Dimitri-WebUse-Lifestyle1.jpg?v=1774535968'

const LOREM =
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.'

// Produces a string of exactly `targetLength` chars, prefixed with `label`
// (so each rendered field is identifiable on the device) and padded with
// Lorem Ipsum filler. If the label alone is already too long it gets
// truncated. Filler boundary is mid-word, which is fine for length testing.
const padTo = (label: string, targetLength: number): string => {
    if (label.length >= targetLength) return label.slice(0, targetLength)
    const filler = ` — ${LOREM}`
    let out = label
    while (out.length < targetLength) {
        out += filler
    }
    return out.slice(0, targetLength)
}

const stableProduct = (
    idx: number,
    overrides: Partial<RcsProduct> = {},
): RcsProduct => ({
    title: `Product ${idx}`,
    image: PLACEHOLDER_IMAGE,
    product_id: 1000 + idx,
    variant_id: 2000 + idx,
    url: `https://example.com/product/${idx}`,
    ...overrides,
})

export const BOUNDARY_TESTS: BoundaryTestCase[] = [
    {
        id: 'A1',
        batch: 'api',
        name: 'Carousel: baseline known-good',
        description:
            '2 products, short titles, no body, 1 URL button. Should resolve cleanly.',
        expected: { kind: 'twilio_ok' },
        rcs_context: {
            text: 'A1: baseline carousel test.',
            buttons: [{ type: 'URL', text: 'Shop' }],
            products: [
                stableProduct(1, { title: 'A1 card one' }),
                stableProduct(2, { title: 'A1 card two' }),
            ],
        },
    },
    {
        id: 'A2',
        batch: 'api',
        name: 'Carousel: card title at 160 chars (empty body)',
        description:
            'Probes upper bound for title-only when body is empty. Twilio docs claim combined title+body cap is 160.',
        expected: { kind: 'twilio_ok' },
        rcs_context: {
            text: 'A2: title at 160 chars.',
            buttons: [{ type: 'URL', text: 'Shop' }],
            products: [
                stableProduct(1, { title: padTo('A2 title (160)', 160) }),
                stableProduct(2, { title: 'A2 card two' }),
            ],
        },
    },
    {
        id: 'A3',
        batch: 'api',
        name: 'Carousel: card title at 161 chars (empty body)',
        description:
            'One char over the documented 160 combined cap. Expect Twilio 21658.',
        expected: { kind: 'twilio_error', code: 21658 },
        rcs_context: {
            text: 'A3: title at 161 chars (should fail).',
            buttons: [{ type: 'URL', text: 'Shop' }],
            products: [
                stableProduct(1, { title: padTo('A3 title (161)', 161) }),
                stableProduct(2, { title: 'A3 card two' }),
            ],
        },
    },
    {
        id: 'A4',
        batch: 'api',
        name: 'Carousel: title+body sum at 160 (80+80)',
        description: 'Tests the "combined" claim. Sum is exactly 160.',
        expected: { kind: 'twilio_ok' },
        rcs_context: {
            text: 'A4: title 80 + body 80 = 160.',
            buttons: [{ type: 'URL', text: 'Shop' }],
            products: [
                stableProduct(1, {
                    title: padTo('A4 title (80)', 80),
                    body: padTo('A4 body (80)', 80),
                }),
                stableProduct(2, { title: 'A4 card two' }),
            ],
        },
    },
    {
        id: 'A5',
        batch: 'api',
        name: 'Carousel: title+body sum at 161 (80+81)',
        description:
            'One char over combined. If Twilio truly enforces the combined limit, expect 21658.',
        expected: { kind: 'twilio_error', code: 21658 },
        rcs_context: {
            text: 'A5: title 80 + body 81 = 161 (should fail).',
            buttons: [{ type: 'URL', text: 'Shop' }],
            products: [
                stableProduct(1, {
                    title: padTo('A5 title (80)', 80),
                    body: padTo('A5 body (81)', 81),
                }),
                stableProduct(2, { title: 'A5 card two' }),
            ],
        },
    },
    {
        id: 'A6',
        batch: 'api',
        name: 'Carousel: body alone over 160 (title 10, body 200)',
        description:
            'Body alone exceeds 160. If body is dropped before validation, expect 200 OK. If validated then dropped, expect 21658. Discriminating case.',
        expected: { kind: 'twilio_error', code: 21658 },
        rcs_context: {
            text: 'A6: body alone over 160 (probes drop-before-validate).',
            buttons: [{ type: 'URL', text: 'Shop' }],
            products: [
                stableProduct(1, {
                    title: padTo('A6 t', 10),
                    body: padTo('A6 body (200)', 200),
                }),
                stableProduct(2, { title: 'A6 card two' }),
            ],
        },
    },
    {
        id: 'A7',
        batch: 'api',
        name: 'Carousel: button label at 25 chars',
        description: 'Documented max for RBM action labels. Should pass.',
        expected: { kind: 'twilio_ok' },
        rcs_context: {
            text: 'A7: button label 25 chars.',
            buttons: [{ type: 'URL', text: padTo('A7 button label', 25) }],
            products: [
                stableProduct(1, { title: 'A7 card one' }),
                stableProduct(2, { title: 'A7 card two' }),
            ],
        },
    },
    {
        id: 'A8',
        batch: 'api',
        name: 'Carousel: button label at 26 chars',
        description:
            'One over documented max for RBM action labels. Expect 21658.',
        expected: { kind: 'twilio_error', code: 21658 },
        rcs_context: {
            text: 'A8: button label 26 chars (should fail).',
            buttons: [{ type: 'URL', text: padTo('A8 button label', 26) }],
            products: [
                stableProduct(1, { title: 'A8 card one' }),
                stableProduct(2, { title: 'A8 card two' }),
            ],
        },
    },
    {
        id: 'B1',
        batch: 'visual',
        name: 'Carousel: card titles only (minimal outer body)',
        description:
            'Cleanest carousel render. Outer text set to a single char because our backend rejects empty rcs_context.text — even a single-char outer body is invisible on iOS 26 carousels (see B2).',
        expected: {
            kind: 'render_check',
            observe: [
                'card titles visible',
                'images visible',
                'buttons visible',
                'outer text invisible (per B2)',
            ],
        },
        rcs_context: {
            text: '.',
            buttons: [{ type: 'URL', text: 'Shop' }],
            products: [
                stableProduct(1, { title: 'B1 card one' }),
                stableProduct(2, { title: 'B1 card two' }),
            ],
        },
    },
    {
        id: 'B2',
        batch: 'visual',
        name: 'Carousel: outer message_body filled',
        description: 'Adds carousel-level body. Does it render on iOS 26?',
        expected: {
            kind: 'render_check',
            observe: ['outer message_body visible above carousel'],
        },
        rcs_context: {
            text: 'B2 outer message body — does this show above the carousel?',
            buttons: [{ type: 'URL', text: 'Shop' }],
            products: [
                stableProduct(1, { title: 'B2 card one' }),
                stableProduct(2, { title: 'B2 card two' }),
            ],
        },
    },
    {
        id: 'B3',
        batch: 'visual',
        name: 'Carousel: top-level title filled (template ignores it)',
        description:
            'Template literal does not reference {{title}}, so the variable should be inert. Confirms.',
        expected: {
            kind: 'render_check',
            observe: [
                'outer message_body visible',
                'top-level title NOT visible',
            ],
        },
        rcs_context: {
            text: 'B3 outer body.',
            title: 'B3 top-level title — should NOT appear anywhere.',
            buttons: [{ type: 'URL', text: 'Shop' }],
            products: [
                stableProduct(1, { title: 'B3 card one' }),
                stableProduct(2, { title: 'B3 card two' }),
            ],
        },
    },
    {
        id: 'B4',
        batch: 'visual',
        name: 'Single card: title + 100-char body',
        description:
            '1 product + 1 URL button. Twilio drop-rule is documented for carousel body — does single-card body render?',
        expected: {
            kind: 'render_check',
            observe: ['card title visible', 'card body visible'],
        },
        rcs_context: {
            text: 'B4 outer body.',
            buttons: [{ type: 'URL', text: 'Shop' }],
            products: [
                stableProduct(1, {
                    title: 'B4 single card with body',
                    body: padTo(
                        'B4 single-card body — does this render on iOS?',
                        100,
                    ),
                }),
            ],
        },
    },
    {
        id: 'B5',
        batch: 'visual',
        name: 'Single card: title only, no body',
        description:
            'Compare to B4. If B4 and B5 look identical, single-card body is also dropped.',
        expected: {
            kind: 'render_check',
            observe: ['card title visible', 'no body area'],
        },
        rcs_context: {
            text: 'B5 outer body.',
            buttons: [{ type: 'URL', text: 'Shop' }],
            products: [stableProduct(1, { title: 'B5 single card no body' })],
        },
    },
    {
        id: 'B6',
        batch: 'visual',
        name: 'Single card with 2 quick replies',
        description:
            'Confirms QR-button rendering on iOS 26 for a single card.',
        expected: {
            kind: 'render_check',
            observe: ['card title visible', 'two quick reply buttons visible'],
        },
        rcs_context: {
            text: 'B6 outer body.',
            buttons: [
                { type: 'QUICK_REPLY', text: 'B6 yes' },
                { type: 'QUICK_REPLY', text: 'B6 no' },
            ],
            products: [stableProduct(1, { title: 'B6 QR card' })],
        },
    },
    {
        id: 'B7',
        batch: 'visual',
        name: 'Plain text (no products, no buttons, no image)',
        description: 'text_only path. Baseline.',
        expected: {
            kind: 'render_check',
            observe: ['plain text body visible, no card'],
        },
        rcs_context: {
            text: 'B7: plain text RCS message. No card, no buttons, no image.',
        },
    },
    {
        id: 'B8',
        batch: 'visual',
        name: 'Text + image (no products, no buttons)',
        description: 'text_with_media path. journey_media_only template.',
        expected: {
            kind: 'render_check',
            observe: ['text body visible', 'image visible', 'no buttons'],
        },
        rcs_context: {
            text: 'B8: text + image, no buttons. Should render a media card.',
            images: [PLACEHOLDER_IMAGE],
        },
    },
    {
        id: 'B9',
        batch: 'visual',
        name: 'Carousel: 3 products + 1 URL button per card',
        description:
            'Targets journey_carousel_3_cards_1_button. Confirms 3-card horizontal scroll renders.',
        expected: {
            kind: 'render_check',
            observe: [
                '3 cards in horizontal carousel',
                'each card has title, image, URL button',
            ],
        },
        rcs_context: {
            text: 'B9 outer body.',
            buttons: [{ type: 'URL', text: 'Shop' }],
            products: [
                stableProduct(1, { title: 'B9 card one' }),
                stableProduct(2, { title: 'B9 card two' }),
                stableProduct(3, { title: 'B9 card three' }),
            ],
        },
    },
    {
        id: 'B10',
        batch: 'visual',
        name: 'Carousel: 2 products + 2 Quick Reply buttons per card',
        description:
            'Targets journey_carousel_2_cards_2_qr. Two QR buttons per card replicated across cards.',
        expected: {
            kind: 'render_check',
            observe: [
                '2 cards in horizontal carousel',
                'each card has title, image, two QR buttons',
            ],
        },
        rcs_context: {
            text: 'B10 outer body.',
            buttons: [
                { type: 'QUICK_REPLY', text: 'B10 yes' },
                { type: 'QUICK_REPLY', text: 'B10 no' },
            ],
            products: [
                stableProduct(1, { title: 'B10 card one' }),
                stableProduct(2, { title: 'B10 card two' }),
            ],
        },
    },
    {
        id: 'B11',
        batch: 'visual',
        name: 'Carousel: 3 products + 2 Quick Reply buttons per card',
        description:
            'Targets journey_carousel_3_cards_2_qr. Combines 3-card scroll with 2 QR per card.',
        expected: {
            kind: 'render_check',
            observe: [
                '3 cards in horizontal carousel',
                'each card has title, image, two QR buttons',
            ],
        },
        rcs_context: {
            text: 'B11 outer body.',
            buttons: [
                { type: 'QUICK_REPLY', text: 'B11 yes' },
                { type: 'QUICK_REPLY', text: 'B11 no' },
            ],
            products: [
                stableProduct(1, { title: 'B11 card one' }),
                stableProduct(2, { title: 'B11 card two' }),
                stableProduct(3, { title: 'B11 card three' }),
            ],
        },
    },
    {
        id: 'B12',
        batch: 'visual',
        name: 'Single card with 1 Quick Reply',
        description:
            'Targets journey_1_card_1_qr (1 product + 1 QR + media). Affected by AIJ-2097: product title/body likely invisible.',
        expected: {
            kind: 'render_check',
            observe: [
                'single card with image',
                'outer body as tiny text',
                'one QR button',
                'product title/body likely missing (AIJ-2097)',
            ],
        },
        rcs_context: {
            text: 'B12 outer body.',
            buttons: [{ type: 'QUICK_REPLY', text: 'B12 reply' }],
            products: [stableProduct(1, { title: 'B12 1-QR card' })],
        },
    },
    {
        id: 'B13',
        batch: 'visual',
        name: 'Text + 1 URL button (no products, no image)',
        description:
            'Targets journey_without_media_1_btn. No image, no products, just text and a single URL.',
        expected: {
            kind: 'render_check',
            observe: [
                'text body visible',
                'one URL button',
                'no card / no image',
            ],
        },
        rcs_context: {
            text: 'B13: text-only with one URL button.',
            buttons: [
                {
                    type: 'URL',
                    text: 'Shop',
                    value: 'https://example.com/b13',
                },
            ],
        },
    },
    {
        id: 'B14',
        batch: 'visual',
        name: 'Text + 2 Quick Replies (no products, no image)',
        description:
            'Targets journey_quick_replies_2. AIJ-2097 risk: confirm whether QR template uses {{title}}/{{message_body}} or card_1_* placeholders.',
        expected: {
            kind: 'render_check',
            observe: [
                'text body visible',
                'two QR buttons',
                'no image',
                'note whether outer body renders as the card body or somewhere else',
            ],
        },
        rcs_context: {
            text: 'B14: text + 2 QR, no image.',
            buttons: [
                { type: 'QUICK_REPLY', text: 'B14 yes' },
                { type: 'QUICK_REPLY', text: 'B14 no' },
            ],
        },
    },
    {
        id: 'B15',
        batch: 'visual',
        name: 'Text + image + 2 Quick Replies',
        description:
            'Targets journey_quick_replies_2_with_media (or journey_1_card_2_qr — both match exact, first DB row wins).',
        expected: {
            kind: 'render_check',
            observe: ['text body visible', 'image visible', 'two QR buttons'],
        },
        rcs_context: {
            text: 'B15: text + image + 2 QR.',
            images: [PLACEHOLDER_IMAGE],
            buttons: [
                { type: 'QUICK_REPLY', text: 'B15 yes' },
                { type: 'QUICK_REPLY', text: 'B15 no' },
            ],
        },
    },
    {
        id: 'B16',
        batch: 'visual',
        name: 'Text + 3 Quick Replies (no image)',
        description:
            'Targets journey_quick_replies_3. Confirms 3-QR layout on iOS.',
        expected: {
            kind: 'render_check',
            observe: ['text body visible', 'three QR buttons', 'no image'],
        },
        rcs_context: {
            text: 'B16: text + 3 QR, no image.',
            buttons: [
                { type: 'QUICK_REPLY', text: 'B16 a' },
                { type: 'QUICK_REPLY', text: 'B16 b' },
                { type: 'QUICK_REPLY', text: 'B16 c' },
            ],
        },
    },
    {
        id: 'B17',
        batch: 'visual',
        name: 'Text + image + 3 Quick Replies',
        description: 'Targets journey_quick_replies_3_with_media.',
        expected: {
            kind: 'render_check',
            observe: ['text body visible', 'image visible', 'three QR buttons'],
        },
        rcs_context: {
            text: 'B17: text + image + 3 QR.',
            images: [PLACEHOLDER_IMAGE],
            buttons: [
                { type: 'QUICK_REPLY', text: 'B17 a' },
                { type: 'QUICK_REPLY', text: 'B17 b' },
                { type: 'QUICK_REPLY', text: 'B17 c' },
            ],
        },
    },
    {
        id: 'B18',
        batch: 'visual',
        name: 'Text + 4 Quick Replies (no image)',
        description:
            'Targets journey_quick_replies_4. Maximum QR count for the QR family.',
        expected: {
            kind: 'render_check',
            observe: ['text body visible', 'four QR buttons', 'no image'],
        },
        rcs_context: {
            text: 'B18: text + 4 QR, no image.',
            buttons: [
                { type: 'QUICK_REPLY', text: 'B18 a' },
                { type: 'QUICK_REPLY', text: 'B18 b' },
                { type: 'QUICK_REPLY', text: 'B18 c' },
                { type: 'QUICK_REPLY', text: 'B18 d' },
            ],
        },
    },
    {
        id: 'B19',
        batch: 'visual',
        name: 'Text + image + 4 Quick Replies',
        description: 'Targets journey_quick_replies_4_with_media.',
        expected: {
            kind: 'render_check',
            observe: ['text body visible', 'image visible', 'four QR buttons'],
        },
        rcs_context: {
            text: 'B19: text + image + 4 QR.',
            images: [PLACEHOLDER_IMAGE],
            buttons: [
                { type: 'QUICK_REPLY', text: 'B19 a' },
                { type: 'QUICK_REPLY', text: 'B19 b' },
                { type: 'QUICK_REPLY', text: 'B19 c' },
                { type: 'QUICK_REPLY', text: 'B19 d' },
            ],
        },
    },
]
