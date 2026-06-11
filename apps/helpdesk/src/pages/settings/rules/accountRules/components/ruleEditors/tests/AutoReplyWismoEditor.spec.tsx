import type { ComponentProps } from 'react'

import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import { fromJS } from 'immutable'

import { IntegrationType } from 'models/integration/constants'
import { useGetSelfServiceConfigurations } from 'models/selfServiceConfiguration/queries'
import { ManagedRulesSlugs } from 'state/rules/types'

import { AutoReplyWismoEditor } from '../AutoReplyWismoEditor'

jest.mock('draft-js/lib/generateRandomKey', () => () => '123')
jest.mock('models/selfServiceConfiguration/queries')

const mockUseGetSelfServiceConfigurations = jest.mocked(
    useGetSelfServiceConfigurations,
)

const mockSelfServiceConfigurations = [
    {
        id: 1,
        type: IntegrationType.Shopify,
        shopName: 'test-shop',
        createdDatetime: '2023-11-15 19:00:00.000000',
        updatedDatetime: '2023-11-15 19:00:00.000000',
        deactivatedDatetime: null,
        reportIssuePolicy: {
            enabled: true,
            cases: [],
        },
        trackOrderPolicy: {
            enabled: true,
            unfulfilledMessage: {
                text: '',
                html: '',
            },
        },
        cancelOrderPolicy: {
            enabled: true,
            eligibilities: [],
            exceptions: [],
        },
        returnOrderPolicy: {
            enabled: true,
            eligibilities: [],
            exceptions: [],
        },
        articleRecommendationHelpCenterId: null,
    },
]
const shopifyIntegration = {
    id: 1,
    name: 'test-shop',
    type: IntegrationType.Shopify,
}
describe('<AutoReplyWismoEditor/>', () => {
    const minProps: ComponentProps<typeof AutoReplyWismoEditor> = {
        settings: {
            slug: ManagedRulesSlugs.AutoReplyWismo,
            block_list: [],
            body_text: '{{tracking_link_url}}',
            signature_text: '{{current_user.name}}',
        },
        onChange: jest.fn(),
    }
    const renderComponent = ({
        integrations = [],
    }: {
        integrations?: Array<typeof shopifyIntegration>
    } = {}) =>
        render(<AutoReplyWismoEditor {...minProps} />, {
            storeState: {
                integrations: fromJS({
                    integrations,
                }),
            },
        })

    beforeEach(() => {
        mockUseGetSelfServiceConfigurations.mockReturnValue({
            data: [],
            isLoading: false,
        } as unknown as ReturnType<typeof useGetSelfServiceConfigurations>)
    })

    it('should render correctly', () => {
        renderComponent({ integrations: [shopifyIntegration] })

        expect(
            screen.getByText(
                /This rule detects emails related to order status or tracking/i,
            ),
        ).toBeInTheDocument()
        expect(screen.getByText('Exclusion email list')).toBeInTheDocument()
        expect(screen.getByPlaceholderText('Add emails...')).toBeInTheDocument()
        expect(
            screen.getByText('Message above tracking links'),
        ).toBeInTheDocument()
        expect(
            screen.getByText('Message below tracking links'),
        ).toBeInTheDocument()
    })
    it('should display an alert if no shopify integration', () => {
        renderComponent()

        expect(
            screen.getByText(
                'This rule requires at least one Shopify integration to run.',
            ),
        ).toBeInTheDocument()
    })
    it('should display an alert if track order flow is enabled without unfulffiled message', async () => {
        mockUseGetSelfServiceConfigurations.mockReturnValueOnce({
            data: mockSelfServiceConfigurations,
            isLoading: false,
        } as unknown as ReturnType<typeof useGetSelfServiceConfigurations>)
        renderComponent({ integrations: [shopifyIntegration] })
        await screen.findByText(
            /add a response for customers tracking unfulfilled orders/i,
        )
    })
})
