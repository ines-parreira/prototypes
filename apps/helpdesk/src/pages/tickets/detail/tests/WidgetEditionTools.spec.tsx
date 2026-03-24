import { useTicketInfobarNavigation } from '@repo/navigation'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { fromJS } from 'immutable'

import useAppDispatch from 'hooks/useAppDispatch'
import * as actions from 'state/widgets/actions'
import { WidgetEnvironment } from 'state/widgets/types'

import WidgetEditionTools from '../WidgetEditionTools'

jest.mock('@gorgias/axiom', () => ({
    Button: ({ children, onClick, isDisabled, isLoading, ...rest }: any) => (
        <button onClick={onClick} disabled={isDisabled || isLoading} {...rest}>
            {children}
        </button>
    ),
}))
jest.mock('hooks/useAppDispatch', () => jest.fn())
jest.mock('state/widgets/actions', () => ({
    submitWidgets: jest.fn(),
    startEditionMode: jest.fn(),
}))
jest.mock('@repo/navigation', () => ({
    ...jest.requireActual('@repo/navigation'),
    useTicketInfobarNavigation: jest.fn(),
}))

const mockDispatch = jest.fn()
const mockOnSetEditingWidgetType = jest.fn()
const useAppDispatchMock = useAppDispatch as jest.Mock
const useTicketInfobarNavigationMock = useTicketInfobarNavigation as jest.Mock

beforeEach(() => {
    jest.clearAllMocks()
    useAppDispatchMock.mockReturnValue(mockDispatch)
    useTicketInfobarNavigationMock.mockReturnValue({
        onSetEditingWidgetType: mockOnSetEditingWidgetType,
    })
})

function renderComponent(overrides: Record<string, unknown> = {}) {
    const defaultWidgets = fromJS({
        _internal: {
            isDirty: false,
            editedItems: [],
            loading: { saving: false },
        },
    })

    return render(
        <WidgetEditionTools
            widgets={
                overrides.widgets !== undefined
                    ? (overrides.widgets as any)
                    : defaultWidgets
            }
            context={WidgetEnvironment.Ticket}
        />,
    )
}

describe('WidgetEditionTools', () => {
    it('should render Save and Cancel buttons', () => {
        renderComponent()

        expect(
            screen.getByRole('button', { name: /save changes/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: /cancel/i }),
        ).toBeInTheDocument()
    })

    it('should disable Save button when isDirty is false', () => {
        renderComponent()

        expect(
            screen.getByRole('button', { name: /save changes/i }),
        ).toBeDisabled()
    })

    it('should enable Save button when isDirty is true', () => {
        const widgets = fromJS({
            _internal: {
                isDirty: true,
                editedItems: [],
                loading: { saving: false },
            },
        })

        renderComponent({ widgets })

        expect(
            screen.getByRole('button', { name: /save changes/i }),
        ).toBeEnabled()
    })

    it('should dispatch submitWidgets and navigate away on Save click', async () => {
        const user = userEvent.setup()
        const editedItems = [{ id: 1, type: 'recharge' }]
        const widgets = fromJS({
            _internal: {
                isDirty: true,
                editedItems,
                loading: { saving: false },
            },
        })

        mockDispatch.mockReturnValue(Promise.resolve())

        renderComponent({ widgets })

        await user.click(screen.getByRole('button', { name: /save changes/i }))

        expect(actions.submitWidgets).toHaveBeenCalledWith(editedItems)
        expect(mockDispatch).toHaveBeenCalled()
    })

    it('should dispatch startEditionMode and navigate away on Cancel click', async () => {
        const user = userEvent.setup()
        const startAction = { type: 'START_EDITION_MODE' }
        jest.mocked(actions.startEditionMode).mockReturnValue(
            startAction as any,
        )

        renderComponent()

        await user.click(screen.getByRole('button', { name: /cancel/i }))

        expect(actions.startEditionMode).toHaveBeenCalledWith(
            WidgetEnvironment.Ticket,
        )
        expect(mockDispatch).toHaveBeenCalledWith(startAction)
        expect(mockOnSetEditingWidgetType).toHaveBeenCalledWith(null)
    })
})
