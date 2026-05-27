import { screen } from '@testing-library/react'

import { render } from '@repo/testing'

import { useShopIntegrationId } from 'pages/aiAgent/hooks/useShopIntegrationId'
import { OpportunityType } from 'pages/aiAgent/opportunities/enums'
import { useFindOneOpportunity } from 'pages/aiAgent/opportunities/hooks/useFindOneOpportunity'
import type { Opportunity } from 'pages/aiAgent/opportunities/types'
import { ResourceType } from 'pages/aiAgent/opportunities/types'

import { OpportunityReferenceCard } from './OpportunityReferenceCard'

jest.mock('pages/aiAgent/hooks/useShopIntegrationId')
jest.mock('pages/aiAgent/opportunities/hooks/useFindOneOpportunity')

const mockUseShopIntegrationId = useShopIntegrationId as jest.MockedFunction<
    typeof useShopIntegrationId
>
const mockUseFindOneOpportunity = useFindOneOpportunity as jest.MockedFunction<
    typeof useFindOneOpportunity
>

const baseOpportunity: Opportunity = {
    id: '7',
    key: 'ks_7',
    type: OpportunityType.FILL_KNOWLEDGE_GAP,
    insight: 'Refund window confusion',
    ticketCount: 8,
    resources: [
        {
            title: 'Refunds',
            content: '',
            type: ResourceType.GUIDANCE,
            isVisible: true,
        },
    ],
}

function setOpportunity(
    result: Partial<ReturnType<typeof useFindOneOpportunity>> & {
        data?: Opportunity | undefined
    },
) {
    mockUseFindOneOpportunity.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: false,
        ...result,
    } as ReturnType<typeof useFindOneOpportunity>)
}

describe('OpportunityReferenceCard', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseShopIntegrationId.mockReturnValue(123)
    })

    it('does not fetch the opportunity while the popover is closed', () => {
        setOpportunity({})

        render(
            <OpportunityReferenceCard
                opportunityId={7}
                shopName="acme"
                isOpen={false}
            />,
        )

        expect(mockUseFindOneOpportunity).toHaveBeenCalledWith(
            123,
            7,
            expect.objectContaining({
                query: expect.objectContaining({ enabled: false }),
            }),
        )
    })

    it('renders the insight, type tag, ticket and resource rows', () => {
        setOpportunity({ data: baseOpportunity })

        render(
            <OpportunityReferenceCard
                opportunityId={7}
                shopName="acme"
                isOpen={true}
            />,
        )

        expect(screen.getByText('Refund window confusion')).toBeInTheDocument()
        expect(screen.getByText('Knowledge gap')).toBeInTheDocument()
        expect(screen.getByText('8 detected tickets')).toBeInTheDocument()
        expect(screen.getByText('1 related resource')).toBeInTheDocument()
    })

    it('renders the conflict tag for RESOLVE_CONFLICT', () => {
        setOpportunity({
            data: {
                ...baseOpportunity,
                type: OpportunityType.RESOLVE_CONFLICT,
            },
        })

        render(
            <OpportunityReferenceCard
                opportunityId={7}
                shopName="acme"
                isOpen={true}
            />,
        )

        expect(screen.getByText('Conflict')).toBeInTheDocument()
    })

    it('falls back to "Untitled opportunity" when no insight is available', () => {
        setOpportunity({ data: { ...baseOpportunity, insight: '' } })

        render(
            <OpportunityReferenceCard
                opportunityId={7}
                shopName="acme"
                isOpen={true}
            />,
        )

        expect(screen.getByText('Untitled opportunity')).toBeInTheDocument()
    })

    it('shows a skeleton while the shop integration is not yet resolved', () => {
        mockUseShopIntegrationId.mockReturnValue(undefined)
        setOpportunity({})

        const { container } = render(
            <OpportunityReferenceCard
                opportunityId={7}
                shopName="acme"
                isOpen={true}
            />,
        )

        expect(
            screen.queryByText(/refund window confusion/i),
        ).not.toBeInTheDocument()
        expect(container.textContent).toMatch(/opportunity/i)
    })

    it('renders an error fallback when the fetch fails', () => {
        setOpportunity({ isError: true })

        render(
            <OpportunityReferenceCard
                opportunityId={7}
                shopName="acme"
                isOpen={true}
            />,
        )

        expect(
            screen.getByText("Couldn't load this opportunity."),
        ).toBeInTheDocument()
    })
})
