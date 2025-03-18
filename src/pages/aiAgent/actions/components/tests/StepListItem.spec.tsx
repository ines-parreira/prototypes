import React from 'react'

import { act, fireEvent, screen } from '@testing-library/react'

import { IntegrationType } from 'models/integration/constants'
import { renderWithDnD } from 'utils/testing'

import { StepListItem, StepListItemProps } from '../StepListItem'

describe('<StepListItem />', () => {
    const mockOnDelete = jest.fn()
    const mockOnMove = jest.fn()
    const mockOnDrop = jest.fn()
    const mockOnCancel = jest.fn()
    const mockOnClick = jest.fn()

    const defaultProps: StepListItemProps = {
        index: 0,
        step: {
            id: 'step1',
            internal_id: 'internal1',
            name: 'Test Step',
            is_draft: false,
            initial_step_id: 'step1',
            steps: [],
            apps: [
                {
                    type: 'app',
                    app_id: 'test-app',
                    api_key: null,
                    refresh_token: null,
                },
            ],
            transitions: [],
            available_languages: [],
            created_datetime: '2023-01-01T00:00:00Z',
            updated_datetime: '2023-01-01T00:00:00Z',
            entrypoints: [],
            triggers: [],
            inputs: [],
            description: null,
            short_description: null,
        },
        onDelete: mockOnDelete,
        onMove: mockOnMove,
        onDrop: mockOnDrop,
        onCancel: mockOnCancel,
        onClick: mockOnClick,
        app: {
            id: 'test-app',
            type: IntegrationType.App,
            name: 'Test App',
            icon: 'test-icon',
        },
        isClickable: false,
        hasMissingCredentials: false,
        hasCredentials: false,
        hasAllValues: false,
        hasMissingValues: false,
        hasInvalidCredentials: false,
    }

    it('handles click when step is clickable (app type and not template)', () => {
        const props = {
            ...defaultProps,
            isClickable: true,
        }

        renderWithDnD(<StepListItem {...props} />)

        act(() => {
            fireEvent.click(screen.getByRole('button'))
        })

        expect(mockOnClick).toHaveBeenCalled()
    })

    it('does not handle click when step is not clickable', () => {
        const props = {
            ...defaultProps,
            isClickable: false,
        }

        renderWithDnD(<StepListItem {...props} />)

        act(() => {
            fireEvent.click(screen.getByRole('button'))
        })

        expect(mockOnClick).not.toHaveBeenCalled()
    })
})
