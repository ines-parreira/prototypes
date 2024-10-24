import {render, screen} from '@testing-library/react'
import {fromJS} from 'immutable'
import React, {ComponentProps} from 'react'

import useAppSelector from 'hooks/useAppSelector'
import {Template} from 'models/widget/types'
import {Widget} from 'state/widgets/types'
import {assumeMock} from 'utils/testing'
import {WidgetContext} from 'Widgets/contexts/WidgetContext'

import Placeholder from '../Placeholder'

jest.mock('hooks/useAppSelector', () => jest.fn())
jest.mock('hooks/useAppDispatch', () => jest.fn())

const useAppSelectorMock = assumeMock(useAppSelector)

describe('PlaceholderWidget component', () => {
    const integrationId = 1
    const minProps: ComponentProps<typeof Placeholder> = {
        template: {
            absolutePath: ['ticket', 'customer', 'integrations', integrationId],
            templatePath: '0.template',
        } as Template,
    }

    it('should display the integration type if the widget is not for an HTTP integration', () => {
        useAppSelectorMock.mockReturnValue(null)
        render(
            <WidgetContext.Provider
                value={
                    {
                        type: 'shopify',
                    } as Widget
                }
            >
                <Placeholder {...minProps} />
            </WidgetContext.Provider>
        )

        expect(screen.getByText('Widget for Shopify data'))
    })

    it('should display the integration name if the widget is for an HTTP integration', () => {
        useAppSelectorMock.mockReturnValue(
            fromJS({
                id: integrationId,
                type: 'http',
                name: 'my little integration http',
            })
        )

        render(
            <WidgetContext.Provider
                value={
                    {
                        type: 'http',
                        integration_id: integrationId,
                    } as Widget
                }
            >
                <Placeholder {...minProps} />
            </WidgetContext.Provider>
        )

        expect(screen.getByText('Widget for my little integration http data'))
    })
})
