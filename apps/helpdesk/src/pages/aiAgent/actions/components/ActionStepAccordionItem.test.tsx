import { render } from '@repo/testing'
import { screen } from '@testing-library/react'

import type { ActionStepItem, TransitionsState } from '../types'
import ActionStepAccordionItem from './ActionStepAccordionItem'

jest.mock('./TransitionConditionsAccordion', () => ({
    __esModule: true,
    default: ({ transition }: { transition: TransitionsState }) => (
        <div data-testid="transition-conditions-accordion">
            Transition: {transition.name || 'Unnamed'}
        </div>
    ),
}))
jest.mock('./ActionEventTitle', () => ({
    __esModule: true,
    default: ({
        title,
        status,
        isLiquidTemplate,
        isCustomAction,
    }: {
        title: string
        status: string
        isLiquidTemplate?: boolean
        isCustomAction?: boolean
    }) => (
        <div
            data-testid="action-event-title"
            data-is-liquid-template={isLiquidTemplate ? 'true' : 'false'}
            data-is-custom-action={isCustomAction ? 'true' : 'false'}
        >
            {title} - {status}
        </div>
    ),
}))
jest.mock('./HttpRequestLogsView', () => ({
    __esModule: true,
    default: ({ logs }: { logs: any[] }) => (
        <div data-testid="http-request-logs">{logs.length} logs</div>
    ),
}))
jest.mock('./NoHttpRequestLogsView', () => ({
    __esModule: true,
    default: ({ step }: { step: ActionStepItem }) => (
        <div data-testid="no-http-request-logs">
            No logs for step {step.stepId}
        </div>
    ),
}))
const mockTransition: TransitionsState = {
    name: 'Test Transition',
    conditions: { and: [] },
    from_step_id: 'step-1',
    to_step_id: 'step-2',
    result: true,
}
const mockStep: ActionStepItem = {
    at: new Date().toISOString(),
    stepId: 'test-step-1',
    success: true,
    transition: {
        from_step_id: 'test-step-1',
        name: 'Test Transition',
        to_step_id: 'test-step-2',
        conditions: { and: [] },
    },
    kind: 'http-request' as any,
    steps_state: {
        'test-step-1': {
            kind: 'http-request',
            at: new Date().toISOString(),
            status_code: 200,
            success: true,
        },
    },
}
const renderComponent = (props: {
    step: ActionStepItem
    templateConfiguration?: any
    httpExecutionLogs?: any[]
    templateConfigurations?: any[]
    parentTemplateConfiguration?: any
}) => {
    return render(<ActionStepAccordionItem {...props} />, {})
}
describe('ActionStepAccordionItem', () => {
    it('should render TransitionConditionsAccordion when step has transition', () => {
        const stepWithTransition = {
            ...mockStep,
            transition: mockTransition,
        }
        renderComponent({ step: stepWithTransition })
        expect(
            screen.getByTestId('transition-conditions-accordion'),
        ).toBeInTheDocument()
        expect(
            screen.getByText('Transition: Test Transition'),
        ).toBeInTheDocument()
    })
    it('should not render TransitionConditionsAccordion when step has no transition', () => {
        renderComponent({
            step: {
                ...mockStep,
                transition: undefined,
            },
        })
        expect(
            screen.queryByTestId('transition-conditions-accordion'),
        ).not.toBeInTheDocument()
    })
    it('should render TransitionConditionsAccordion with unnamed transition', () => {
        const stepWithUnnamedTransition = {
            ...mockStep,
            transition: {
                ...mockTransition,
                name: undefined,
            },
        }
        renderComponent({ step: stepWithUnnamedTransition })
        expect(
            screen.getByTestId('transition-conditions-accordion'),
        ).toBeInTheDocument()
        expect(screen.getByText('Transition: Unnamed')).toBeInTheDocument()
    })
    it('should render action title with success status', () => {
        renderComponent({
            step: mockStep,
            templateConfiguration: {
                name: 'Test Action',
                apps: [{ type: 'test-app' }],
            },
        })
        const actionTitle = screen.getByTestId('action-event-title')
        expect(actionTitle).toBeInTheDocument()
        expect(actionTitle).toHaveTextContent('success')
    })
    it('should render action title with error status', () => {
        const failedStep = {
            ...mockStep,
            success: false,
        }
        renderComponent({
            step: failedStep,
            templateConfiguration: {
                name: 'Test Action',
                apps: [{ type: 'test-app' }],
            },
        })
        const actionTitle = screen.getByTestId('action-event-title')
        expect(actionTitle).toBeInTheDocument()
        expect(actionTitle).toHaveTextContent('error')
    })
    it('should render action title with error status when step has an error field but success is not false', () => {
        const erroredStep = {
            ...mockStep,
            success: undefined,
            error: { code: 'boom' },
        } as unknown as ActionStepItem
        renderComponent({ step: erroredStep })
        const actionTitle = screen.getByTestId('action-event-title')
        expect(actionTitle).toHaveTextContent('error')
    })
    it('should render action title with success status for a liquid-template step without success/error', () => {
        const liquidStep = {
            ...mockStep,
            kind: 'liquid-template',
            success: undefined,
        } as unknown as ActionStepItem
        renderComponent({ step: liquidStep })
        const actionTitle = screen.getByTestId('action-event-title')
        expect(actionTitle).toHaveTextContent('success')
        expect(actionTitle).toHaveAttribute('data-is-liquid-template', 'true')
        expect(actionTitle).toHaveAttribute('data-is-custom-action', 'false')
    })
    it('should render http request logs when logs are present', () => {
        const logs = [
            { id: 1, step_id: 'test-step-1', request: {}, response: {} },
            { id: 2, step_id: 'test-step-1', request: {}, response: {} },
        ]
        renderComponent({
            step: mockStep,
            httpExecutionLogs: logs,
        })
        expect(screen.getByTestId('http-request-logs')).toBeInTheDocument()
        expect(screen.getByText('2 logs')).toBeInTheDocument()
    })
    it('should render no logs view when logs are empty', () => {
        renderComponent({
            step: mockStep,
            httpExecutionLogs: [],
        })
        expect(screen.getByTestId('no-http-request-logs')).toBeInTheDocument()
        expect(
            screen.getByText('No logs for step test-step-1'),
        ).toBeInTheDocument()
    })
    it('should render no logs view when no logs provided', () => {
        renderComponent({
            step: mockStep,
        })
        expect(screen.getByTestId('no-http-request-logs')).toBeInTheDocument()
    })
    it('should render transition before action accordion', () => {
        const stepWithTransition = {
            ...mockStep,
            transition: mockTransition,
        }
        const { container } = renderComponent({
            step: stepWithTransition,
            templateConfiguration: {
                name: 'Test Action',
                apps: [{ type: 'test-app' }],
            },
        })
        const allElements = container.querySelectorAll('[data-testid]')
        const transitionIndex = Array.from(allElements).findIndex(
            (el) =>
                el.getAttribute('data-testid') ===
                'transition-conditions-accordion',
        )
        const actionTitleIndex = Array.from(allElements).findIndex(
            (el) => el.getAttribute('data-testid') === 'action-event-title',
        )
        expect(transitionIndex).toBeLessThan(actionTitleIndex)
    })
    it('should handle step with both transition and logs', () => {
        const stepWithTransition = {
            ...mockStep,
            transition: mockTransition,
        }
        const logs = [
            { id: 1, step_id: 'test-step-1', request: {}, response: {} },
        ]
        renderComponent({
            step: stepWithTransition,
            httpExecutionLogs: logs,
            templateConfiguration: {
                name: 'Test Action',
                apps: [{ type: 'test-app' }],
            },
        })
        expect(
            screen.getByTestId('transition-conditions-accordion'),
        ).toBeInTheDocument()
        expect(screen.getByTestId('action-event-title')).toBeInTheDocument()
        expect(screen.getByTestId('http-request-logs')).toBeInTheDocument()
    })
})
