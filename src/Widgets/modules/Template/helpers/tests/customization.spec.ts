import {Template} from 'models/widget/types'

import {seekCardCustomization} from '../customization'
import {TemplateCustomization} from '../../types'

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

    it("should return the first matched customization if the absolutePath matches the dataMatcher's regex", () => {
        const result = seekCardCustomization(cardCustomization, {
            absolutePath: ['bar'],
        } as Template)

        expect(result).toEqual({
            editionHiddenFields: ['title'],
        })
    })

    it("should return the matched customization if the absolutePath matches the dataMatcher's regex and the templatePath matches the templateMatcher's regex", () => {
        const result = seekCardCustomization(cardCustomization, {
            absolutePath: ['foo'],
            templatePath: 'bar',
        } as Template)

        expect(result).toEqual({
            editionHiddenFields: ['color'],
        })
    })
})
