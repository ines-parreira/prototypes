import React from 'react'

import { fireEvent, render, screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import SsoEnforcement from 'pages/settings/access/SsoEnforcement'
import type { RootState, StoreDispatch } from 'state/types'

describe('<SsoEnforcement />', () => {
    const createMockStore = configureMockStore<
        Partial<RootState>,
        StoreDispatch
    >([thunk])

    const defaultStore = createMockStore({
        currentUser: fromJS({
            id: 1,
            role: { name: 'Admin' },
        }),
    })

    const gorgiasAgentStore = createMockStore({
        currentUser: fromJS({
            id: 1,
            role: { name: 'internal-agent' },
        }),
    })

    const defaultProps = {
        ssoEnforcedDatetime: null as string | null,
        loading: false,
        disabled: false,
        googleSsoEnabled: true,
        office365SsoEnabled: false,
        hasCustomSsoProviders: false,
        onSsoEnforced: jest.fn(),
    }

    afterEach(() => {
        jest.restoreAllMocks()
    })

    it('should render with SSO not enforced', () => {
        render(
            <Provider store={defaultStore}>
                <SsoEnforcement {...defaultProps} ssoEnforcedDatetime={null} />
            </Provider>,
        )

        expect(screen.getByText('SSO Enforcement')).toBeInTheDocument()
        const toggle = screen.getByRole('switch', {
            name: 'Require SSO for all users',
        })
        expect(toggle).toHaveAttribute('aria-checked', 'false')
    })

    it('should render with SSO enforced', () => {
        render(
            <Provider store={defaultStore}>
                <SsoEnforcement
                    {...defaultProps}
                    ssoEnforcedDatetime="2025-01-01T00:00:00"
                />
            </Provider>,
        )

        const toggle = screen.getByRole('switch', {
            name: 'Require SSO for all users',
        })
        expect(toggle).toHaveAttribute('aria-checked', 'true')
    })

    it('should show warning when no SSO provider is active', () => {
        render(
            <Provider store={defaultStore}>
                <SsoEnforcement
                    {...defaultProps}
                    googleSsoEnabled={false}
                    office365SsoEnabled={false}
                    hasCustomSsoProviders={false}
                />
            </Provider>,
        )

        expect(
            screen.getByText(/You must enable at least one SSO provider/),
        ).toBeInTheDocument()
    })

    it('should not show warning when at least one SSO provider is active', () => {
        render(
            <Provider store={defaultStore}>
                <SsoEnforcement {...defaultProps} googleSsoEnabled={true} />
            </Provider>,
        )

        expect(
            screen.queryByText(/You must enable at least one SSO provider/),
        ).not.toBeInTheDocument()
    })

    it('should not call onSsoEnforced when toggling on without any SSO provider', () => {
        const onSsoEnforced = jest.fn()

        render(
            <Provider store={defaultStore}>
                <SsoEnforcement
                    {...defaultProps}
                    googleSsoEnabled={false}
                    office365SsoEnabled={false}
                    hasCustomSsoProviders={false}
                    onSsoEnforced={onSsoEnforced}
                />
            </Provider>,
        )

        const toggle = screen.getByLabelText('Require SSO for all users')
        fireEvent.click(toggle)

        expect(onSsoEnforced).not.toHaveBeenCalled()
    })

    it('should show confirmation modal when toggling on with an active provider', () => {
        const onSsoEnforced = jest.fn()

        render(
            <Provider store={defaultStore}>
                <SsoEnforcement
                    {...defaultProps}
                    ssoEnforcedDatetime={null}
                    googleSsoEnabled={true}
                    onSsoEnforced={onSsoEnforced}
                />
            </Provider>,
        )

        const toggle = screen.getByLabelText('Require SSO for all users')
        fireEvent.click(toggle)

        expect(screen.getByText('Enable SSO Enforcement?')).toBeInTheDocument()
        expect(onSsoEnforced).not.toHaveBeenCalled()
    })

    it('should enforce SSO when confirming the modal', () => {
        const onSsoEnforced = jest.fn()

        render(
            <Provider store={defaultStore}>
                <SsoEnforcement
                    {...defaultProps}
                    ssoEnforcedDatetime={null}
                    googleSsoEnabled={true}
                    onSsoEnforced={onSsoEnforced}
                />
            </Provider>,
        )

        fireEvent.click(screen.getByLabelText('Require SSO for all users'))
        fireEvent.click(screen.getByRole('button', { name: /Enable/i }))

        expect(onSsoEnforced).toHaveBeenCalledWith(
            expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/),
        )
    })

    it('should close the modal without enforcing SSO when cancelling', () => {
        const onSsoEnforced = jest.fn()

        render(
            <Provider store={defaultStore}>
                <SsoEnforcement
                    {...defaultProps}
                    ssoEnforcedDatetime={null}
                    googleSsoEnabled={true}
                    onSsoEnforced={onSsoEnforced}
                />
            </Provider>,
        )

        fireEvent.click(screen.getByLabelText('Require SSO for all users'))
        expect(screen.getByText('Enable SSO Enforcement?')).toBeInTheDocument()

        fireEvent.click(screen.getByRole('button', { name: /Cancel/i }))

        expect(onSsoEnforced).not.toHaveBeenCalled()
    })

    it('should disable SSO enforcement when toggling off', () => {
        const onSsoEnforced = jest.fn()

        render(
            <Provider store={defaultStore}>
                <SsoEnforcement
                    {...defaultProps}
                    ssoEnforcedDatetime="2025-01-01T00:00:00"
                    onSsoEnforced={onSsoEnforced}
                />
            </Provider>,
        )

        const toggle = screen.getByLabelText('Require SSO for all users')
        fireEvent.click(toggle)

        expect(onSsoEnforced).toHaveBeenCalledWith(null)
    })

    it('should be disabled for Gorgias agent', () => {
        const onSsoEnforced = jest.fn()

        render(
            <Provider store={gorgiasAgentStore}>
                <SsoEnforcement
                    {...defaultProps}
                    onSsoEnforced={onSsoEnforced}
                />
            </Provider>,
        )

        const toggle = screen.getByLabelText('Require SSO for all users')
        fireEvent.click(toggle)
        expect(onSsoEnforced).not.toHaveBeenCalled()
    })

    it('should be disabled when disabled prop is true', () => {
        const onSsoEnforced = jest.fn()

        render(
            <Provider store={defaultStore}>
                <SsoEnforcement
                    {...defaultProps}
                    disabled={true}
                    onSsoEnforced={onSsoEnforced}
                />
            </Provider>,
        )

        const toggle = screen.getByLabelText('Require SSO for all users')
        fireEvent.click(toggle)
        expect(onSsoEnforced).not.toHaveBeenCalled()
    })
})
