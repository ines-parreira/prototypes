import {Components} from 'rest_api/help_center_api/client.generated'

export const PageEmbedmentFixture: Components.Schemas.PageEmbedmentDto = {
    id: 1,
    page_external_id: '229672878386',
    page_title: 'My page title',
    page_path_url: 'my-page-title',
    position: 'TOP',
    created_datetime: '2023-08-11T14:00:22.283Z',
    updated_datetime: '2023-08-11T14:00:22.283Z',
}

export const PageEmbedmentsListFixture: Components.Schemas.PageEmbedmentDto[] =
    [
        {
            id: 1,
            page_external_id: '229672878386',
            page_title: 'My page title',
            page_path_url: 'my-page-title',
            position: 'TOP',
            created_datetime: '2023-08-11T14:00:22.283Z',
            updated_datetime: '2023-08-11T14:00:22.283Z',
        },
        {
            id: 2,
            page_external_id: '129672878386',
            page_title: 'My 2nd page title',
            page_path_url: 'my-2nd-page-title',
            position: 'BOTTOM',
            created_datetime: '2023-08-11T14:00:22.283Z',
            updated_datetime: '2023-08-11T14:00:22.283Z',
        },
    ]

export const PageEmbedmentsEmptyListFixture = []

export const PageEmbedmentsGeneric500ErrorFixture = {
    error: {
        msg: 'An error occured',
    },
    status: 500,
    code: 'INTERNAL_SERVER_ERROR_EXCEPTION',
    message: 'An error occured',
} as const
