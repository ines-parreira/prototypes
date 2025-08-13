import { CustomFieldValue } from 'custom-fields/types'

import { ChoicesTree } from '../../types'
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
                    'Fulfilment',
                    {
                        value: 'Fulfilment',
                        children: new Map([
                            [
                                'Missing item',
                                { value: 'Missing item', children: new Map() },
                            ],
                            [
                                'Wrong item',
                                { value: 'Wrong item', children: new Map() },
                            ],
                        ]),
                    },
                ],
                ['hello', { value: 'hello', children: new Map() }],
                [
                    'Shipping',
                    {
                        value: 'Shipping',
                        children: new Map([
                            ['WISMO', { value: 'WISMO', children: new Map() }],
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
                ['101', { value: 101, children: new Map() }],
                ['420', { value: 420, children: new Map() }],
                ['1337', { value: 1337, children: new Map() }],
            ]),
        ],
    ])(
        'should return a flat structure for numbers and booleans',
        (input: CustomFieldValue[], output: ChoicesTree) => {
            expect(buildTreeOfChoices(input)).toEqual(output)
        },
    )
})
