import type {
    Button,
    TemplateContext,
} from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/customActions/types'

import {
    computeButtonLength,
    computeNbButtonDisplayed,
} from '../computeNbButtonDisplayed'

describe('computeButtonLength', () => {
    it.each([
        ['label', { context: {}, variables: {} } as TemplateContext, 78],
        [
            'label{{var}}',
            {
                context: { var: 'xxx' },
                variables: {},
            } as unknown as TemplateContext,
            114,
        ],
    ])(
        'should compute length of %p with context %p',
        (label: string, context: TemplateContext, expected: number) => {
            expect(computeButtonLength(label, context)).toBe(expected)
        },
    )
})

describe('computeNbButtonDisplayed', () => {
    it.each([
        {
            buttons: [{ label: 'label1' }, { label: 'label2' }] as Button[],
            width: 50,
            expected: 2,
        },
        {
            buttons: [
                { label: 'label1' },
                { label: 'label2' },
                { label: 'label3' },
                { label: 'label4' },
                { label: 'label5' },
            ] as Button[],
            width: 600,
            expected: 5,
        },
        {
            buttons: [
                { label: 'label1' },
                { label: 'label2' },
                { label: 'label3' },
                { label: 'label4' },
            ] as Button[],
            width: 350,
            expected: 3,
        },
    ])(
        'should return number of displayed buttons with an available space of %s',
        ({ buttons, width, expected }) => {
            expect(
                computeNbButtonDisplayed(
                    buttons,
                    {
                        context: {},
                        variables: {},
                    } as TemplateContext,
                    width,
                ),
            ).toBe(expected)
        },
    )
})
