import { screen } from '@testing-library/react'
import { HttpResponse } from 'msw'

import {
    mockGetRuleHandler,
    mockGetRuleResponse,
} from '@gorgias/helpdesk-mocks'
import type { Rule } from '@gorgias/helpdesk-types'
import { render } from '../../../../../tests/render.utils'
import { server } from '../../../../../tests/server'
import { MessageCampaignLink } from '../MessageHeader/MessageCampaignLink'
import { MessageMeta } from '../MessageHeader/MessageMeta'
import { MessageMetaLabel } from '../MessageHeader/MessageMetaLabel'
import { MessageMetaLink } from '../MessageHeader/MessageMetaLink'
import { MessageSearchQuery } from '../MessageHeader/MessageSearchQuery'

vi.mock('react-rating-stars-component', () => ({
    default: ({ value }: { value: number }) => <div>{`Rating: ${value}`}</div>,
}))

function getRuleHandler(rule: Partial<Rule>) {
    return mockGetRuleHandler(async ({ params }) =>
        HttpResponse.json(
            mockGetRuleResponse({
                ...rule,
                id: Number(params?.id ?? rule.id),
            }),
        ),
    )
}

describe('MessageMetaLabel', () => {
    it('renders children text', () => {
        render(<MessageMetaLabel icon="zap">some label text</MessageMetaLabel>)

        expect(screen.getByText('some label text')).toBeInTheDocument()
    })

    it('renders an icon', () => {
        render(<MessageMetaLabel icon="zap">label</MessageMetaLabel>)

        expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument()
    })

    it('renders with error variant without crashing', () => {
        render(
            <MessageMetaLabel icon="zap" variant="error">
                error label
            </MessageMetaLabel>,
        )

        expect(screen.getByText('error label')).toBeInTheDocument()
    })

    it('renders without an icon', () => {
        render(<MessageMetaLabel>label without icon</MessageMetaLabel>)

        expect(screen.getByText('label without icon')).toBeInTheDocument()
    })
})

describe('MessageSearchQuery', () => {
    it('renders the "from search:" prefix', () => {
        render(<MessageSearchQuery query="return policy" />)

        expect(screen.getByText(/from search:/)).toBeInTheDocument()
    })

    it('renders the search query value', () => {
        render(<MessageSearchQuery query="return policy" />)

        expect(screen.getByText('return policy')).toBeInTheDocument()
    })
})

describe('MessageMeta', () => {
    it('renders forwarded metadata', () => {
        render(<MessageMeta meta={null} isForwarded />)

        expect(screen.getByText('forwarded this email')).toBeInTheDocument()
    })

    it('renders the rule link when a rule triggered the message', async () => {
        const mockGetRule = getRuleHandler({ name: 'Send bot response' })
        const waitForGetRuleRequest = mockGetRule.waitForRequest(server)
        server.use(mockGetRule.handler)

        render(<MessageMeta meta={null} ruleId={42} />)

        await waitForGetRuleRequest(async (request) => {
            expect(new URL(request.url).pathname).toBe('/api/rules/42')
        })
        expect(screen.getByText(/sent via/)).toBeInTheDocument()
        expect(
            await screen.findByRole('link', { name: /Send bot response/ }),
        ).toHaveAttribute('href', '/app/settings/rules/42')
    })

    it('renders managed rule display names', async () => {
        server.use(
            getRuleHandler({
                name: 'Managed rule',
                settings: { slug: 'auto-reply-wismo' },
                type: 'managed',
            }).handler,
        )

        render(<MessageMeta meta={null} ruleId={42} />)

        expect(
            await screen.findByRole('link', {
                name: /\[Auto Reply\] Send tracking information email/,
            }),
        ).toHaveAttribute('href', '/app/settings/rules/42')
    })

    it('falls back to the managed rule name when the slug is unknown', async () => {
        server.use(
            getRuleHandler({
                name: 'Managed rule',
                settings: { slug: 'unknown-managed-rule' },
                type: 'managed',
            }).handler,
        )

        render(<MessageMeta meta={null} ruleId={42} />)

        expect(
            await screen.findByRole('link', { name: /Managed rule/ }),
        ).toHaveAttribute('href', '/app/settings/rules/42')
    })

    it('falls back to the rule label when the rule has no name', async () => {
        const mockGetRule = getRuleHandler({
            name: undefined,
            settings: null,
            type: 'user',
        })
        const waitForGetRuleRequest = mockGetRule.waitForRequest(server)
        server.use(mockGetRule.handler)

        render(<MessageMeta meta={null} ruleId={42} />)

        await waitForGetRuleRequest(() => undefined)
        expect(screen.getByRole('link', { name: /Rule/ })).toHaveAttribute(
            'href',
            '/app/settings/rules/42',
        )
    })
})

describe('MessageMetaLink', () => {
    it('renders a link with the correct href', () => {
        render(
            <MessageMetaLink to="/app/convert/1/campaigns/abc">
                Campaign
            </MessageMetaLink>,
        )

        expect(screen.getByRole('link', { name: /Campaign/ })).toHaveAttribute(
            'href',
            '/app/convert/1/campaigns/abc',
        )
    })

    it('opens the link in a new tab', () => {
        render(
            <MessageMetaLink to="/app/convert/1/campaigns/abc">
                Campaign
            </MessageMetaLink>,
        )

        const link = screen.getByRole('link', { name: /Campaign/ })
        expect(link).toHaveAttribute('target', '_blank')
        expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    })

    it('renders children text', () => {
        render(<MessageMetaLink to="/some/path">View details</MessageMetaLink>)

        expect(screen.getByText('View details')).toBeInTheDocument()
    })
})

describe('MessageCampaignLink', () => {
    it('renders "sent via" text', () => {
        render(<MessageCampaignLink integrationId={42} campaignId="camp-99" />)

        expect(screen.getByText(/sent via/)).toBeInTheDocument()
    })

    it('renders a "Campaign" link', () => {
        render(<MessageCampaignLink integrationId={42} campaignId="camp-99" />)

        expect(
            screen.getByRole('link', { name: /Campaign/ }),
        ).toBeInTheDocument()
    })

    it('links to the correct campaign URL', () => {
        render(<MessageCampaignLink integrationId={42} campaignId="camp-99" />)

        expect(screen.getByRole('link', { name: /Campaign/ })).toHaveAttribute(
            'href',
            '/app/convert/42/campaigns/camp-99',
        )
    })

    it('works with a string integrationId', () => {
        render(<MessageCampaignLink integrationId="10" campaignId="camp-01" />)

        expect(screen.getByRole('link', { name: /Campaign/ })).toHaveAttribute(
            'href',
            '/app/convert/10/campaigns/camp-01',
        )
    })
})

describe('MessageMeta', () => {
    it('renders a Yotpo review score from the message source', () => {
        render(
            <MessageMeta
                meta={null}
                messageId="12345"
                source={{
                    type: 'yotpo-review',
                    extra: { score: 4.3 },
                }}
            />,
        )

        expect(screen.getByText('Rating: 4.3')).toBeInTheDocument()
        expect(screen.queryByText('(0)')).not.toBeInTheDocument()
        expect(screen.getByRole('link', { name: /review/i })).toHaveAttribute(
            'href',
            'https://reviews.yotpo.com/#/moderation/reviews?filterType=reviews&id=12345',
        )
    })
})
