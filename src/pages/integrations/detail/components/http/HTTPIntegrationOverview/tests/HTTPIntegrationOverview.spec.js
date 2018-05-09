import React from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'
import HTTPIntegrationOverview from '../'

const actions = {
    deactivateIntegration: () => {},
    activateIntegration: () => {},
    deleteIntegration: () => {},
    updateOrCreateIntegration: () => {},
}

describe('HTTPIntegrationOverview', () => {
    it('should display default values because there is no integration (creation)', () => {
        const component = shallow(
            <HTTPIntegrationOverview
                integration={fromJS({})}
                isUpdate={false}
                actions={actions}
                loading={fromJS({integration: false})}
            />
        )

        expect(component).toMatchSnapshot()
    })

    it('should display data about the integration', () => {
        const component = shallow(
            <HTTPIntegrationOverview
                integration={fromJS({
                    id: 1,
                    type: 'http',
                    name: 'my little integration',
                    description: 'just a small integration, which is very practical and friendly',
                    http: {
                        headers: {
                            'Authorization': 'Bearer a57sd4as6d4',
                            'Foo': 'bar'
                        },
                        url: 'http://httpbin.org/post',
                        method: 'POST',
                        request_content_type: 'application/json',
                        response_content_type: 'application/json',
                        triggers: {
                            'ticket-created': true,
                            'ticket-updated': false
                        },
                        form: {
                            foo: 'bar',
                            baz: {
                                bazile: 'bazar'
                            }
                        }
                    }
                })}
                isUpdate={true}
                actions={actions}
                loading={fromJS({integration: false})}
            />
        )

        expect(component).toMatchSnapshot()
    })

    it('should display loading state because the integration is loading', () => {
        const component = shallow(
            <HTTPIntegrationOverview
                integration={fromJS({
                    id: 1,
                    type: 'http',
                    name: 'my little integration',
                    description: 'just a small integration, which is very practical and friendly',
                    http: {
                        headers: {
                            'Authorization': 'Bearer a57sd4as6d4',
                            'Foo': 'bar'
                        },
                        url: 'http://httpbin.org/post',
                        method: 'POST',
                        request_content_type: 'application/json',
                        response_content_type: 'application/json',
                        triggers: {
                            'ticket-created': true,
                            'ticket-updated': false
                        },
                        form: {
                            foo: 'bar',
                            baz: {
                                bazile: 'bazar'
                            }
                        }
                    }
                })}
                isUpdate={false}
                actions={actions}
                loading={fromJS({integration: true})}
            />
        )

        expect(component).toMatchSnapshot()
    })

    it('should display data with url-encoded format', () => {
        const component = shallow(
            <HTTPIntegrationOverview
                integration={fromJS({
                    id: 1,
                    type: 'http',
                    name: 'my little integration',
                    description: 'just a small integration, which is very practical and friendly',
                    http: {
                        headers: {
                            'Authorization': 'Bearer a57sd4as6d4',
                            'Foo': 'bar'
                        },
                        url: 'http://httpbin.org/post',
                        method: 'POST',
                        request_content_type: 'application/x-www-form-urlencoded',
                        response_content_type: 'application/json',
                        triggers: {
                            'ticket-created': true,
                            'ticket-updated': false
                        },
                        form: {
                            foo: 'bar',
                            baz: 'foo'
                        }
                    }
                })}
                isUpdate={true}
                actions={actions}
                loading={fromJS({integration: false})}
            />
        )

        expect(component).toMatchSnapshot()
    })
})
