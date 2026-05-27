import { screen } from '@testing-library/react'

import { render } from '@repo/testing'

import { useGetWorkflowConfiguration } from 'models/workflows/queries'
import type { Paths } from 'rest_api/workflows_api/client.generated'

import { SupportActionReferenceCard } from './SupportActionReferenceCard'

jest.mock('models/workflows/queries')

type WorkflowConfiguration = Paths.WfConfigurationControllerGet.Responses.$200

const mockUseGetWorkflowConfiguration =
    useGetWorkflowConfiguration as jest.MockedFunction<
        typeof useGetWorkflowConfiguration
    >

const baseConfiguration = {
    id: 'wf_abc',
    internal_id: 'wf_internal',
    account_id: 1,
    name: 'Issue refund',
    description: 'Refunds the most recent order for the customer.',
    short_description: 'Refunds the most recent order.',
    is_draft: false,
    updated_datetime: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    created_datetime: '2025-12-01T00:00:00.000Z',
    steps: [],
} as unknown as WorkflowConfiguration

function setConfiguration(
    result: Partial<ReturnType<typeof useGetWorkflowConfiguration>> & {
        data?: unknown
    },
) {
    mockUseGetWorkflowConfiguration.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: false,
        ...result,
    } as ReturnType<typeof useGetWorkflowConfiguration>)
}

describe('SupportActionReferenceCard', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('does not fetch the workflow while the popover is closed', () => {
        setConfiguration({})

        render(
            <SupportActionReferenceCard workflowId="wf_abc" isOpen={false} />,
        )

        expect(mockUseGetWorkflowConfiguration).toHaveBeenCalledWith(
            'wf_abc',
            expect.objectContaining({ enabled: false }),
        )
    })

    it('renders the name, active tag, short description, and updated time', () => {
        setConfiguration({ data: baseConfiguration })

        render(<SupportActionReferenceCard workflowId="wf_abc" isOpen={true} />)

        expect(screen.getByText('Issue refund')).toBeInTheDocument()
        expect(screen.getByText('Active')).toBeInTheDocument()
        expect(
            screen.getByText('Refunds the most recent order.'),
        ).toBeInTheDocument()
        expect(screen.getByText(/updated/i)).toBeInTheDocument()
    })

    it('renders the Draft tag for draft configurations', () => {
        setConfiguration({
            data: { ...baseConfiguration, is_draft: true },
        })

        render(<SupportActionReferenceCard workflowId="wf_abc" isOpen={true} />)

        expect(screen.getByText('Draft')).toBeInTheDocument()
    })

    it('falls back to the full description when no short description is set', () => {
        setConfiguration({
            data: { ...baseConfiguration, short_description: null },
        })

        render(<SupportActionReferenceCard workflowId="wf_abc" isOpen={true} />)

        expect(
            screen.getByText('Refunds the most recent order for the customer.'),
        ).toBeInTheDocument()
    })

    it('falls back to "Untitled action" when name is missing', () => {
        setConfiguration({
            data: { ...baseConfiguration, name: '' },
        })

        render(<SupportActionReferenceCard workflowId="wf_abc" isOpen={true} />)

        expect(screen.getByText('Untitled action')).toBeInTheDocument()
    })

    it('renders a skeleton while loading', () => {
        setConfiguration({ isLoading: true })

        const { container } = render(
            <SupportActionReferenceCard workflowId="wf_abc" isOpen={true} />,
        )

        expect(screen.queryByText(/issue refund/i)).not.toBeInTheDocument()
        expect(container.textContent).toMatch(/action/i)
    })

    it('renders an error fallback when the fetch fails', () => {
        setConfiguration({ isError: true })

        render(<SupportActionReferenceCard workflowId="wf_abc" isOpen={true} />)

        expect(
            screen.getByText("Couldn't load this action."),
        ).toBeInTheDocument()
    })
})
