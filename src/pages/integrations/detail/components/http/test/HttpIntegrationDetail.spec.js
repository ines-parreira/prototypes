import React from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'
import HttpIntegrationDetail from '../HttpIntegrationDetail'

describe('HttpIntegrationDetail component', () => {
    it('should display data about the integration', () => {
        const component = shallow(
            <HttpIntegrationDetail
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
                actions={{
                    deactivateIntegration: () => {},
                    activateIntegration: () => {},
                    deleteIntegration: () => {},
                    updateOrCreateIntegration: () => {},
                }}
                loading={fromJS({integration: false})}
            />
        )

        expect(component).toMatchSnapshot()
    })

    it('should display default if it\'s a new integration', () => {
        const component = shallow(
            <HttpIntegrationDetail
                integration={fromJS({})}
                isUpdate={false}
                actions={{
                    deactivateIntegration: () => {},
                    activateIntegration: () => {},
                    deleteIntegration: () => {},
                    updateOrCreateIntegration: () => {},
                }}
                loading={fromJS({integration: false})}
            />
        )

        expect(component).toMatchSnapshot()
    })

    it('should display loading state if the integration is loading', () => {
        const component = shallow(
            <HttpIntegrationDetail
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
                actions={{
                    deactivateIntegration: () => {},
                    activateIntegration: () => {},
                    deleteIntegration: () => {},
                    updateOrCreateIntegration: () => {},
                }}
                loading={fromJS({integration: true})}
            />
        )

        expect(component).toMatchSnapshot()
    })
})
