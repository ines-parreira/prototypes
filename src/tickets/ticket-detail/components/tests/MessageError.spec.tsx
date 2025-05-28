import { fireEvent, render, screen } from '@testing-library/react'

import { ActionTemplateExecution } from 'config'
import { MacroActionName } from 'models/macroAction/types'
import { ActionStatus } from 'models/ticket/types'
import { getActionTemplate, stripErrorMessage } from 'utils'
import { sanitizeHtmlDefault } from 'utils/html'

import { FailedData } from '../../types'
import { MessageError } from '../MessageError'

jest.mock('utils', () => ({
    getActionTemplate: jest.fn(),
    stripErrorMessage: jest.fn((msg) => msg),
}))

jest.mock('utils/html', () => ({
    sanitizeHtmlDefault: jest.fn((html) => html),
}))

const mockedGetActionTemplate = jest.mocked(getActionTemplate)
const mockedStripErrorMessage = jest.mocked(stripErrorMessage)
const mockedSanitizeHtmlDefault = jest.mocked(sanitizeHtmlDefault)

describe('MessageError', () => {
    const defaultAction = {
        name: MacroActionName.SetStatus,
        status: ActionStatus.Error,
        title: 'Set Status',
        type: 'setStatus',
        response: {
            msg: 'Action failed',
            status_code: 400,
            response: 'Bad Request',
        },
    }

    const mockError: FailedData = {
        message: 'Test error message',
        failedActions: [],
    }

    it('renders error message correctly', () => {
        mockedSanitizeHtmlDefault.mockReturnValue('Test error message')
        render(<MessageError error={mockError} />)
        expect(screen.getByText('Test error message')).toBeInTheDocument()
    })

    it('does not show failed actions toggle when there are no failed actions', () => {
        render(<MessageError error={mockError} />)
        expect(screen.queryByText('Find out why?')).not.toBeInTheDocument()
    })

    it('shows failed actions toggle when there are failed actions', () => {
        const errorWithActions: FailedData = {
            ...mockError,
            failedActions: [defaultAction],
        }
        render(<MessageError error={errorWithActions} />)
        expect(screen.getByText('Find out why?')).toBeInTheDocument()
    })

    it('toggles failed actions visibility when button is clicked', () => {
        const errorWithActions: FailedData = {
            ...mockError,
            failedActions: [defaultAction],
        }
        const { container } = render(<MessageError error={errorWithActions} />)

        expect(container.querySelector('.component')).not.toHaveClass(
            'showFailedActions',
        )

        fireEvent.click(screen.getByText('Find out why?'))

        expect(container.querySelector('.component')).toHaveClass(
            'showFailedActions',
        )
    })

    it('displays failed actions with correct template and error message', () => {
        const mockTemplate = {
            execution: ActionTemplateExecution.Back,
            name: MacroActionName.SetStatus,
            title: 'Test Action',
        }
        mockedGetActionTemplate.mockReturnValue(mockTemplate)
        mockedStripErrorMessage.mockReturnValue('Action failed')

        const errorWithActions: FailedData = {
            ...mockError,
            failedActions: [defaultAction],
        }
        render(<MessageError error={errorWithActions} />)

        expect(screen.getByText(/Test Action/)).toBeInTheDocument()
        expect(screen.getByText(/Action failed/)).toBeInTheDocument()
    })

    it('handles multiple failed actions', () => {
        const mockTemplate1 = {
            execution: ActionTemplateExecution.Back,
            name: MacroActionName.SetStatus,
            title: 'Action 1',
        }
        const mockTemplate2 = {
            execution: ActionTemplateExecution.Back,
            name: MacroActionName.SetAssignee,
            title: 'Action 2',
        }
        mockedGetActionTemplate
            .mockReturnValueOnce(mockTemplate1)
            .mockReturnValueOnce(mockTemplate2)
        mockedStripErrorMessage
            .mockReturnValueOnce('First action failed')
            .mockReturnValueOnce('Second action failed')

        const errorWithActions: FailedData = {
            ...mockError,
            failedActions: [
                defaultAction,
                {
                    ...defaultAction,
                    name: MacroActionName.SetAssignee,
                    title: 'Set Assignee',
                    type: 'setAssignee',
                    response: {
                        msg: 'Second action failed',
                        status_code: 400,
                        response: 'Bad Request',
                    },
                },
            ],
        }
        render(<MessageError error={errorWithActions} />)

        expect(screen.getByText(/Action 1/)).toBeInTheDocument()
        expect(screen.getByText(/First action failed/)).toBeInTheDocument()

        expect(screen.getByText(/Action 2/)).toBeInTheDocument()
        expect(screen.getByText(/Second action failed/)).toBeInTheDocument()
    })

    it('handles case when action template is not found', () => {
        mockedGetActionTemplate.mockReturnValue(undefined)
        mockedStripErrorMessage.mockReturnValue('Action failed')

        const errorWithActions: FailedData = {
            ...mockError,
            failedActions: [defaultAction],
        }
        render(<MessageError error={errorWithActions} />)

        expect(screen.getByText(/The action /)).toBeInTheDocument()
        expect(screen.getByText(/failed because/)).toBeInTheDocument()
    })
})
