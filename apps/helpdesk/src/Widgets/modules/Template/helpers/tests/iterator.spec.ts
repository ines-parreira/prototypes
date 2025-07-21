import { CardTemplate, ListTemplate, Source } from 'models/widget/types'

import { seekNextValues } from '../iterator'

const childTemplate1: CardTemplate = {
    type: 'card',
    path: 'path1',
    widgets: [],
}

const childTemplate2: CardTemplate = {
    type: 'card',
    path: 'path2',
    widgets: [],
}

const listChildTemplate: CardTemplate = {
    type: 'card',
    widgets: [],
}

const cardTemplate: CardTemplate = {
    type: 'card',
    widgets: [childTemplate1, childTemplate2],
    templatePath: 'templatePath',
    absolutePath: ['absolutePath'],
}

const listTemplate: ListTemplate = {
    type: 'list',
    widgets: [listChildTemplate],
    templatePath: 'templatePath',
    absolutePath: ['absolutePath'],
}

const parentSource: Source = {
    path1: 'source1',
    path2: 'source2',
}

describe('seekNextValues', () => {
    it('should return the next template and source', () => {
        const parentSource: Source = {
            path1: 'source1',
            path2: 'source2',
        }
        const templateIndex = 1
        const result = seekNextValues(cardTemplate, parentSource, templateIndex)
        expect(result).toEqual({
            parentTemplate: cardTemplate,
            template: {
                ...childTemplate2,
                templatePath: 'templatePath.widgets.1',
                absolutePath: ['absolutePath', 'path2'],
            },
            source: 'source2',
        })
    })

    it('should handle the case of parentTemplate being a list', () => {
        const result = seekNextValues(listTemplate, parentSource)
        expect(result).toEqual({
            parentTemplate: listTemplate,
            template: {
                ...listChildTemplate,
                templatePath: 'templatePath.widgets.0',
                absolutePath: ['absolutePath', '[]'],
            },
            source: parentSource,
        })
    })

    it('should handle the case of parentSource not being a record', () => {
        const result = seekNextValues(cardTemplate, undefined)
        expect(result).toEqual({
            parentTemplate: cardTemplate,
            template: {
                ...childTemplate1,
                templatePath: 'templatePath.widgets.0',
                absolutePath: ['absolutePath', 'path1'],
            },
            source: undefined,
        })
    })

    it('should handle the case of parentTemplate not having widgets', () => {
        const result = seekNextValues(
            { ...cardTemplate, widgets: [] },
            parentSource,
        )
        expect(result).toEqual({
            parentTemplate: { ...cardTemplate, widgets: [] },
            template: null,
            source: parentSource,
        })
    })
})
