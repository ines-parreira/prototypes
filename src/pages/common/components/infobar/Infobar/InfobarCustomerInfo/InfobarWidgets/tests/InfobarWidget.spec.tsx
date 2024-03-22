import React, {ComponentProps} from 'react'
import {render, screen} from '@testing-library/react'
import {fromJS, Map} from 'immutable'

import {
    SHOPIFY_INTEGRATION_TYPE,
    BIGCOMMERCE_INTEGRATION_TYPE,
} from 'constants/integration'
import {Template} from 'models/widget/types'
import {Widget} from 'state/widgets/types'
import Card from 'Infobar/features/Card'
import {assumeMock, getLastMockCall} from 'utils/testing'

import InfobarWidget from '../InfobarWidget'
import {WidgetContext} from '../WidgetContext'

const defaultWidget = {} as Widget

const defaultSource: Map<string, unknown> = fromJS({
    ticket: {
        customer: {
            integrations: [
                {
                    foo: 'bar',
                },
            ],
        },
    },
})

const defaultTemplate: Template = {
    type: 'card',
    absolutePath: ['ticket', 'customer', 'integrations', '0'],
    title: 'Duh',
    widgets: [
        {
            path: '',
            type: 'card',
            title: 'Foo container',
            widgets: [],
        },
    ],
}

const defaultProps: ComponentProps<typeof InfobarWidget> = {
    template: defaultTemplate,
    source: defaultSource,
}

const CARD_MOCK_ID = 'card'

jest.mock('../widgets/shopify', () => {
    return () => {
        return {extensionUsed: 'shopify'}
    }
})

jest.mock('../widgets/bigcommerce', () => {
    return () => {
        return {extensionUsed: 'bigcommerce'}
    }
})

jest.mock('Infobar/features/Card', () =>
    jest.fn(() => <div data-testid={CARD_MOCK_ID}>Card</div>)
)
const mockedCard = assumeMock(Card)

describe('InfobarWidget', () => {
    describe('card widget', () => {
        it('should display the widget', () => {
            render(
                <WidgetContext.Provider value={defaultWidget}>
                    <InfobarWidget {...defaultProps} />
                </WidgetContext.Provider>
            )
            expect(screen.getByTestId(CARD_MOCK_ID))
        })

        it('should not display the widget if isEditing=false and data if falsy', () => {
            render(
                <WidgetContext.Provider value={defaultWidget}>
                    <InfobarWidget {...defaultProps} source={undefined} />
                </WidgetContext.Provider>
            )
            expect(screen.queryByTestId(CARD_MOCK_ID)).toBeNull()
        })

        it('should not display the widget if isEditing=true and data if falsy', () => {
            render(
                <WidgetContext.Provider value={defaultWidget}>
                    <InfobarWidget {...defaultProps} source={undefined} />
                </WidgetContext.Provider>
            )
            expect(screen.queryByTestId(CARD_MOCK_ID)).toBeNull()
        })

        it('should display the widget with Shopify extension because the widget type is Shopify', () => {
            render(
                <WidgetContext.Provider
                    value={{type: SHOPIFY_INTEGRATION_TYPE} as Widget}
                >
                    <InfobarWidget {...defaultProps} />
                </WidgetContext.Provider>
            )

            expect(getLastMockCall(mockedCard)[0].extensions).toEqual({
                extensionUsed: 'shopify',
            })
        })

        it('should display the widget with BigCommerce extension because the widget type is BigCommerce', () => {
            render(
                <WidgetContext.Provider
                    value={{type: BIGCOMMERCE_INTEGRATION_TYPE} as Widget}
                >
                    <InfobarWidget {...defaultProps} />
                </WidgetContext.Provider>
            )

            expect(getLastMockCall(mockedCard)[0].extensions).toEqual({
                extensionUsed: 'bigcommerce',
            })
        })
    })
})
