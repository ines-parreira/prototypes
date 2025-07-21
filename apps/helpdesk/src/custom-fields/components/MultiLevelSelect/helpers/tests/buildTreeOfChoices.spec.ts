import { CHOICE_VALUES_SYMBOL } from '../../constants'
import { buildTreeOfChoices } from '../buildTreeOfChoices'

describe('buildTreeOfChoices', () => {
    it('should return a tree of choices for strings', () => {
        expect(
            buildTreeOfChoices([
                'Fulfilment::Missing item',
                'Fulfilment::Wrong item',
                'hello',
                'Shipping::WISMO',
                'Warranty & Damage::Broken::In Window::left',
                'Warranty & Damage::Broken::Outside Window',
                'Warranty & Damage::Question',
            ]),
        ).toMatchInlineSnapshot(`
            {
              "Fulfilment": {
                Symbol(value): Set {
                  "Missing item",
                  "Wrong item",
                },
              },
              "Shipping": {
                Symbol(value): Set {
                  "WISMO",
                },
              },
              "Warranty & Damage": {
                "Broken": {
                  "In Window": {
                    Symbol(value): Set {
                      "left",
                    },
                  },
                  Symbol(value): Set {
                    "Outside Window",
                  },
                },
                Symbol(value): Set {
                  "Question",
                },
              },
              Symbol(value): Set {
                "hello",
              },
            }
        `)
    })

    it.each([
        [
            [101, 420, 1337],
            { [CHOICE_VALUES_SYMBOL]: new Set([101, 420, 1337]) },
        ],
    ])(
        'should return a flat structure for numbers and booleans',
        (
            input: Parameters<typeof buildTreeOfChoices>[0],
            output: ReturnType<typeof buildTreeOfChoices>,
        ) => {
            expect(buildTreeOfChoices(input)).toEqual(output)
        },
    )
})
