import {HelpCenter} from '../../../../models/helpCenter/types'

/**
 * This file will be removed once the CMS deployed in production
 */

export const getHelpCentersResponseFixture: HelpCenter[] = [
    {
        id: 1,
        subdomain: 'acme',
        name: 'ACME Helpcenter',
        deactivated_datetime: null,
        created_datetime: '2021-05-17T18:21:42.022Z',
        updated_datetime: '2021-05-17T18:21:42.022Z',
        deleted_datetime: undefined,
        default_locale: 'en-US',
        supported_locales: ['en-US'],
        search_deactivated_datetime: '2021-05-17T18:21:42.022Z',
        powered_by_deactivated_datetime: null,
        algolia_api_key: null,

        primary_color: '#4A8DF9',
        theme: 'light',
    },
    {
        id: 2,
        subdomain: 'acme2',
        name: 'ACME Helpcenter 2',
        deactivated_datetime: null,
        created_datetime: '2021-05-17T18:22:42.022Z',
        updated_datetime: '2021-05-17T18:22:42.022Z',
        deleted_datetime: undefined,
        default_locale: 'de-DE',
        supported_locales: ['en-US', 'de-DE'],
        search_deactivated_datetime: null,
        powered_by_deactivated_datetime: '2021-05-17T18:22:42.022Z',
        algolia_api_key: null,

        primary_color: '#4A8DF9',
        theme: 'light',
    },
    {
        id: 3,
        subdomain: 'acme3',
        name: 'ACME Helpcenter 3',
        deactivated_datetime: null,
        created_datetime: '2021-05-17T18:23:42.022Z',
        updated_datetime: '2021-05-17T18:23:42.022Z',
        deleted_datetime: undefined,
        default_locale: 'fr-FR',
        supported_locales: ['en-US', 'fr-FR'],
        search_deactivated_datetime: null,
        powered_by_deactivated_datetime: null,
        algolia_api_key: null,

        primary_color: '#4A8DF9',
        theme: 'light',
    },
]

export const getSingleHelpcenterResponseFixture: HelpCenter = {
    id: 1,
    subdomain: 'acme',
    name: 'ACME Helpcenter',
    deactivated_datetime: null,
    created_datetime: '2021-05-17T18:21:42.022Z',
    updated_datetime: '2021-05-17T18:21:42.022Z',
    deleted_datetime: undefined,
    default_locale: 'en-US',
    supported_locales: ['en-US', 'fr-FR'],
    search_deactivated_datetime: null,
    powered_by_deactivated_datetime: 'powered_by_deactivated_datetime',
    algolia_api_key: null,
    primary_color: '#4A8DF9',
    theme: 'light',
}
