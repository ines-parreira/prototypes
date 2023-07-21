import React, {ComponentProps} from 'react'
import {shallow} from 'enzyme'
import {fromJS} from 'immutable'

import {integrationBase} from 'fixtures/integrations'
import {
    HttpIntegration,
    HttpIntegrationMeta,
    IntegrationType,
} from 'models/integration/types'
import {ContentType, HttpMethod} from 'models/api/types'

import {Integration} from '../Integration'

const baseHttp: HttpIntegrationMeta = {
    headers: {
        Authorization: 'Bearer a57sd4as6d4',
        Foo: 'bar',
    },
    url: 'http://httpbin.org/post',
    method: HttpMethod.Post,
    execution_order: 1,
    id: 1,
    request_content_type: ContentType.Json,
    response_content_type: ContentType.Json,
    triggers: {
        'ticket-created': true,
        'ticket-updated': false,
        'ticket-message-created': false,
    },
    form: {
        foo: 'bar',
        baz: {
            bazile: 'bazar',
        },
    },
}

const baseIntegration: HttpIntegration = {
    ...integrationBase,
    type: IntegrationType.Http,
    http: baseHttp,
    meta: {},
}

describe('Integration', () => {
    const minProps: ComponentProps<typeof Integration> = {
        integration: undefined,
        isUpdate: false,
        loading: {},
        deactivateIntegration: jest.fn(),
        activateIntegration: jest.fn(),
        deleteIntegration: jest.fn(),
        updateOrCreateIntegration: jest.fn(),
    }
    it('should display default values because there is no integration (creation)', () => {
        const component = shallow(<Integration {...minProps} />)

        expect(component).toMatchSnapshot()
    })

    it('should display data about the integration', () => {
        const component = shallow(
            <Integration
                {...minProps}
                integration={baseIntegration}
                isUpdate={true}
            />
        )

        expect(component).toMatchSnapshot()
    })

    it('should display loading state because the integration is loading', () => {
        const component = shallow(<Integration {...minProps} isUpdate={true} />)

        expect(component).toMatchSnapshot()
    })

    it('should display data with url-encoded format', () => {
        const component = shallow(
            <Integration
                {...minProps}
                integration={{
                    ...baseIntegration,
                    http: {
                        ...baseHttp,
                        request_content_type: ContentType.Form,
                    },
                }}
                isUpdate={true}
                loading={fromJS({integration: false})}
            />
        )

        expect(component).toMatchSnapshot()
    })
})
