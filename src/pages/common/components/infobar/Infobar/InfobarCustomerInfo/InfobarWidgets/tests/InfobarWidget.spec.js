import {shallow} from 'enzyme'
import React from 'react'
import {fromJS} from 'immutable'

import {
    MAGENTO2_INTEGRATION_TYPE,
    RECHARGE_INTEGRATION_TYPE,
    SHOPIFY_INTEGRATION_TYPE,
} from '../../../../../../../../constants/integration'

import InfobarWidget from '../InfobarWidget'

const defaultWidget = fromJS({})

const defaultSource = fromJS({
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

const defaultTemplate = fromJS({
    type: 'card',
    path: ['ticket', 'customer', 'integrations', '0'],
    title: 'Duh',
    widgets: [
        {
            path: '',
            type: 'card',
            title: 'Foo container',
            widgets: [],
        },
    ],
})

const defaultProps = {
    widget: defaultWidget,
    template: defaultTemplate,
    isEditing: false,
    source: defaultSource,
}

jest.mock('../widgets/shopify', () => {
    return () => {
        return {extensionUsed: 'shopify'}
    }
})

jest.mock('../widgets/recharge', () => {
    return () => {
        return {extensionUsed: 'recharge'}
    }
})

jest.mock('../widgets/magento2', () => {
    return () => {
        return {extensionUsed: 'magento2'}
    }
})

describe('InfobarWidget', () => {
    describe('card widget', () => {
        it('should display the widget if isEditing=true', () => {
            const component = shallow(
                <InfobarWidget {...defaultProps} isEditing={true} />
            )
            expect(component.debug()).toMatchSnapshot()
        })

        it('should not display the widget if isEditing=false and data if falsy', () => {
            const component = shallow(
                <InfobarWidget
                    {...defaultProps}
                    isEditing={false}
                    source={undefined}
                />
            )
            expect(component.debug()).toMatchSnapshot()
        })

        it('should not display the widget if isEditing=true and data if falsy', () => {
            const component = shallow(
                <InfobarWidget
                    {...defaultProps}
                    isEditing={true}
                    source={undefined}
                />
            )
            expect(component.debug()).toMatchSnapshot()
        })

        it('should display the widget with Shopify extension because the widget type is Shopify', () => {
            const component = shallow(
                <InfobarWidget
                    {...defaultProps}
                    widget={fromJS({type: SHOPIFY_INTEGRATION_TYPE})}
                    isEditing={true}
                />
            )

            expect(component).toMatchSnapshot()
        })

        it('should display the widget with Recharge extension because the widget type is Recharge', () => {
            const component = shallow(
                <InfobarWidget
                    {...defaultProps}
                    widget={fromJS({type: RECHARGE_INTEGRATION_TYPE})}
                    isEditing={true}
                />
            )

            expect(component).toMatchSnapshot()
        })

        it('should display the widget with Magento2 extension because the widget type is Magento2', () => {
            const component = shallow(
                <InfobarWidget
                    {...defaultProps}
                    widget={fromJS({type: MAGENTO2_INTEGRATION_TYPE})}
                    isEditing={true}
                />
            )

            expect(component).toMatchSnapshot()
        })

        describe('invalid card widget data', () => {
            const invalidData = [
                ['object', {aaa: 'bbb'}],
                ['string', 'foo'],
                ['boolean', true],
                ['array', [1, 2]],
                ['number', 1],
                ['undefined', undefined],
            ]
            for (const dataSet of invalidData) {
                const [name, data] = dataSet
                it(`should not throw if card widget data is ${name}`, () => {
                    const source = defaultSource.setIn(
                        ['ticket', 'customer', 'integrations', '0'],
                        data
                    )
                    expect(() => {
                        shallow(
                            <InfobarWidget {...defaultProps} source={source} />
                        )
                    }).not.toThrow()
                })
            }
        })
    })
})
