import React from 'react'
import {act, fireEvent, screen} from '@testing-library/react'
import {createMemoryHistory} from 'history'

import {flushPromises, renderWithRouter} from 'utils/testing'
import {AppListData} from 'models/integration/types'

import ActionsPlatformAppForm from '../ActionsPlatformAppForm'

describe('<ActionsPlatformAppForm />', () => {
    const app: Pick<AppListData, 'id' | 'name' | 'app_icon'> = {
        app_icon: '/assets/img/integrations/app.png',
        id: 'someid',
        name: 'Test App',
    }

    it('should render a form with name, auth method & instructions URL', () => {
        renderWithRouter(
            <ActionsPlatformAppForm apps={[app]} onSubmit={jest.fn()} />
        )

        expect(screen.getByText('App')).toBeInTheDocument()
        expect(screen.getByText('Authentication method')).toBeInTheDocument()
        expect(screen.getByText('Instructions URL')).toBeInTheDocument()
    })

    it('should render back button', () => {
        const history = createMemoryHistory()

        const historyPushSpy = jest.spyOn(history, 'push')

        renderWithRouter(
            <ActionsPlatformAppForm apps={[app]} onSubmit={jest.fn()} />,
            {history}
        )

        act(() => {
            fireEvent.click(screen.getByText('Back to Apps'))
        })

        expect(historyPushSpy).toHaveBeenCalledWith(
            '/app/automation/actions-platform/apps'
        )
    })

    it('should render create button if actions app is new', () => {
        renderWithRouter(
            <ActionsPlatformAppForm apps={[app]} onSubmit={jest.fn()} />
        )

        expect(screen.getByText('Create App settings')).toBeInTheDocument()
    })

    it('should render save changes button if actions app already exists', () => {
        renderWithRouter(
            <ActionsPlatformAppForm
                value={{
                    id: 'someid',
                    auth_type: 'api-key',
                    auth_settings: {
                        url: 'https://example.com',
                    },
                }}
                apps={[app]}
                onSubmit={jest.fn()}
            />
        )

        expect(screen.getByText('Save Changes')).toBeInTheDocument()
    })

    it('should make save changes disabled if form is not dirty', () => {
        renderWithRouter(
            <ActionsPlatformAppForm
                value={{
                    id: 'someid',
                    auth_type: 'api-key',
                    auth_settings: {
                        url: 'https://example.com',
                    },
                }}
                apps={[app]}
                onSubmit={jest.fn()}
            />
        )

        expect(
            screen.getByRole('button', {name: 'Save Changes'})
        ).toBeAriaDisabled()
    })

    it('should make cancel button disabled if form is not dirty', () => {
        renderWithRouter(
            <ActionsPlatformAppForm
                value={{
                    id: 'someid',
                    auth_type: 'api-key',
                    auth_settings: {
                        url: 'https://example.com',
                    },
                }}
                apps={[app]}
                onSubmit={jest.fn()}
            />
        )

        expect(
            screen.getByRole('button', {
                name: 'Cancel',
            })
        ).toBeAriaDisabled()
    })

    it('should make app select box disabled if app is already selected', () => {
        renderWithRouter(
            <ActionsPlatformAppForm
                value={{
                    id: 'someid',
                    auth_type: 'api-key',
                    auth_settings: {
                        url: 'https://example.com',
                    },
                }}
                apps={[app]}
                onSubmit={jest.fn()}
            />
        )

        expect(
            screen.getByText('Test App').closest('[role="listbox"]')
        ).toHaveAttribute('tabindex', '-1')
    })

    it('should make auth type select box disabled if auth type is already selected', () => {
        renderWithRouter(
            <ActionsPlatformAppForm
                value={{
                    id: 'someid',
                    auth_type: 'api-key',
                    auth_settings: {
                        url: 'https://example.com',
                    },
                }}
                apps={[app]}
                onSubmit={jest.fn()}
            />
        )

        expect(
            screen.getByText('API key').closest('[role="listbox"]')
        ).toHaveAttribute('tabindex', '-1')
    })

    it('should trigger onSubmit handle', async () => {
        const mockOnSubmit = jest.fn()

        renderWithRouter(
            <ActionsPlatformAppForm apps={[app]} onSubmit={mockOnSubmit} />
        )

        act(() => {
            fireEvent.focus(screen.getByText('Select an App'))
        })

        act(() => {
            fireEvent.click(screen.getByText('Test App'))
        })

        act(() => {
            fireEvent.change(
                screen.getByPlaceholderText('https://link.gorgias.com/xyz'),
                {
                    target: {value: 'https://example.com'},
                }
            )
        })

        await flushPromises()

        act(() => {
            fireEvent.click(screen.getByText('Create App settings'))
        })

        expect(mockOnSubmit).toHaveBeenCalledWith({
            id: 'someid',
            auth_type: 'api-key',
            auth_settings: {
                url: 'https://example.com',
            },
        })
    })

    it('should not trigger onSubmit handle if form is submitting', async () => {
        const mockOnSubmit = jest.fn()

        renderWithRouter(
            <ActionsPlatformAppForm
                value={{
                    id: 'someid',
                    auth_type: 'api-key',
                    auth_settings: {
                        url: 'https://example.com',
                    },
                }}
                apps={[app]}
                onSubmit={mockOnSubmit}
                isSubmitting
            />
        )

        act(() => {
            fireEvent.change(screen.getByDisplayValue('https://example.com'), {
                target: {value: 'https://example2.com'},
            })
        })

        await flushPromises()

        act(() => {
            fireEvent.click(screen.getByText('Save Changes'))
        })

        expect(mockOnSubmit).not.toHaveBeenCalled()
    })
})
