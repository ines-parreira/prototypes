import { screen } from '@testing-library/react'

import { render } from '../../../../../../../tests/render.utils'
import type { ButtonAction } from '../../utils/customActionTypes'
import {
    ActionEditorDialog,
    hasEditableParameters,
} from '../ActionEditorDialog'

const baseAction: ButtonAction = {
    method: 'POST',
    url: 'https://api.example.com',
    headers: [],
    params: [],
    body: {
        contentType: 'application/json',
        'application/json': {},
        'application/x-www-form-urlencoded': [],
    },
}

describe('hasEditableParameters', () => {
    it('returns false when no editable parameters exist', () => {
        expect(hasEditableParameters(baseAction)).toBe(false)
    })

    it('returns true when editable header exists', () => {
        const action: ButtonAction = {
            ...baseAction,
            headers: [{ id: '1', key: 'token', value: '', editable: true }],
        }
        expect(hasEditableParameters(action)).toBe(true)
    })

    it('returns true when dropdown parameter exists', () => {
        const action: ButtonAction = {
            ...baseAction,
            params: [
                {
                    id: '1',
                    key: 'env',
                    value: 'prod;staging',
                    type: 'dropdown',
                },
            ],
        }
        expect(hasEditableParameters(action)).toBe(true)
    })
})

describe('ActionEditorDialog', () => {
    const defaultProps = {
        isOpen: true,
        onOpenChange: vi.fn(),
        label: 'Test Action',
        onExecute: vi.fn(),
    }

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('renders with the action label as title', () => {
        const action: ButtonAction = {
            ...baseAction,
            headers: [
                {
                    id: '1',
                    key: 'token',
                    value: '',
                    editable: true,
                    label: 'API Token',
                },
            ],
        }

        render(<ActionEditorDialog {...defaultProps} action={action} />)

        expect(screen.getByText('Test Action')).toBeInTheDocument()
    })

    it('renders editable text fields', () => {
        const action: ButtonAction = {
            ...baseAction,
            params: [
                {
                    id: '1',
                    key: 'search',
                    value: '',
                    editable: true,
                    label: 'Search Term',
                },
            ],
        }

        render(<ActionEditorDialog {...defaultProps} action={action} />)

        expect(screen.getByLabelText('Search Term')).toBeInTheDocument()
    })

    it('renders dropdown fields for dropdown type parameters', () => {
        const action: ButtonAction = {
            ...baseAction,
            params: [
                {
                    id: '1',
                    key: 'env',
                    value: 'prod;staging;dev',
                    type: 'dropdown',
                    label: 'Environment',
                },
            ],
        }

        render(<ActionEditorDialog {...defaultProps} action={action} />)

        expect(
            screen.getByRole('button', { name: /environment/i }),
        ).toBeInTheDocument()
    })

    it('calls onExecute when Execute button is clicked with no required fields', async () => {
        const action: ButtonAction = {
            ...baseAction,
            headers: [
                {
                    id: '1',
                    key: 'note',
                    value: '',
                    editable: true,
                    label: 'Note',
                    mandatory: false,
                },
            ],
        }

        const { user } = render(
            <ActionEditorDialog {...defaultProps} action={action} />,
        )

        await user.click(screen.getByRole('button', { name: /execute/i }))

        expect(defaultProps.onExecute).toHaveBeenCalledTimes(1)
    })

    it('does not call onExecute when required field is empty', async () => {
        const action: ButtonAction = {
            ...baseAction,
            headers: [
                {
                    id: '1',
                    key: 'token',
                    value: '',
                    editable: true,
                    label: 'API Token',
                    mandatory: true,
                },
            ],
        }

        const { user } = render(
            <ActionEditorDialog {...defaultProps} action={action} />,
        )

        await user.click(screen.getByRole('button', { name: /execute/i }))

        expect(defaultProps.onExecute).not.toHaveBeenCalled()
    })

    it('calls onOpenChange when Cancel is clicked', async () => {
        const action: ButtonAction = {
            ...baseAction,
            headers: [
                {
                    id: '1',
                    key: 'token',
                    value: '',
                    editable: true,
                    label: 'Token',
                },
            ],
        }

        const { user } = render(
            <ActionEditorDialog {...defaultProps} action={action} />,
        )

        await user.click(screen.getByRole('button', { name: /cancel/i }))

        expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false)
    })

    it('typing into text field updates value and allows execute', async () => {
        const action: ButtonAction = {
            ...baseAction,
            headers: [
                {
                    id: '1',
                    key: 'token',
                    value: '',
                    editable: true,
                    label: 'API Token',
                    mandatory: true,
                },
            ],
        }

        const { user } = render(
            <ActionEditorDialog {...defaultProps} action={action} />,
        )

        await user.type(
            screen.getByRole('textbox', { name: /api token/i }),
            'abc123',
        )
        await user.click(screen.getByRole('button', { name: /execute/i }))

        expect(defaultProps.onExecute).toHaveBeenCalledTimes(1)
        const executedAction = defaultProps.onExecute.mock.calls[0][0]
        expect(executedAction.headers[0].value).toBe('abc123')
    })

    it('selecting a dropdown option updates value', async () => {
        const action: ButtonAction = {
            ...baseAction,
            params: [
                {
                    id: '1',
                    key: 'env',
                    value: 'prod;staging;dev',
                    type: 'dropdown',
                    label: 'Environment',
                },
            ],
        }

        const { user } = render(
            <ActionEditorDialog {...defaultProps} action={action} />,
        )

        await user.click(screen.getByRole('button', { name: /environment/i }))

        await vi.waitFor(() => {
            expect(
                screen.getByRole('option', { name: 'staging' }),
            ).toBeInTheDocument()
        })

        await user.click(screen.getByRole('option', { name: 'staging' }))
        await user.click(screen.getByRole('button', { name: /execute/i }))

        expect(defaultProps.onExecute).toHaveBeenCalledTimes(1)
        const executedAction = defaultProps.onExecute.mock.calls[0][0]
        expect(executedAction.params[0].value).toBe('staging')
    })

    it('executes with filled mandatory field', async () => {
        const action: ButtonAction = {
            ...baseAction,
            params: [
                {
                    id: '1',
                    key: 'query',
                    value: '',
                    editable: true,
                    label: 'Search Query',
                    mandatory: true,
                },
            ],
        }

        const { user } = render(
            <ActionEditorDialog {...defaultProps} action={action} />,
        )

        await user.type(
            screen.getByRole('textbox', { name: /search query/i }),
            'test query',
        )
        await user.click(screen.getByRole('button', { name: /execute/i }))

        expect(defaultProps.onExecute).toHaveBeenCalledTimes(1)
        const executedAction = defaultProps.onExecute.mock.calls[0][0]
        expect(executedAction.params[0].value).toBe('test query')
    })

    it('renders body form-urlencoded editable params as fields', () => {
        const action: ButtonAction = {
            ...baseAction,
            body: {
                contentType: 'application/x-www-form-urlencoded',
                'application/json': {},
                'application/x-www-form-urlencoded': [
                    {
                        id: '1',
                        key: 'username',
                        value: '',
                        editable: true,
                        label: 'Username',
                    },
                    {
                        id: '2',
                        key: 'password',
                        value: '',
                        editable: true,
                        label: 'Password',
                    },
                ],
            },
        }

        render(<ActionEditorDialog {...defaultProps} action={action} />)

        expect(screen.getByLabelText('Username')).toBeInTheDocument()
        expect(screen.getByLabelText('Password')).toBeInTheDocument()
    })

    it('falls back to key when label is missing', () => {
        const action: ButtonAction = {
            ...baseAction,
            headers: [
                {
                    id: '1',
                    key: 'x-api-key',
                    value: '',
                    editable: true,
                },
            ],
        }

        render(<ActionEditorDialog {...defaultProps} action={action} />)

        expect(screen.getByLabelText('x-api-key')).toBeInTheDocument()
    })

    it('shows asterisk in label for mandatory dropdown', () => {
        const action: ButtonAction = {
            ...baseAction,
            params: [
                {
                    id: '1',
                    key: 'region',
                    value: 'us;eu;asia',
                    type: 'dropdown',
                    label: 'Region',
                    mandatory: true,
                },
            ],
        }

        render(<ActionEditorDialog {...defaultProps} action={action} />)

        expect(screen.getByText('Region *')).toBeInTheDocument()
    })

    it('renders editable params from multiple sources', () => {
        const action: ButtonAction = {
            ...baseAction,
            headers: [
                {
                    id: '1',
                    key: 'auth',
                    value: '',
                    editable: true,
                    label: 'Auth Header',
                },
            ],
            params: [
                {
                    id: '2',
                    key: 'search',
                    value: '',
                    editable: true,
                    label: 'Search Param',
                },
            ],
            body: {
                contentType: 'application/x-www-form-urlencoded',
                'application/json': {},
                'application/x-www-form-urlencoded': [
                    {
                        id: '3',
                        key: 'field',
                        value: '',
                        editable: true,
                        label: 'Body Field',
                    },
                ],
            },
        }

        render(<ActionEditorDialog {...defaultProps} action={action} />)

        expect(screen.getByLabelText('Auth Header')).toBeInTheDocument()
        expect(screen.getByLabelText('Search Param')).toBeInTheDocument()
        expect(screen.getByLabelText('Body Field')).toBeInTheDocument()
    })
})
