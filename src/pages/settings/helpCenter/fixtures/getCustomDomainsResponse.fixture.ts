import {
    CustomDomain,
    HelpCenterCustomDomainsListPage,
} from '../../../../models/helpCenter/types'

export const getCustomDomainsResponseFixture: HelpCenterCustomDomainsListPage = {
    object: 'list',
    data: [
        {
            id: 1,
            help_center_id: 1,
            hostname: 'chuck-norris.com',
            status: 'active',
            verification_errors: [],
            created_datetime: '2021-05-17T18:21:42.022Z',
            updated_datetime: '2021-05-17T18:21:42.022Z',
            deleted_datetime: undefined,
        },
        {
            id: 2,
            help_center_id: 2,
            hostname: 'pending-domain.com',
            status: 'pending',
            verification_errors: [],
            created_datetime: '2021-05-17T18:21:42.022Z',
            updated_datetime: '2021-05-17T18:21:42.022Z',
            deleted_datetime: undefined,
        },
        {
            id: 3,
            help_center_id: 3,
            hostname: 'unknown-domain.com',
            status: 'unknown',
            verification_errors: [],
            created_datetime: '2021-05-17T18:21:42.022Z',
            updated_datetime: '2021-05-17T18:21:42.022Z',
            deleted_datetime: undefined,
        },
    ],
    meta: {
        page: 1,
        per_page: 20,
        current_page: '/help-centers/1/custom-domains?page=1&per_page=20',
        item_count: 3,
        nb_pages: 1,
    },
}

export const getSingleCustomDomainResponseFixture: CustomDomain = {
    id: 1,
    help_center_id: 1,
    hostname: 'chuck-norris.com',
    status: 'active',
    verification_errors: [],
    created_datetime: '2021-05-17T18:21:42.022Z',
    updated_datetime: '2021-05-17T18:21:42.022Z',
    deleted_datetime: undefined,
}
