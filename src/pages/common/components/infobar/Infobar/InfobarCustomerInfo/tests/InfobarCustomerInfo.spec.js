import React from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'

import {InfobarCustomerInfo} from '../InfobarCustomerInfo'


const actions = {
    setEditedWidgets: jest.fn(),
    setEditionAsDirty: jest.fn(),
    resetWidgets: jest.fn(),
    generateAndSetWidgets: jest.fn()
}

describe('InfobarCustomerInfo component', () => {
    it('should not render because there is no passed customer', () => {
        const component = shallow(
            <InfobarCustomerInfo
                actions={actions}
                customer={null}
                sources={fromJS({})}
                widgets={fromJS({})}
                hasIntegrations={true}
                isEditing={false}
            />
        )

        expect(component).toEqual({})
    })

    it('should not render because the passed customer is empty', () => {
        const component = shallow(
            <InfobarCustomerInfo
                actions={actions}
                sources={fromJS({})}
                customer={fromJS({})}
                widgets={fromJS({})}
                hasIntegrations={true}
                isEditing={false}
            />
        )

        expect(component).toEqual({})
    })

    it('should render basic customer info and a "generate widgets" button because customer data are loaded, the user ' +
        'is currently editing widgets, it is not currently dragging anything and widgets are currently empty',
    () => {
        const sources = fromJS({
            ticket: {
                customer:{
                    integrations: {
                        118: {
                            foo: 'bar'
                        }
                    }
                }
            }
        })

        const widgets = fromJS({
            currentContext: 'ticket',
            _internal: {
                drag: {isDragging: false},
                editedItems: [{template: {}}],
                hasFetchedWidgets: true
            },
            items: []
        })

        const component = shallow(
            <InfobarCustomerInfo
                actions={actions}
                sources={sources}
                widgets={widgets}
                customer={fromJS({id: 1, name: 'foo'})}
                isEditing
                hasIntegrations
            />
        )

        expect(component).toMatchSnapshot()
    })

    it('should render basic customer info and empty widgets because customer data are loaded, the user is currently ' +
        'editing widgets and it is dragging a widget -- even though widgets are currently empty', () => {
        const sources = fromJS({
            ticket: {
                customer:{
                    integrations: {
                        118: {
                            foo: 'bar'
                        }
                    }
                }
            }
        })

        const widgets = fromJS({
            currentContext: 'ticket',
            _internal: {
                drag: {isDragging: true},
                editedItems: [{template: {}}],
                hasFetchedWidgets: true
            },
            items: []
        })

        const component = shallow(
            <InfobarCustomerInfo
                actions={actions}
                sources={sources}
                widgets={widgets}
                customer={fromJS({id: 1, name: 'foo'})}
                isEditing
                hasIntegrations
            />
        )

        expect(component).toMatchSnapshot()
    })

    it('should render only basic customer info because customer data are loaded, the user is not editing widgets and ' +
        'current widgets are empty', () => {
        const sources = fromJS({
            ticket: {
                customer:{
                    integrations: {
                        118: {
                            foo: 'bar'
                        }
                    }
                }
            }
        })

        const widgets = fromJS({
            currentContext: 'ticket',
            _internal: {hasFetchedWidgets: true},
            items: []
        })

        const component = shallow(
            <InfobarCustomerInfo
                actions={actions}
                sources={sources}
                widgets={widgets}
                customer={fromJS({id: 1, name: 'foo'})}
                isEditing={false}
                hasIntegrations
            />
        )

        expect(component).toMatchSnapshot()
    })

    it('sources render basic customer info and widgets because there is customer data, the user is not editing ' +
        'widgets and current widgets are not empty', () => {
        const sources = fromJS({
            ticket: {
                customer:{
                    integrations: {
                        118: {
                            foo: 'bar'
                        }
                    }
                }
            }
        })

        const context = 'ticket'

        const widgets = fromJS({
            currentContext: context,
            _internal: {hasFetchedWidgets: true},
            items: [{
                id: 1,
                context,
                template: {foo: 'bar'}
            }]
        })

        const component = shallow(
            <InfobarCustomerInfo
                actions={actions}
                sources={sources}
                widgets={widgets}
                customer={fromJS({id: 1, name: 'foo'})}
                isEditing={false}
                hasIntegrations
            />
        )

        expect(component).toMatchSnapshot()
    })

    it('should render only basic customer info because there is no customer data and there is some data integrations ' +
        'configured for the account', () => {
        const component = shallow(
            <InfobarCustomerInfo
                actions={actions}
                sources={fromJS({})}
                widgets={fromJS({currentContext: 'ticket'})}
                customer={fromJS({id: 1, name: 'foo'})}
                isEditing={false}
                hasIntegrations
            />
        )

        expect(component).toMatchSnapshot()
    })

    it('should render basic customer info and the suggestion to add integrations because there is no customer data ' +
        'and there is no data integrations configured for the account', () => {
        const component = shallow(
            <InfobarCustomerInfo
                actions={actions}
                sources={fromJS({})}
                widgets={fromJS({currentContext: 'ticket'})}
                customer={fromJS({id: 1, name: 'foo'})}
                isEditing={false}
                hasIntegrations={false}
            />
        )

        expect(component).toMatchSnapshot()
    })
})
