import React from 'react'
import {render} from '@testing-library/react'

import {CardTemplate} from 'models/widget/types'
import {assumeMock, getLastMockCall} from 'utils/testing'

import {Action} from '../types'
import {Links} from '../Links/Links'
import {ActionButtons} from '../ActionButtons/ActionButtons'
import CustomActions from '../index'

jest.mock('../Links/Links')
jest.mock('../ActionButtons/ActionButtons')
const LinksMock = assumeMock(Links)
const ActionButtonsMock = assumeMock(ActionButtons)

describe('<ActionButtons/>', () => {
    const template = {
        templatePath: 'templatePath',
        absolutePath: ['absolutePath'],
        meta: {
            custom: {
                links: [
                    {label: 'link', url: 'heaven'},
                    {
                        label: 'the link above is a link to heaven',
                        url: 'over the rainbow',
                    },
                ],
                buttons: [
                    {
                        label: 'button - 1',
                        action: 'whatever' as unknown as Action,
                    },
                    {
                        label: 'button - 2',
                        action: 'whatever',
                    },
                ],
            },
        },
    } as CardTemplate
    const source = {}

    it('should call Links and ActionButtons with correct props', () => {
        render(
            <CustomActions
                template={template}
                source={source}
                isEditing={false}
            />
        )
        expect(getLastMockCall(LinksMock)[0]).toEqual({
            templatePath: template.templatePath,
            absolutePath: template.absolutePath,
            source: {},
            links: template.meta?.custom?.links,
            isEditing: false,
        })
        expect(getLastMockCall(ActionButtonsMock)[0]).toEqual({
            templatePath: template.templatePath,
            absolutePath: template.absolutePath,
            source: {},
            buttons: template.meta?.custom?.buttons,
            isEditing: false,
        })
    })

    it('should render links and buttons with isEditing prop', () => {
        render(<CustomActions template={template} source={source} isEditing />)
        expect(getLastMockCall(LinksMock)[0].isEditing).toBe(true)
        expect(getLastMockCall(ActionButtonsMock)[0].isEditing).toBe(true)
    })
})
