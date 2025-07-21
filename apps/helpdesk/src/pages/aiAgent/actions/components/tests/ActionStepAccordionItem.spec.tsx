import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, screen } from '@testing-library/react'

import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { renderWithRouter } from 'utils/testing'

import ActionStepAccordionItem, {
    ActionStepAccordionItemProps,
} from '../ActionStepAccordionItem'

const queryClient = mockQueryClient()

describe('<ActionStepAccordionItem />', () => {
    const defaultProps = {
        step: {
            kind: 'cancel-order',
            success: true,
            at: '2024-12-27T20:07:04.061Z',
            stepId: 'cancel_order_step_id',
        },
        templateConfigurations: [
            {
                internal_id: 'custom_step_internal_id',
                id: 'custom_step_id',
                name: 'Custom Step',
                initial_step_id: 'nested_step_1',
                steps: [
                    {
                        id: 'nested_step_1',
                        kind: 'http-request',
                        settings: {
                            name: 'get posts',
                            url: 'https://jsonplaceholder.typicode.com/posts',
                            method: 'GET',
                        },
                    },
                    {
                        id: 'nested_step_2',
                        kind: 'conditions',
                        settings: {
                            name: 'condition',
                        },
                    },
                    {
                        id: 'nested_step_3',
                        kind: 'http-request',
                        settings: {
                            name: 'get comments',
                            url: 'https://jsonplaceholder.typicode.com/comments?postId={{steps_state.nested_step_1.content.01JFSBCPSD8XG30GMEXBRSFF9Y}}',
                            method: 'GET',
                        },
                    },
                ],
                created_datetime: '2024-12-20T15:30:01.804Z',
                updated_datetime: '2024-12-27T18:44:42.069Z',
                triggers: [
                    {
                        kind: 'reusable-llm-prompt',
                        settings: {
                            outputs: [],
                            custom_inputs: [],
                            object_inputs: [],
                        },
                    },
                ],
                apps: [
                    {
                        type: 'shopify',
                    },
                ],
            },
            {
                internal_id: 'cancel_order_internal_id',
                id: 'cancel_order_id',
                name: 'Cancel Order',
                initial_step_id: 'cancel_order_step_id',
                steps: [
                    {
                        id: 'cancel_order_step_id',
                        kind: 'cancel-order',
                    },
                    {
                        id: 'llm_step_id',
                        kind: 'reusable-llm-prompt-call',
                        settings: {
                            values: {},
                            objects: {},
                            custom_inputs: {},
                            configuration_id: 'custom_step_id',
                            configuration_internal_id:
                                'custom_step_internal_id',
                        },
                    },
                    {
                        id: 'http_request_id',
                        kind: 'http-request',
                        settings: {
                            name: 'get users',
                            url: 'https://jsonplaceholder.typicode.com/users',
                            method: 'GET',
                            headers: {},
                            body: null,
                            variables: [],
                            oauth2_token_settings: null,
                        },
                    },
                    {
                        id: '01JFQHWTA1C12QWG8A45PFQ53V',
                        kind: 'end',
                        settings: {
                            success: true,
                        },
                    },
                ],
                created_datetime: '2024-12-19T08:52:35.895Z',
                updated_datetime: '2024-12-22T16:09:17.745Z',
                apps: [
                    {
                        type: 'shopify',
                    },
                ],
            },
        ],
        httpExecutionLogs: [
            {
                id: 'log_id_1',
                request_url: 'https://jsonplaceholder.typicode.com/users',
                request_method: 'GET',
                request_body: null,
                request_headers: '{}',
                request_datetime: '2024-12-27T20:07:04.645Z',
                response_status_code: 200,
                response_headers:
                    '{"date":"Fri, 27 Dec 2024 20:07:04 GMT","content-type":"application/json; charset=utf-8","transfer-encoding":"chunked","connection":"close","report-to":"{\\"group\\":\\"heroku-nel\\",\\"max_age\\":3600,\\"endpoints\\":[{\\"url\\":\\"https://nel.heroku.com/reports?ts=1735011208&sid=e11707d5-02a7-43ef-b45e-2cf4d2036f7d&s=45pF2e7arFLyHGaVfBuhEnPzpxBEflftiszF00JqtkA%3D\\"}]}","reporting-endpoints":"heroku-nel=https://nel.heroku.com/reports?ts=1735011208&sid=e11707d5-02a7-43ef-b45e-2cf4d2036f7d&s=45pF2e7arFLyHGaVfBuhEnPzpxBEflftiszF00JqtkA%3D","nel":"{\\"report_to\\":\\"heroku-nel\\",\\"max_age\\":3600,\\"success_fraction\\":0.005,\\"failure_fraction\\":0.05,\\"response_headers\\":[\\"Via\\"]}","x-powered-by":"Express","x-ratelimit-limit":"1000","x-ratelimit-remaining":"998","x-ratelimit-reset":"1735011227","vary":"Origin, Accept-Encoding","access-control-allow-credentials":"true","cache-control":"max-age=43200","pragma":"no-cache","expires":"-1","x-content-type-options":"nosniff","etag":"W/\\"160d-1eMSsxeJRfnVLRBmYJSbCiJZ1qQ\\"","via":"1.1 vegur","cf-cache-status":"HIT","age":"1356","server":"cloudflare","cf-ray":"8f8bef4e8fdbe59e-OTP","alt-svc":"h3=\\":443\\"; ma=86400","server-timing":"cfL4;desc=\\"?proto=TCP&rtt=3005&min_rtt=2164&rtt_var=1412&sent=3&recv=5&lost=0&retrans=0&sent_bytes=219&recv_bytes=935&delivery_rate=646950&cwnd=250&unsent_bytes=0&cid=5766515c916be607&ts=19&x=0\\""}',
                response_body:
                    '[{"id":1,"name":"Leanne Graham","username":"Bret","email":"Sincere@april.biz","address":{"street":"Kulas Light","suite":"Apt. 556","city":"Gwenborough","zipcode":"92998-3874","geo":{"lat":"-37.3159","lng":"81.1496"}},"phone":"1-770-736-8031 x56442","website":"hildegard.org","company":{"name":"Romaguera-Crona","catchPhrase":"Multi-layered client-server neural-net","bs":"harness real-time e-markets"}}]',
                step_id: 'http_request_id',
            },
            {
                id: 'log_id_2',
                request_url:
                    'https://jsonplaceholder.typicode.com/comments?postId=1',
                request_method: 'GET',
                request_body: null,
                request_headers: '{}',
                request_datetime: '2024-12-27T20:07:04.130Z',
                response_status_code: 200,
                response_headers:
                    '{"date":"Fri, 27 Dec 2024 20:07:04 GMT","content-type":"application/json; charset=utf-8","transfer-encoding":"chunked","connection":"close","report-to":"{\\"group\\":\\"heroku-nel\\",\\"max_age\\":3600,\\"endpoints\\":[{\\"url\\":\\"https://nel.heroku.com/reports?ts=1730560841&sid=e11707d5-02a7-43ef-b45e-2cf4d2036f7d&s=qreV6Bgh%2FcoNZdVyU3Httg1%2FdCDNMvpoODAJkK5Qgsk%3D\\"}]}","reporting-endpoints":"heroku-nel=https://nel.heroku.com/reports?ts=1730560841&sid=e11707d5-02a7-43ef-b45e-2cf4d2036f7d&s=qreV6Bgh%2FcoNZdVyU3Httg1%2FdCDNMvpoODAJkK5Qgsk%3D","nel":"{\\"report_to\\":\\"heroku-nel\\",\\"max_age\\":3600,\\"success_fraction\\":0.005,\\"failure_fraction\\":0.05,\\"response_headers\\":[\\"Via\\"]}","x-powered-by":"Express","x-ratelimit-limit":"1000","x-ratelimit-remaining":"995","x-ratelimit-reset":"1730560854","vary":"Origin, Accept-Encoding","access-control-allow-credentials":"true","cache-control":"max-age=43200","pragma":"no-cache","expires":"-1","x-content-type-options":"nosniff","etag":"W/\\"5e6-4bSPS5tq8F8ZDeFJULWh6upjp7U\\"","via":"1.1 vegur","cf-cache-status":"REVALIDATED","server":"cloudflare","cf-ray":"8f8bef4b5d1b0545-OTP","alt-svc":"h3=\\":443\\"; ma=86400","server-timing":"cfL4;desc=\\"?proto=TCP&rtt=2611&min_rtt=2601&rtt_var=996&sent=3&recv=5&lost=0&retrans=0&sent_bytes=219&recv_bytes=947&delivery_rate=521803&cwnd=250&unsent_bytes=0&cid=6ba57a25f5424f71&ts=484&x=0\\""}',
                response_body:
                    '[{"postId":1,"id":1,"name":"id labore ex et quam laborum","email":"Eliseo@gardner.biz","body":"laudantium enim quasi est quidem magnam voluptate ipsam eos\\ntempora quo necessitatibus\\ndolor quam autem quasi\\nreiciendis et nam sapiente accusantium"},{"postId":1,"id":2,"name":"quo vero reiciendis velit similique earum","email":"Jayne_Kuhic@sydney.com","body":"est natus enim nihil est dolore omnis voluptatem numquam\\net omnis occaecati quod ullam at\\nvoluptatem error expedita pariatur\\nnihil sint nostrum voluptatem reiciendis et"},{"postId":1,"id":3,"name":"odio adipisci rerum aut animi","email":"Nikita@garfield.biz","body":"quia molestiae reprehenderit quasi aspernatur\\naut expedita occaecati aliquam eveniet laudantium\\nomnis quibusdam delectus saepe quia accusamus maiores nam est\\ncum et ducimus et vero voluptates excepturi deleniti ratione"},{"postId":1,"id":4,"name":"alias odio sit","email":"Lew@alysha.tv","body":"non et atque\\noccaecati deserunt quas accusantium unde odit nobis qui voluptatem\\nquia voluptas consequuntur itaque dolor\\net qui rerum deleniti ut occaecati"},{"postId":1,"id":5,"name":"vero eaque aliquid doloribus et culpa","email":"Hayden@althea.biz","body":"harum non quasi et ratione\\ntempore iure ex voluptates in ratione\\nharum architecto fugit inventore cupiditate\\nvoluptates magni quo et"}]',
                step_id: 'nested_step_1',
            },
            {
                id: 'log_id_3',
                request_url: 'https://jsonplaceholder.typicode.com/posts',
                request_method: 'GET',
                request_body: null,
                request_headers: '{}',
                request_datetime: '2024-12-27T20:07:04.070Z',
                response_status_code: 200,
                response_headers:
                    '{"date":"Fri, 27 Dec 2024 20:07:04 GMT","content-type":"application/json; charset=utf-8","transfer-encoding":"chunked","connection":"close","report-to":"{\\"group\\":\\"heroku-nel\\",\\"max_age\\":3600,\\"endpoints\\":[{\\"url\\":\\"https://nel.heroku.com/reports?ts=1733930953&sid=e11707d5-02a7-43ef-b45e-2cf4d2036f7d&s=wAGs1UH4lgdjgMOReQ7HPoJNKbsTszqppvzZ%2F8dUMSs%3D\\"}]}","reporting-endpoints":"heroku-nel=https://nel.heroku.com/reports?ts=1733930953&sid=e11707d5-02a7-43ef-b45e-2cf4d2036f7d&s=wAGs1UH4lgdjgMOReQ7HPoJNKbsTszqppvzZ%2F8dUMSs%3D","nel":"{\\"report_to\\":\\"heroku-nel\\",\\"max_age\\":3600,\\"success_fraction\\":0.005,\\"failure_fraction\\":0.05,\\"response_headers\\":[\\"Via\\"]}","x-powered-by":"Express","x-ratelimit-limit":"1000","x-ratelimit-remaining":"999","x-ratelimit-reset":"1733930985","vary":"Origin, Accept-Encoding","access-control-allow-credentials":"true","cache-control":"max-age=43200","pragma":"no-cache","expires":"-1","x-content-type-options":"nosniff","etag":"W/\\"6b80-Ybsq/K6GwwqrYkAsFxqDXGC7DoM\\"","via":"1.1 vegur","cf-cache-status":"HIT","age":"21551","server":"cloudflare","cf-ray":"8f8bef4b0d59e4a9-OTP","alt-svc":"h3=\\":443\\"; ma=86400","server-timing":"cfL4;desc=\\"?proto=TCP&rtt=2854&min_rtt=2606&rtt_var=1154&sent=4&recv=5&lost=0&retrans=0&sent_bytes=2825&recv_bytes=680&delivery_rate=1611665&cwnd=252&unsent_bytes=0&cid=ddfa26ad6688cf8a&ts=15&x=0\\""}',
                response_body:
                    '[{"userId":1,"id":1,"title":"sunt aut facere repellat provident occaecati excepturi optio reprehenderit","body":"quia et suscipit\\nsuscipit recusandae consequuntur expedita et cum\\nreprehenderit molestiae ut ut quas totam\\nnostrum rerum est autem sunt rem eveniet architecto"}]',
                step_id: 'nested_step_3',
            },
        ],
        parentTemplateConfiguration: {
            internal_id: 'cancel_order_id',
            id: 'cancel_order_id',
            name: 'Cancel Order',
            initial_step_id: 'cancel_order_step_id',
            steps: [
                {
                    id: 'cancel_order_step_id',
                    kind: 'cancel-order',
                    settings: {
                        customer_id: '{{objects.customer.id}}',
                        integration_id: '{{store.helpdesk_integration_id}}',
                        order_external_id: '{{objects.order.external_id}}',
                    },
                },
                {
                    id: 'llm_step_id',
                    kind: 'reusable-llm-prompt-call',
                    settings: {
                        values: {},
                        objects: {},
                        custom_inputs: {},
                        configuration_id: 'custom_step_id',
                        configuration_internal_id: 'custom_step_internal_id',
                    },
                },
                {
                    id: 'http_request_id',
                    kind: 'http-request',
                    settings: {
                        name: 'get users',
                        url: 'https://jsonplaceholder.typicode.com/users',
                        method: 'GET',
                        headers: {},
                        body: null,
                        variables: [],
                        oauth2_token_settings: null,
                    },
                },
                {
                    id: '01JFQHWTA1C12QWG8A45PFQ53V',
                    kind: 'end',
                    settings: {
                        success: true,
                    },
                },
                {
                    id: '01JFQJ1VW1QS0W3VGYKHGEB0CZ',
                    kind: 'end',
                    settings: {
                        success: false,
                    },
                },
                {
                    id: '01JFQHWJXDHKBE5B0K5CQT6689',
                    kind: 'end',
                    settings: {
                        success: false,
                    },
                },
                {
                    id: '01JFF1WK4770B48QG1V7M931W8',
                    kind: 'end',
                    settings: {
                        success: false,
                    },
                },
            ],
            created_datetime: '2024-12-19T08:52:35.895Z',
            updated_datetime: '2024-12-22T16:09:17.745Z',
            apps: [
                {
                    type: 'shopify',
                },
            ],
        },
    } as unknown as ActionStepAccordionItemProps

    const httpRequestStepProps = {
        ...defaultProps,
        step: {
            ...defaultProps.parentTemplateConfiguration?.steps[2],
            stepId: defaultProps.parentTemplateConfiguration?.steps[2].id,
            success: true,
        },
    } as unknown as ActionStepAccordionItemProps

    const nestedStepProps = {
        ...defaultProps,
        step: {
            kind: 'reusable-llm-prompt-call',
            store: {
                type: 'shopify',
                name: 'shopify-test',
                helpdesk_integration_id: 1,
            },
            objects: {},
            apps: {},
            success: true,
            steps_state: {
                nested_step_1: {
                    kind: 'http-request',
                    status_code: 200,
                    success: true,
                    content: {
                        '01JFSBCPSD8XG30GMEXBRSFF9Y': '1',
                    },
                    at: '2024-12-27T20:07:04.128Z',
                },
                nested_step_2: {
                    kind: 'end',
                    success: true,
                    at: '2024-12-27T20:07:04.641Z',
                },

                nested_step_3: {
                    kind: 'http-request',
                    status_code: 200,
                    success: true,
                    content: {
                        '01JFSBFRBH3S30YYC178EPJBGW': 'mail@mail.biz',
                    },
                    at: '2024-12-27T20:07:04.640Z',
                },
            },
            at: '2024-12-27T20:07:04.067Z',
            stepId: 'llm_step_id',
        },
    } as unknown as ActionStepAccordionItemProps

    it('should render step name and status', () => {
        renderWithRouter(
            <QueryClientProvider client={queryClient}>
                <ActionStepAccordionItem {...defaultProps} />
            </QueryClientProvider>,
        )

        expect(screen.getByText('Cancel order.')).toBeInTheDocument()
        expect(screen.getByText('Status')).toBeInTheDocument()
        expect(screen.getByText('SUCCESS')).toBeInTheDocument()
    })

    it('should display execution logs', () => {
        renderWithRouter(
            <QueryClientProvider client={queryClient}>
                <ActionStepAccordionItem {...httpRequestStepProps} />
            </QueryClientProvider>,
        )

        const stepElement = document.getElementById('step_3')
        if (stepElement) {
            fireEvent.click(stepElement)
        }

        expect(
            screen.getByText('https://jsonplaceholder.typicode.com/users'),
        ).toBeInTheDocument()
        expect(screen.getByText('SUCCESS')).toBeInTheDocument()
    })

    it('should handle nested template configurations', () => {
        renderWithRouter(
            <QueryClientProvider client={queryClient}>
                <ActionStepAccordionItem {...nestedStepProps} />
            </QueryClientProvider>,
        )

        expect(screen.getByText('Custom Step')).toBeInTheDocument()
        expect(screen.getByText('get posts')).toBeInTheDocument()
        expect(screen.getByText('get comments')).toBeInTheDocument()
        expect(screen.getAllByText(/https:\/\/jsonplaceholder/)).toHaveLength(2)
    })

    it('should display error state correctly', () => {
        const errorProps = {
            ...defaultProps,
            step: {
                ...defaultProps.step,
                success: false,
            },
            httpExecutionLogs: [
                {
                    ...defaultProps.httpExecutionLogs?.[0],
                    response_status_code: 500,
                },
            ],
        } as unknown as ActionStepAccordionItemProps

        renderWithRouter(
            <QueryClientProvider client={queryClient}>
                <ActionStepAccordionItem {...errorProps} />
            </QueryClientProvider>,
        )

        fireEvent.click(screen.getByText('Cancel order.'))
        expect(screen.getByText('ERROR')).toBeInTheDocument()
    })
})
