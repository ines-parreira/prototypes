import React from 'react'

import { render, screen, waitFor } from '@testing-library/react'
import { Router } from 'react-router-dom'

import { CustomFieldCondition } from '@gorgias/api-queries'

import ConfirmationPopover from 'pages/common/components/popover/ConfirmationPopover'
import history from 'pages/history'
import { CUSTOM_FIELD_CONDITIONS_ROUTE } from 'routes/constants'
import { assumeMock, getLastMockCall } from 'utils/testing'

import useDeleteCustomFieldCondition from '../../hooks/useDeleteCustomFieldCondition'
import { DeletionPopover } from '../DeletionPopover'

jest.spyOn(history, 'push')
jest.mock('pages/common/components/popover/ConfirmationPopover', () =>
    jest.fn(
        ({
            content,
            children,
        }: {
            content: React.ReactNode
            children: () => React.ReactNode
        }) => (
            <div>
                {children()}
                {content}
            </div>
        ),
    ),
)
jest.mock('../../hooks/useDeleteCustomFieldCondition')

const ConfirmationPopoverMock = assumeMock(ConfirmationPopover)
const useDeleteCustomFieldConditionMock = assumeMock(
    useDeleteCustomFieldCondition,
)

describe('DeletionPopover', () => {
    const condition = {
        id: '1',
        name: 'Test Condition',
    } as unknown as CustomFieldCondition
    const children = () => <div>Hey</div>

    beforeEach(() => {
        useDeleteCustomFieldConditionMock.mockReturnValue({
            mutateAsync: jest.fn(),
            isLoading: false,
        } as unknown as ReturnType<typeof useDeleteCustomFieldCondition>)
    })

    it('should render correctly', () => {
        render(
            <DeletionPopover condition={condition}>{children}</DeletionPopover>,
        )
        expect(screen.getByText(/You are about to delete/)).toBeInTheDocument()
        expect(screen.getByText('Test Condition')).toBeInTheDocument()
        expect(screen.getByText('Hey')).toBeInTheDocument()
    })

    it('should passe correct props to ConfirmationPopover', () => {
        render(
            <DeletionPopover condition={condition}>{children}</DeletionPopover>,
        )
        expect(ConfirmationPopover).toHaveBeenCalledWith(
            expect.objectContaining({
                buttonProps: { intent: 'destructive', isLoading: false },
                id: `delete-condition-${condition.id}`,
                isOpen: undefined,
            }),
            {},
        )
    })

    it('should call deleteCondition and redirects on confirm', async () => {
        const deleteCondition = jest.fn()
        useDeleteCustomFieldConditionMock.mockReturnValue({
            mutateAsync: deleteCondition,
            isLoading: false,
        } as unknown as ReturnType<typeof useDeleteCustomFieldCondition>)
        render(
            <Router history={history}>
                <DeletionPopover condition={condition} redirect>
                    {children}
                </DeletionPopover>
            </Router>,
        )
        getLastMockCall(ConfirmationPopoverMock)[0].onConfirm?.()

        expect(deleteCondition).toHaveBeenCalledWith({ id: condition.id })
        await waitFor(() => {
            expect(history.push).toHaveBeenCalledWith(
                `/app/settings/${CUSTOM_FIELD_CONDITIONS_ROUTE}`,
            )
        })
    })
})
