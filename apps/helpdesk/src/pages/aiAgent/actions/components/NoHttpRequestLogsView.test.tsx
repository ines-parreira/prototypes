import { render } from '@repo/testing'
import { screen } from '@testing-library/react'

import type { ActionStepItem } from '../types'
import { NoHttpRequestLogsView } from './NoHttpRequestLogsView'

const baseStep: ActionStepItem = {
    at: new Date().toISOString(),
    stepId: 'test-step-1',
    kind: 'http-request' as any,
}

const renderComponent = (step: ActionStepItem) =>
    render(<NoHttpRequestLogsView step={step} />, {})

describe('NoHttpRequestLogsView', () => {
    it('renders "Step was successful" when step has no error and success is true', () => {
        renderComponent({ ...baseStep, success: true })
        expect(screen.getByText('Step was successful')).toBeInTheDocument()
    })

    it('renders "Step was successful" when success is undefined (e.g. liquid-template without output)', () => {
        renderComponent({ ...baseStep, success: undefined })
        expect(screen.getByText('Step was successful')).toBeInTheDocument()
    })

    it('renders "Step failed to execute" when success is false and there is no error', () => {
        renderComponent({ ...baseStep, success: false })
        expect(screen.getByText('Step failed to execute')).toBeInTheDocument()
    })

    it('renders the stringified error when step has an error field', () => {
        const error = { code: 'boom', message: 'something went wrong' }
        renderComponent({ ...baseStep, error })
        expect(screen.getByText(JSON.stringify(error))).toBeInTheDocument()
    })

    it('renders the stringified error from steps_state when a child step has error', () => {
        const childError = { reason: 'child failed' }
        renderComponent({
            ...baseStep,
            success: false,
            steps_state: {
                'child-step-1': {
                    kind: 'http-request',
                    at: new Date().toISOString(),
                    error: childError,
                } as any,
            },
        })
        expect(screen.getByText(JSON.stringify(childError))).toBeInTheDocument()
    })

    it('renders the liquid-template output value (string) under an Output label', () => {
        renderComponent({
            ...baseStep,
            kind: 'liquid-template' as any,
            output: { data_type: 'string', value: '2026-05-12T16:03:10Z' },
        } as ActionStepItem)
        expect(screen.getByText('Output')).toBeInTheDocument()
        expect(screen.getByText('2026-05-12T16:03:10Z')).toBeInTheDocument()
    })

    it('JSON-stringifies non-string liquid-template output values', () => {
        renderComponent({
            ...baseStep,
            kind: 'liquid-template' as any,
            output: { data_type: 'string', value: { foo: 'bar', n: 1 } },
        } as unknown as ActionStepItem)
        expect(screen.getByText('Output')).toBeInTheDocument()
        const expected = JSON.stringify({ foo: 'bar', n: 1 }, null, 2)
        expect(
            screen.getByText((_, element) => element?.textContent === expected),
        ).toBeInTheDocument()
    })

    it('falls back to "Step was successful" for a liquid-template step with no output value', () => {
        renderComponent({
            ...baseStep,
            kind: 'liquid-template' as any,
            output: { data_type: 'string', value: undefined },
        } as ActionStepItem)
        expect(screen.getByText('Step was successful')).toBeInTheDocument()
    })
})
