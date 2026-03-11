export const migrationStatsWithFailures = {
    articles: {
        errors_count: 5,
        errors_details: Array.from({ length: 5 }, (_, i) => ({
            error_message: 'sample exception',
            instance_id: '3886032' + String(i),
            instance_title: 'Untitled article',
        })),
        export_count: 11,
        import_count: 4,
    },
    categories: {
        errors_count: 4,
        errors_details: Array.from({ length: 4 }, (_, i) => ({
            error_message: 'sample exception',
            instance_id: '3886032' + String(i),
            instance_title: 'Untitled collection',
        })),
        export_count: 6,
        import_count: 0,
    },
}

export const migrationStatsWithoutFailures = {
    articles: {
        errors_count: 0,
        errors_details: [],
        export_count: 11,
        import_count: 7,
    },
    categories: {
        errors_count: 0,
        errors_details: [],
        export_count: 6,
        import_count: 2,
    },
}

export const emptyMigrationStats = {
    articles: {
        errors_count: 0,
        errors_details: [],
        export_count: 0,
        import_count: 0,
    },
    categories: {
        errors_count: 0,
        errors_details: [],
        export_count: 0,
        import_count: 0,
    },
}

export const failedMigrationStats = {
    articles: {
        errors_count: 12,
        errors_details: Array.from({ length: 12 }, (_, i) => ({
            error_message: 'sample exception',
            instance_id: '3886032' + String(i),
            instance_title: 'Untitled article',
        })),
        export_count: 12,
        import_count: 0,
    },
    categories: {
        errors_count: 7,
        errors_details: Array.from({ length: 12 }, (_, i) => ({
            error_message: 'sample exception',
            instance_id: '3886032' + String(i),
            instance_title: 'Untitled collection',
        })),
        export_count: 7,
        import_count: 0,
    },
}

export const succeededMigrationStats = {
    articles: {
        errors_count: 0,
        errors_details: [],
        export_count: 11,
        import_count: 11,
    },
    categories: {
        errors_count: 0,
        errors_details: [],
        export_count: 6,
        import_count: 6,
    },
}

export const partiallySucceededMigrationStats = {
    articles: {
        errors_count: 2,
        errors_details: Array.from({ length: 2 }, (_, i) => ({
            error_message: 'sample exception',
            instance_id: '3886032' + String(i),
            instance_title: 'Untitled article',
        })),
        export_count: 12,
        import_count: 10,
    },
    categories: {
        errors_count: 2,
        errors_details: Array.from({ length: 2 }, (_, i) => ({
            error_message: 'sample exception',
            instance_id: '3886032' + String(i),
            instance_title: 'Untitled collection',
        })),
        export_count: 7,
        import_count: 5,
    },
}

export const migrationSessions = [
    {
        result: {
            progress: 100.0,
            segments: [
                {
                    failures: [],
                    messages: [],
                    status: 'SUCCESS',
                    title: 'Export categories',
                    warnings: [],
                },
                {
                    failures: [],
                    messages: [],
                    status: 'SUCCESS',
                    title: 'Export articles',
                    warnings: [],
                },
                {
                    failures: [],
                    messages: [],
                    status: 'SUCCESS',
                    title: 'Export assets',
                    warnings: [],
                },
                {
                    failures: [],
                    messages: [
                        {
                            level: 'WARNING',
                            message:
                                'Translation with "ro" locale of HelpCenter None - "None" is dropped because can\'t match locale',
                        },
                        {
                            level: 'WARNING',
                            message:
                                'Translation with "en-gb" locale of {node.__class__.__name__} None - "None" is dropped because found better match',
                        },
                        {
                            level: 'WARNING',
                            message:
                                'Translation with "ro" locale of Category 10655225950097 - "Gorgias Migration (real) (romanian)" is dropped because can\'t match locale',
                        },
                        {
                            level: 'WARNING',
                            message:
                                'Translation with "ro" locale of Category 10655259655057 - "Gorgias migration subcategory (romanian)" is dropped because can\'t match locale',
                        },
                        {
                            level: 'WARNING',
                            message:
                                'Translation with "ro" locale of Category 10635677478801 - "Fake migration romanian (draft)" is dropped because can\'t match locale',
                        },
                        {
                            level: 'WARNING',
                            message:
                                'Translation with "ro" locale of Article 10655705735953 - "Draft article romanian" is dropped because can\'t match locale',
                        },
                    ],
                    status: 'SUCCESS',
                    title: 'Transform',
                    warnings: [],
                },
                {
                    failures: [],
                    messages: [],
                    status: 'SUCCESS',
                    title: 'Import categories',
                    warnings: [],
                },
                {
                    failures: [],
                    messages: [],
                    status: 'SUCCESS',
                    title: 'Import articles',
                    warnings: [],
                },
                {
                    failures: [],
                    messages: [],
                    status: 'SUCCESS',
                    title: 'Import assets',
                    warnings: [],
                },
            ],
            status: 'SUCCESS',
        },
        stats: migrationStatsWithoutFailures,
        session: {
            migration: {
                provider: {
                    api_key: '**********',
                    email: 'ordersone@gmail.com',
                    meta: {
                        docs_url:
                            'https://support.zendesk.com/hc/en-us/articles/4408889192858-Generating-a-new-API-token',
                        logo_url:
                            'https://storage.googleapis.com/gorgias-help-center-production-hotswap/gm/icons/zendesk.png',
                        site_url: 'https://www.zendesk.com',
                        title: 'Zendesk',
                    },
                    subdomain: 'gorgias',
                    type: 'Zendesk',
                },
                receiver: {
                    api_key: '**********',
                    email: 'engineering-hiring@gorgias.com',
                    help_center_id: 11994,
                    subdomain: 'self-serve',
                    type: 'Gorgias',
                },
                type: 'HelpCenter',
            },
            webhook_url: null,
        },
        session_id: 'e60c7fc6-eeed-419a-996c-711241db0d25',
        status: 'SUCCESS',
    },
    {
        result: {
            progress: 34,
            segments: [
                {
                    failures: [],
                    messages: [],
                    status: 'SUCCESS',
                    title: 'Export categories',
                    warnings: [],
                },
                {
                    failures: [],
                    messages: [],
                    status: 'SUCCESS',
                    title: 'Export articles',
                    warnings: [],
                },
                {
                    failures: [],
                    messages: [],
                    status: 'SUCCESS',
                    title: 'Export assets',
                    warnings: [],
                },
                {
                    failures: [],
                    messages: [
                        {
                            level: 'WARNING',
                            message:
                                'Translation with "ro" locale of HelpCenter None - "None" is dropped because can\'t match locale',
                        },
                        {
                            level: 'WARNING',
                            message:
                                'Translation with "en-gb" locale of {node.__class__.__name__} None - "None" is dropped because found better match',
                        },
                        {
                            level: 'WARNING',
                            message:
                                'Translation with "ro" locale of Category 10655225950097 - "Gorgias Migration (real) (romanian)" is dropped because can\'t match locale',
                        },
                        {
                            level: 'WARNING',
                            message:
                                'Translation with "ro" locale of Category 10655259655057 - "Gorgias migration subcategory (romanian)" is dropped because can\'t match locale',
                        },
                        {
                            level: 'WARNING',
                            message:
                                'Translation with "ro" locale of Category 10635677478801 - "Fake migration romanian (draft)" is dropped because can\'t match locale',
                        },
                        {
                            level: 'WARNING',
                            message:
                                'Translation with "ro" locale of Article 10655705735953 - "Draft article romanian" is dropped because can\'t match locale',
                        },
                    ],
                    status: 'SUCCESS',
                    title: 'Transform',
                    warnings: [],
                },
                {
                    failures: [],
                    messages: [],
                    status: 'SUCCESS',
                    title: 'Import categories',
                    warnings: [],
                },
                {
                    failures: [],
                    messages: [],
                    status: 'SUCCESS',
                    title: 'Import articles',
                    warnings: [],
                },
                {
                    failures: [],
                    messages: [],
                    status: 'SUCCESS',
                    title: 'Import assets',
                    warnings: [],
                },
            ],
            status: 'RUNNING',
        },
        stats: migrationStatsWithFailures,
        session: {
            migration: {
                provider: {
                    api_key: '**********',
                    email: 'ordersone@gmail.com',
                    meta: {
                        docs_url:
                            'https://support.zendesk.com/hc/en-us/articles/4408889192858-Generating-a-new-API-token',
                        logo_url:
                            'https://storage.googleapis.com/gorgias-help-center-production-hotswap/gm/icons/zendesk.png',
                        site_url: 'https://www.zendesk.com',
                        title: 'Zendesk',
                    },
                    subdomain: 'gorgias',
                    type: 'Zendesk',
                },
                receiver: {
                    api_key: '**********',
                    email: 'engineering-hiring@gorgias.com',
                    help_center_id: 11994,
                    subdomain: 'self-serve',
                    type: 'Gorgias',
                },
                type: 'HelpCenter',
            },
            webhook_url: null,
        },
        session_id: 'e60c7fc6-eeed-419a-996c-711241db0d26',
        status: 'RUNNING',
    },
]
