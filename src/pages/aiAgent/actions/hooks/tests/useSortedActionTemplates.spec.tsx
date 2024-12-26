import {renderHook} from '@testing-library/react-hooks'

import {WorkflowConfigurationBuilder} from 'pages/automate/workflows/models/workflowConfiguration.model'

import {TemplateConfiguration} from '../../types'
import useSortedActionTemplates from '../useSortedActionTemplates'

const b1 = new WorkflowConfigurationBuilder({
    id: 'id1',
    name: 'test template',
    initialStep: {
        id: 'http_request1',
        kind: 'http-request',
        settings: {
            url: 'https://example.com',
            method: 'GET',
            headers: {},
            name: 'test http request',
            variables: [],
        },
    },
    apps: [{type: 'recharge'}],
})

const template1 = b1.build<TemplateConfiguration>()

const b2 = new WorkflowConfigurationBuilder({
    id: 'id2',
    name: 'test template',
    initialStep: {
        id: 'http_request1',
        kind: 'http-request',
        settings: {
            url: 'https://example.com',
            method: 'GET',
            headers: {},
            name: 'test http request',
            variables: [],
        },
    },
    apps: [{type: 'shopify'}],
})

const template2 = b2.build<TemplateConfiguration>()

const b3 = new WorkflowConfigurationBuilder({
    id: 'id3',
    name: 'test template1',
    initialStep: {
        id: 'http_request1',
        kind: 'http-request',
        settings: {
            url: 'https://example.com',
            method: 'GET',
            headers: {},
            name: 'test http request',
            variables: [],
        },
    },
    apps: [{type: 'shopify'}],
})

const template3 = b3.build<TemplateConfiguration>()

const b4 = new WorkflowConfigurationBuilder({
    id: 'id4',
    name: 'test template',
    initialStep: {
        id: 'http_request1',
        kind: 'http-request',
        settings: {
            url: 'https://example.com',
            method: 'GET',
            headers: {},
            name: 'test http request',
            variables: [],
        },
    },
    apps: [{type: 'app', app_id: 'someid'}],
})

const template4 = b4.build<TemplateConfiguration>()

const b5 = new WorkflowConfigurationBuilder({
    id: 'id5',
    name: 'test template5',
    initialStep: {
        id: 'http_request1',
        kind: 'http-request',
        settings: {
            url: 'https://example.com',
            method: 'GET',
            headers: {},
            name: 'test http request',
            variables: [],
        },
    },
    apps: [{type: 'app', app_id: 'someid'}],
})

const template5 = b5.build<TemplateConfiguration>()

describe('useSortedActionTemplates()', () => {
    it('should return shopify templates first, recharge templates second and then app templates grouped by app id', () => {
        const {result} = renderHook(() =>
            useSortedActionTemplates([
                template1,
                template2,
                template3,
                template5,
                template4,
            ])
        )

        expect(result.current).toEqual([
            template2,
            template3,
            template1,
            template4,
            template5,
        ])
    })
})
