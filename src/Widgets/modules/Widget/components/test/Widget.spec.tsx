import React, { ComponentProps, ReactNode } from 'react'

import { render } from '@testing-library/react'
import { fromJS } from 'immutable'

import Placeholder from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/Placeholder'
import { assumeMock } from 'utils/testing'
import { WidgetContextProvider } from 'Widgets/contexts/WidgetContext'
import Template from 'Widgets/modules/Template'
import Widget from 'Widgets/modules/Widget'

import { getWidgetByType } from '../../helpers/getWidgetByType'

jest.mock('Widgets/modules/Template')
jest.mock('../../helpers/getWidgetByType')
jest.mock(
    'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/Placeholder',
)
jest.mock(
    'Widgets/contexts/WidgetContext',
    () =>
        ({
            ...jest.requireActual('Widgets/contexts/WidgetContext'),
            WidgetContextProvider: jest.fn(
                ({ children }: { children: ReactNode }) => children,
            ),
        }) as Record<string, unknown>,
)
const TemplateMock = assumeMock(Template)
const PlaceholderMock = assumeMock(Placeholder)
const WidgetContextProviderMock = assumeMock(WidgetContextProvider)
const getWidgetByTypeMock = assumeMock(getWidgetByType)

describe('Widget', () => {
    const props = {
        isEditing: true,
        index: 0,
        widget: fromJS({}),
        template: fromJS({
            type: '',
        }),
        source: fromJS({}),
        absolutePath: '["whatever"]',
    } as ComponentProps<typeof Widget>

    const passedTemplate = {
        ...props.template.toJS(),
        templatePath: '0.template',
        absolutePath: ['whatever'],
    }

    beforeEach(() => {
        PlaceholderMock.mockReturnValue(<></>)
        TemplateMock.mockReturnValue(<></>)
    })

    it('should set WidgetContext', () => {
        render(<Widget {...props} />)
        expect(WidgetContextProviderMock).toHaveBeenCalledWith(
            {
                value: props.widget,
                children: expect.anything(),
            },
            expect.anything(),
        )
    })

    it("should render Placeholder if type is 'placeholder'", () => {
        render(<Widget {...props} type="placeholder" />)

        expect(PlaceholderMock).toHaveBeenCalledWith(
            {
                isEditing: true,
                template: passedTemplate,
            },
            expect.anything(),
        )
    })

    it('should render Template if no component is returned by getWidgetByType', () => {
        getWidgetByTypeMock.mockReturnValue(undefined)

        render(<Widget {...props} />)

        expect(TemplateMock).toHaveBeenCalledWith(
            {
                source: props.source?.toJS(),
                template: passedTemplate,
            },
            expect.anything(),
        )
    })

    it('should render the component returned by getWidgetByType', () => {
        const ReturnedComponent = jest.fn(() => <></>)
        getWidgetByTypeMock.mockReturnValue(ReturnedComponent)

        render(<Widget {...props} />)

        expect(ReturnedComponent).toHaveBeenCalledWith(
            {
                source: props.source?.toJS(),
                template: passedTemplate,
            },
            expect.anything(),
        )
    })
})
