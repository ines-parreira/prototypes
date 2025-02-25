import React, { ComponentProps } from 'react'

import { fireEvent, render } from '@testing-library/react'
import { fromJS, List, Map } from 'immutable'

import { basicMonthlyHelpdeskPlan } from 'fixtures/productPrices'
import { AccountFeature } from 'state/currentAccount/types'

import {
    ADS_MANAGEMENT,
    ADS_READ,
    ADVERTISE_ROLE,
    ANALYZE_ROLE,
    BUSINESS_MANAGEMENT,
    INSTAGRAM_BASIC,
    INSTAGRAM_MANAGE_COMMENTS,
    INSTAGRAM_MANAGE_MESSAGES,
    MODERATE_ROLE,
    PAGES_MANAGE_ADS,
    PAGES_MANAGE_ENGAGEMENT,
    PAGES_MANAGE_METADATA,
    PAGES_MANAGE_POSTS,
    PAGES_MESSAGING,
    PAGES_READ_ENGAGEMENT,
    PAGES_READ_USER_CONTENT,
    PAGES_SHOW_LIST,
    PERMISSIONS_PER_INTEGRATION_META_SETTING,
} from '../../utils'
import { FacebookIntegrationSetupContainer } from '../FacebookIntegrationSetup'

const allPermissions = [
    PAGES_MANAGE_ADS,
    PAGES_MANAGE_METADATA,
    PAGES_READ_ENGAGEMENT,
    PAGES_READ_USER_CONTENT,
    PAGES_MANAGE_POSTS,
    PAGES_MANAGE_ENGAGEMENT,
    BUSINESS_MANAGEMENT,
    PAGES_SHOW_LIST,
    PAGES_MESSAGING,
    INSTAGRAM_BASIC,
    INSTAGRAM_MANAGE_COMMENTS,
    INSTAGRAM_MANAGE_MESSAGES,
    ADS_READ,
    ADS_MANAGEMENT,
].join(',')

jest.mock('pages/common/components/Loader/Loader', () => () => (
    <div>Loader</div>
))

describe('FacebookIntegrationSetup', () => {
    const minProps: ComponentProps<typeof FacebookIntegrationSetupContainer> = {
        loading: fromJS({
            updateIntegration: false,
        }),
        integrations: fromJS([]),
        pagination: fromJS({
            page: 1,
            nb_pages: 1,
            per_page: 1,
            item_count: 1,
        }),
        currentAccount: fromJS({
            domain: 'acme',
        }),
        currentHelpdeskProduct: basicMonthlyHelpdeskPlan,
        fetchFacebookOnboardingIntegrations: jest.fn(() => Promise.resolve()),
        activateOnboardingIntegrations: jest.fn(() => Promise.resolve()),
        fetchIntegrations: jest.fn(() => Promise.resolve()),
    }

    const onboardingIntegrations: List<any> = fromJS([
        {
            id: 1,
            meta: {
                name: 'My page',
                about: 'A page about stuff',
                picture: {
                    data: { url: 'https://gorgias.io/page-image-link.png' },
                },
            },
        },
    ])

    it('should render an empty list because there is no integrations to display', () => {
        const { queryByRole } = render(
            <FacebookIntegrationSetupContainer {...minProps} />,
        )

        expect(queryByRole('img')).toBeNull()
    })

    it('should render integrations because there is available data and and it is not loading', () => {
        const { getAllByRole } = render(
            <FacebookIntegrationSetupContainer
                {...minProps}
                integrations={onboardingIntegrations}
            />,
        )

        expect(getAllByRole('img')).not.toBeNull()
    })

    it('should render a loader because integrations are currently being fetched', () => {
        const { getByText } = render(
            <FacebookIntegrationSetupContainer
                {...minProps}
                integrations={onboardingIntegrations}
                pagination={fromJS({ nb_pages: 2 })}
            />,
        )

        fireEvent.click(getByText('keyboard_arrow_right'))

        expect(getByText('Loader')).toBeInTheDocument()
    })

    it('should render the integration as enabled with canModerate enabled because it has MODERATE_ROLE', () => {
        const integrations = onboardingIntegrations
            .setIn([0, 'meta', 'instagram', 'id'], 'foo')
            .setIn([0, 'meta', 'oauth', 'scope'], allPermissions)
            .setIn(
                [0, 'meta', 'roles'],
                [ADVERTISE_ROLE, ANALYZE_ROLE, MODERATE_ROLE].join(','),
            )

        const { container, getAllByRole } = render(
            <FacebookIntegrationSetupContainer
                {...minProps}
                integrations={integrations}
            />,
        )

        fireEvent.click(getAllByRole('checkbox')[0])

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render the integration with canModerate disabled because there is no MODERATE_ROLE', () => {
        const { container } = render(
            <FacebookIntegrationSetupContainer
                {...minProps}
                integrations={onboardingIntegrations
                    .setIn([0, 'meta', 'instagram', 'id'], 'foo')
                    .setIn(
                        [0, 'meta', 'roles'],
                        [ADVERTISE_ROLE, ANALYZE_ROLE].join(','),
                    )}
            />,
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it.each([
        [
            // Messenger enabled
            'messenger_enabled',
            PERMISSIONS_PER_INTEGRATION_META_SETTING['messenger_enabled'].join(
                ',',
            ),
            false,
        ],

        [
            // Messenger disabled
            'messenger_enabled',
            PERMISSIONS_PER_INTEGRATION_META_SETTING['messenger_enabled']
                .slice(0, -1)
                .join(','),
            true,
        ],
        [
            // Posts && History enabled
            'posts_enabled',
            PERMISSIONS_PER_INTEGRATION_META_SETTING['posts_enabled'].join(','),
            false,
        ],
        [
            // Posts && History disabled
            'posts_enabled',
            PERMISSIONS_PER_INTEGRATION_META_SETTING['posts_enabled']
                .slice(0, -2)
                .join(','),
            true,
        ],
        [
            // Mentions enabled
            'mentions_enabled',
            PERMISSIONS_PER_INTEGRATION_META_SETTING['mentions_enabled'].join(
                ',',
            ),
            false,
        ],
        [
            // Mentions disabled
            'mentions_enabled',
            PERMISSIONS_PER_INTEGRATION_META_SETTING['mentions_enabled']
                .slice(0, -1)
                .join(','),
            true,
        ],
        [
            // Instagram comments enabled
            'instagram_comments_enabled',
            PERMISSIONS_PER_INTEGRATION_META_SETTING[
                'instagram_comments_enabled'
            ].join(','),
            false,
        ],
        [
            // Instagram comments disabled
            'instagram_comments_enabled',
            PERMISSIONS_PER_INTEGRATION_META_SETTING[
                'instagram_comments_enabled'
            ]
                .slice(0, -1)
                .join(','),
            true,
        ],
        [
            // Instagram mentions enabled
            'instagram_mentions_enabled',
            PERMISSIONS_PER_INTEGRATION_META_SETTING[
                'instagram_mentions_enabled'
            ].join(','),
            false,
        ],
        [
            // Instagram mentions disabled
            'instagram_mentions_enabled',
            PERMISSIONS_PER_INTEGRATION_META_SETTING[
                'instagram_mentions_enabled'
            ]
                .slice(0, -1)
                .join(','),
            true,
        ],
        [
            // Instagram ads enabled
            'instagram_ads_enabled',
            PERMISSIONS_PER_INTEGRATION_META_SETTING[
                'instagram_ads_enabled'
            ].join(','),
            false,
        ],
        [
            // Instagram ads disabled
            'instagram_ads_enabled',
            PERMISSIONS_PER_INTEGRATION_META_SETTING['instagram_ads_enabled']
                .slice(0, -1)
                .join(','),
            true,
        ],
        [
            // Instagram direct message enabled
            'instagram_direct_message_enabled',
            PERMISSIONS_PER_INTEGRATION_META_SETTING[
                'instagram_direct_message_enabled'
            ].join(','),
            false,
        ],
        [
            // Instagram direct message disabled
            'instagram_direct_message_enabled',
            PERMISSIONS_PER_INTEGRATION_META_SETTING[
                'instagram_direct_message_enabled'
            ]
                .slice(0, -1)
                .join(','),
            true,
        ],
        [
            // Facebook recommendations enabled
            'recommendations_enabled',
            PERMISSIONS_PER_INTEGRATION_META_SETTING[
                'recommendations_enabled'
            ].join(','),
            false,
        ],
        [
            // Facebook recommendations disabled
            'recommendations_enabled',
            PERMISSIONS_PER_INTEGRATION_META_SETTING['recommendations_enabled']
                .slice(0, -1)
                .join(','),
            true,
        ],
        [
            // Instagram DM enabled
            'instagram_direct_message_enabled',
            PERMISSIONS_PER_INTEGRATION_META_SETTING[
                'instagram_direct_message_enabled'
            ].join(','),
            false,
        ],
        [
            // Instagram DM disabled
            'instagram_direct_message_enabled',
            PERMISSIONS_PER_INTEGRATION_META_SETTING[
                'instagram_direct_message_enabled'
            ]
                .slice(0, -1)
                .join(','),
            true,
        ],
    ])(
        'should render the integration with meta settings enabled/disabled based on permissions for %s',
        (checkboxName, permissions, isDisabled) => {
            const integrations = onboardingIntegrations
                .setIn([0, 'meta', 'instagram', 'id'], 'foo')
                .setIn(
                    [0, 'meta', 'roles'],
                    [ADVERTISE_ROLE, ANALYZE_ROLE, MODERATE_ROLE].join(','),
                )
                .setIn([0, 'meta', 'oauth', 'scope'], permissions)
                .setIn(
                    [
                        0,
                        'meta',
                        'instagram',
                        'instagram_direct_message_allowed',
                    ],
                    true,
                )

            const { getAllByRole, queryAllByRole } = render(
                <FacebookIntegrationSetupContainer
                    {...minProps}
                    integrations={integrations}
                />,
            )

            if (isDisabled) {
                expect(queryAllByRole('checkbox')).toHaveLength(0)
            } else {
                fireEvent.click(getAllByRole('checkbox')[0])
                const channelCheckbox = document.getElementById(
                    `1.${checkboxName}`,
                )

                expect(channelCheckbox).not.toBeDisabled()
            }
        },
    )

    it.each([
        [
            'account eligible to IG DM and has the feature (Render an enabled IG DM setting)',
            [true, true],
        ],
        [
            "account eligible to IG DM and hasn't the feature (Render a disabled IG DM setting with an upgrade button)",
            [true, false],
        ],
        [
            'account not eligible to IG DM and has the feature (Render a disabled IG DM setting with a warning)',
            [false, true],
        ],
        [
            "account not eligible to IG DM and hasn't the feature (Render a disabled IG DM setting with an upgrade button)",
            [false, false],
        ],
    ])(
        'should render an integration for: %s',
        (_, [isIGAccountEligible, priceHasInstagramDmFeature]) => {
            const integrations = onboardingIntegrations
                .setIn([0, 'meta', 'instagram', 'id'], 'foo')
                .setIn(
                    [0, 'meta', 'roles'],
                    [ADVERTISE_ROLE, ANALYZE_ROLE, MODERATE_ROLE].join(','),
                )
                .setIn([0, 'meta', 'oauth', 'scope'], allPermissions)
                .setIn(
                    [
                        0,
                        'meta',
                        'instagram',
                        'instagram_direct_message_allowed',
                    ],
                    isIGAccountEligible,
                )

            const currentAccount: Map<any, any> = fromJS({
                domain: 'acme',
            })

            const currentHelpdeskProduct = {
                ...basicMonthlyHelpdeskPlan,
                features: {
                    ...basicMonthlyHelpdeskPlan.features,
                    [AccountFeature.InstagramDirectMessage]: {
                        enabled: priceHasInstagramDmFeature,
                    },
                },
            }

            const { container, getByText } = render(
                <FacebookIntegrationSetupContainer
                    {...minProps}
                    integrations={integrations}
                    currentHelpdeskProduct={currentHelpdeskProduct}
                    currentAccount={currentAccount}
                />,
            )

            if (!priceHasInstagramDmFeature) {
                expect(getByText('Upgrade')).toBeInTheDocument()
            } else {
                expect(container.firstChild).toMatchSnapshot()
            }
        },
    )
})
