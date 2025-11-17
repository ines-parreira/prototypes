import { LEAF_TYPES } from 'models/widget/constants'
import type { CardTemplate, LeafTemplate, LeafType } from 'models/widget/types'

import type { FieldCustomization, TemplateCustomization } from '../../types'
import { seekCardCustomization, seekFieldCustomization } from '../customization'

describe('seekCardCustomization', () => {
    const cardCustomization = [
        {
            dataMatcher: /bar/,
            templateMatcher: /bar/,
            customization: {
                editionHiddenFields: ['title'],
            },
        },
        {
            dataMatcher: /foo/,
            templateMatcher: /bar/,
            customization: {
                editionHiddenFields: ['color'],
            },
        },
        {
            dataMatcher: /bar/,
            customization: {
                editionHiddenFields: ['title'],
            },
        },
        {
            dataMatcher: /bar/,
            customization: {
                editionHiddenFields: ['pictureUrl'],
            },
        },
    ] as TemplateCustomization['card']

    it('should allow cardCustomization and absolute path to be undefined and return empty object', () => {
        const result = seekCardCustomization(undefined, {} as CardTemplate)

        expect(result).toEqual({})
    })

    it("should return the first matched customization if the absolutePath matches the dataMatcher's regex", () => {
        const result = seekCardCustomization(cardCustomization, {
            absolutePath: ['bar'],
        } as CardTemplate)

        expect(result).toEqual({
            editionHiddenFields: ['title'],
        })
    })

    it("should return the matched customization if the absolutePath matches the dataMatcher's regex and the templatePath matches the templateMatcher's regex", () => {
        const result = seekCardCustomization(cardCustomization, {
            absolutePath: ['foo'],
            templatePath: 'bar',
        } as CardTemplate)

        expect(result).toEqual({
            editionHiddenFields: ['color'],
        })
    })
})

describe('seekFieldCustomization', () => {
    const getValueMock = jest.fn()
    const getValueStringMock = jest.fn()
    const source = { whatever: 'pumpkin' }
    const template = {
        absolutePath: ['bar'],
        type: LEAF_TYPES.TEXT,
    } as LeafTemplate

    const getters = {
        getValue: getValueMock,
        getValueString: getValueStringMock,
    }

    getValueMock.mockReturnValue('value')
    getValueStringMock.mockReturnValue('valueString')

    const defaultMatchingCustomization: FieldCustomization = {
        dataMatcher: /bar/,
        type: template.type as LeafType,
        ...getters,
    }

    it('should allow fieldExtensionArray to be undefined and return an empty object', () => {
        const result = seekFieldCustomization(undefined, source, template)

        expect(result).toEqual({})
    })

    it.each([
        [
            [
                {
                    dataMatcher: /foo/,
                    ...getters,
                },
                {
                    type: LEAF_TYPES.DATE,
                    ...getters,
                },
                {
                    dataMatcher: /bar/,
                    type: LEAF_TYPES.DATE,
                    ...getters,
                },
            ],
        ],
        [[]],
    ])(
        'should return an empty customization object when there is no match',
        (customization) => {
            const result = seekFieldCustomization(
                customization,
                source,
                template,
            )

            expect(result.value).toBeUndefined()
        },
    )

    it.each([
        [
            [
                {
                    type: template.type as LeafType,
                    ...getters,
                },
            ],
        ],
        [
            [
                {
                    dataMatcher: /bar/,
                    ...getters,
                },
            ],
        ],
        [[defaultMatchingCustomization]],
    ])(
        'should return a filled customization object when there is a match',
        (customization) => {
            const result = seekFieldCustomization(
                customization,
                source,
                template,
            )

            expect(result.value).toBe('value')
            expect(result.copyableValue).toBe('valueString')
        },
    )

    it('should call getValue and getValueString with the source and template', () => {
        seekFieldCustomization([defaultMatchingCustomization], source, template)

        expect(getValueMock).toHaveBeenCalledWith(source, template)
        expect(getValueStringMock).toHaveBeenCalledWith(source, template)
    })

    it('should return the customization of the last matched field extension', () => {
        const result = seekFieldCustomization(
            [
                defaultMatchingCustomization,
                {
                    ...defaultMatchingCustomization,
                    valueCanOverflow: true,
                    editionHiddenFields: ['title'],
                },
            ],
            source,
            template,
        )

        expect(result).toEqual(
            expect.objectContaining({
                value: 'value',
                copyableValue: 'valueString',
                editionHiddenFields: ['title'],
                valueCanOverflow: true,
            }),
        )
    })
})
