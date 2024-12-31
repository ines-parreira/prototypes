import {getCredentialsStatus, getInitialConfiguration} from '../utils'

describe('getInitialConfiguration()', () => {
    it('should return initial Action configuration', () => {
        expect(getInitialConfiguration()).toEqual({
            available_languages: [],
            entrypoints: [
                {
                    deactivated_datetime: null,
                    kind: 'llm-conversation',
                    settings: {
                        instructions: '',
                        requires_confirmation: false,
                    },
                    trigger: 'llm-prompt',
                },
            ],
            id: expect.any(String),
            initial_step_id: expect.any(String),
            internal_id: expect.any(String),
            is_draft: false,
            name: '',
            steps: [
                {
                    id: expect.any(String),
                    kind: 'http-request',
                    settings: {
                        headers: {},
                        method: 'GET',
                        name: '',
                        url: '',
                        variables: [
                            {
                                id: expect.any(String),
                                name: 'Request result',
                                jsonpath: '$',
                                data_type: null,
                            },
                        ],
                    },
                },
            ],
            transitions: [],
            triggers: [
                {
                    kind: 'llm-prompt',
                    settings: {
                        custom_inputs: [],
                        object_inputs: [],
                        outputs: [
                            {
                                description: '',
                                id: expect.any(String),
                                path: expect.any(String),
                            },
                        ],
                    },
                },
            ],
        })
    })
})

describe('getCredentialsStatus()', () => {
    it('returns hasCredentials true when app type is app, not template, and has api_key', () => {
        const result = getCredentialsStatus(
            {type: 'app', app_id: '123', api_key: 'valid-key'},
            {type: 'app'},
            false
        )
        expect(result).toEqual({
            hasMissingCredentials: false,
            hasCredentials: true,
        })
    })

    it('returns both false when app type is not app', () => {
        const result = getCredentialsStatus(
            {type: 'shopify'},
            {type: 'shopify'},
            false
        )
        expect(result).toEqual({
            hasMissingCredentials: false,
            hasCredentials: false,
        })
    })

    it('returns both false when isTemplate is true', () => {
        const result = getCredentialsStatus(
            {type: 'app', app_id: '123'},
            {type: 'app'},
            true
        )
        expect(result).toEqual({
            hasMissingCredentials: false,
            hasCredentials: false,
        })
    })

    it('returns hasMissingCredentials true when graphApp is undefined', () => {
        const result = getCredentialsStatus(undefined, {type: 'app'}, false)
        expect(result).toEqual({
            hasCredentials: true,
            hasMissingCredentials: false,
        })
    })
})
