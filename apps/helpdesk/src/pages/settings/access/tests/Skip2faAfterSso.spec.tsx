import { fireEvent, render, screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import Skip2faAfterSso from 'pages/settings/access/Skip2faAfterSso'
import type { RootState, StoreDispatch } from 'state/types'

describe('<Skip2faAfterSso />', () => {
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
        skip2faAfterSsoDatetime: null as string | null,
        loading: false,
        disabled: false,
        googleSsoEnabled: true,
        office365SsoEnabled: false,
        hasCustomSsoProviders: false,
        onToggle: jest.fn(),
    }

    afterEach(() => {
        jest.restoreAllMocks()
    })

    it('should render with skip 2FA not enabled', () => {
        render(
            <Provider store={defaultStore}>
                <Skip2faAfterSso
                    {...defaultProps}
                    skip2faAfterSsoDatetime={null}
                />
            </Provider>,
        )

        expect(
            screen.getByText('Skip two-factor authentication after SSO'),
        ).toBeInTheDocument()
        const toggle = screen.getByRole('switch', {
            name: 'Skip 2FA for SSO users',
        })
        expect(toggle).toHaveAttribute('aria-checked', 'false')
    })

    it('should render with skip 2FA enabled', () => {
        render(
            <Provider store={defaultStore}>
                <Skip2faAfterSso
                    {...defaultProps}
                    skip2faAfterSsoDatetime="2025-01-01T00:00:00"
                />
            </Provider>,
        )

        const toggle = screen.getByRole('switch', {
            name: 'Skip 2FA for SSO users',
        })
        expect(toggle).toHaveAttribute('aria-checked', 'true')
    })

    it('should show warning when no SSO provider is active', () => {
        render(
            <Provider store={defaultStore}>
                <Skip2faAfterSso
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
                <Skip2faAfterSso {...defaultProps} googleSsoEnabled={true} />
            </Provider>,
        )

        expect(
            screen.queryByText(/You must enable at least one SSO provider/),
        ).not.toBeInTheDocument()
    })

    it('should not call onToggle when toggling on without any SSO provider', () => {
        const onToggle = jest.fn()

        render(
            <Provider store={defaultStore}>
                <Skip2faAfterSso
                    {...defaultProps}
                    googleSsoEnabled={false}
                    office365SsoEnabled={false}
                    hasCustomSsoProviders={false}
                    onToggle={onToggle}
                />
            </Provider>,
        )

        const toggle = screen.getByLabelText('Skip 2FA for SSO users')
        fireEvent.click(toggle)

        expect(onToggle).not.toHaveBeenCalled()
    })

    it('should show confirmation modal when toggling on with an active provider', () => {
        const onToggle = jest.fn()

        render(
            <Provider store={defaultStore}>
                <Skip2faAfterSso
                    {...defaultProps}
                    skip2faAfterSsoDatetime={null}
                    googleSsoEnabled={true}
                    onToggle={onToggle}
                />
            </Provider>,
        )

        const toggle = screen.getByLabelText('Skip 2FA for SSO users')
        fireEvent.click(toggle)

        expect(screen.getByText('Skip 2FA after SSO?')).toBeInTheDocument()
        expect(onToggle).not.toHaveBeenCalled()
    })

    it('should enable skip 2FA when confirming the modal', () => {
        const onToggle = jest.fn()

        render(
            <Provider store={defaultStore}>
                <Skip2faAfterSso
                    {...defaultProps}
                    skip2faAfterSsoDatetime={null}
                    googleSsoEnabled={true}
                    onToggle={onToggle}
                />
            </Provider>,
        )

        fireEvent.click(screen.getByLabelText('Skip 2FA for SSO users'))
        fireEvent.click(screen.getByRole('button', { name: /Enable/i }))

        expect(onToggle).toHaveBeenCalledWith(
            expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/),
        )
    })

    it('should close the modal without enabling when cancelling', () => {
        const onToggle = jest.fn()

        render(
            <Provider store={defaultStore}>
                <Skip2faAfterSso
                    {...defaultProps}
                    skip2faAfterSsoDatetime={null}
                    googleSsoEnabled={true}
                    onToggle={onToggle}
                />
            </Provider>,
        )

        fireEvent.click(screen.getByLabelText('Skip 2FA for SSO users'))
        expect(screen.getByText('Skip 2FA after SSO?')).toBeInTheDocument()

        fireEvent.click(screen.getByRole('button', { name: /Cancel/i }))

        expect(onToggle).not.toHaveBeenCalled()
    })

    it('should disable skip 2FA when toggling off', () => {
        const onToggle = jest.fn()

        render(
            <Provider store={defaultStore}>
                <Skip2faAfterSso
                    {...defaultProps}
                    skip2faAfterSsoDatetime="2025-01-01T00:00:00"
                    onToggle={onToggle}
                />
            </Provider>,
        )

        const toggle = screen.getByLabelText('Skip 2FA for SSO users')
        fireEvent.click(toggle)

        expect(onToggle).toHaveBeenCalledWith(null)
    })

    it('should be disabled for Gorgias agent', () => {
        const onToggle = jest.fn()

        render(
            <Provider store={gorgiasAgentStore}>
                <Skip2faAfterSso {...defaultProps} onToggle={onToggle} />
            </Provider>,
        )

        const toggle = screen.getByLabelText('Skip 2FA for SSO users')
        fireEvent.click(toggle)
        expect(onToggle).not.toHaveBeenCalled()
    })

    it('should be disabled when disabled prop is true', () => {
        const onToggle = jest.fn()

        render(
            <Provider store={defaultStore}>
                <Skip2faAfterSso
                    {...defaultProps}
                    disabled={true}
                    onToggle={onToggle}
                />
            </Provider>,
        )

        const toggle = screen.getByLabelText('Skip 2FA for SSO users')
        fireEvent.click(toggle)
        expect(onToggle).not.toHaveBeenCalled()
    })
})
