import {Actions} from '../../types'

export const actionConfigurationFixture: Actions[number] = {
    internal_id: '01HWMV7AMNQYX73B007W65T2SE',
    id: '01HWMV7AMNV8WZV9YN8588C868',
    account_id: 1,
    name: 'Action name',
    is_draft: false,
    initial_step_id: '01HW8C2C5ZTGG38MJ6JKZ7N3HH',
    entrypoint: null,
    steps: [
        {
            id: '01HW8C2C5ZTGG38MJ6JKZ7N3HH',
            kind: 'message',
            settings: {
                message: {
                    content: {
                        html: 'content',
                        text: 'content',
                        html_tkey: '01HW8C2C5ZFWE60385WZK53HGD',
                        text_tkey: '01HW8C2C5ZRW101CVNK57Y64E4',
                    },
                },
            },
        },
    ],
    transitions: [],
    available_languages: ['en-US'],
    created_datetime: '2024-04-29T11:53:11.586Z',
    updated_datetime: '2024-04-29T13:32:57.221Z',
    deleted_datetime: null,
    triggers: [
        {
            kind: 'llm-prompt',
            settings: {
                custom_inputs: [],
                object_inputs: [],
                output_description: '',
            },
        },
    ],
    entrypoints: [
        {
            kind: 'llm-conversation',
            trigger: 'llm-prompt',
            settings: {
                instructions: 'hi',
                requires_confirmation: true,
            },
            deactivated_datetime: '2024-04-29T13:32:57.190Z',
        },
    ],
}
