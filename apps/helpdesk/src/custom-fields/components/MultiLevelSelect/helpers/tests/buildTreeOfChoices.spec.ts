import type { CustomFieldValue } from 'custom-fields/types'

import type { ChoicesTree } from '../../types'
import { buildTreeOfChoices } from '../buildTreeOfChoices'

describe('buildTreeOfChoices', () => {
    it('should return a tree of choices for strings', () => {
        expect(
            buildTreeOfChoices([
                'Fulfilment::Missing item',
                'Fulfilment::Wrong item',
                'hello',
                'Shipping::WISMO',
            ]),
        ).toEqual(
            new Map([
                [
                    'Fulfilment::branch',
                    {
                        value: null,
                        children: new Map([
                            [
                                'Missing item::leaf',
                                { value: 'Missing item', children: new Map() },
                            ],
                            [
                                'Wrong item::leaf',
                                { value: 'Wrong item', children: new Map() },
                            ],
                        ]),
                    },
                ],
                ['hello::leaf', { value: 'hello', children: new Map() }],
                [
                    'Shipping::branch',
                    {
                        value: null,
                        children: new Map([
                            [
                                'WISMO::leaf',
                                { value: 'WISMO', children: new Map() },
                            ],
                        ]),
                    },
                ],
            ]),
        )
    })

    it.each([
        [
            [101, 420, 1337] as CustomFieldValue[],
            new Map([
                ['101::leaf', { value: 101, children: new Map() }],
                ['420::leaf', { value: 420, children: new Map() }],
                ['1337::leaf', { value: 1337, children: new Map() }],
            ]),
        ],
    ])(
        'should return a flat structure for numbers and booleans',
        (input: CustomFieldValue[], output: ChoicesTree) => {
            expect(buildTreeOfChoices(input)).toEqual(output)
        },
    )
})
