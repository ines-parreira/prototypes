import {getInitialConfiguration} from '../utils'

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
