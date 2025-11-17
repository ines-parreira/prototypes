import type { ComponentProps } from 'react'

import { userEvent } from '@repo/testing'
import { fireEvent, screen } from '@testing-library/react'
import type { History, Location } from 'history'
import { fromJS } from 'immutable'
import type { match } from 'react-router-dom'

import {
    PENDING_AUTHENTICATION_STATUS,
    SMILE_INTEGRATION_TYPE,
    SUCCESS_AUTHENTICATION_STATUS,
} from 'constants/integration'
import { SmileIntegrationDetailComponent } from 'pages/integrations/integration/components/smile/SmileIntegrationDetail'
import { INTEGRATION_REMOVAL_CONFIGURATION_TEXT } from 'pages/integrations/integration/constants'
import { renderWithRouter } from 'utils/testing'

jest.useFakeTimers()

type Integration = ComponentProps<
    typeof SmileIntegrationDetailComponent
>['integration']

describe('<SmileIntegrationDetail/>', () => {
    const actions = {
        fetchIntegration: jest.fn(),
        updateOrCreateIntegration: jest.fn(),
    }

    const defaultProps: ComponentProps<typeof SmileIntegrationDetailComponent> =
        {
            ...actions,
            integration: fromJS({}),
            redirectUri: fromJS({}),
            loading: fromJS({}),
            history: {} as History,
            location: {} as Location,
            match: {} as match,
            deleteIntegration: jest.fn(),
        }

    describe('componentDidMount()', () => {
        it("should set the integration's name in the state", () => {
            const integration: Integration = fromJS({
                id: 1,
                meta: {
                    oauth: { status: SUCCESS_AUTHENTICATION_STATUS },
                    sync_state: { is_initialized: false },
                },
                name: 'foo',
            })

            const { container } = renderWithRouter(
                <SmileIntegrationDetailComponent
                    {...defaultProps}
                    integration={integration}
                />,
            )

            expect(container.firstChild).toMatchSnapshot()
        })
    })

    describe('componentWillReceiveProps()', () => {
        it('should not do anything because there is no integration', () => {
            const { container } = renderWithRouter(
                <SmileIntegrationDetailComponent
                    {...defaultProps}
                    integration={fromJS({})}
                />,
            )

            expect(container.firstChild).toMatchSnapshot()
            jest.runAllTimers()
            expect(actions.fetchIntegration).not.toHaveBeenCalled()
        })

        it('should not do anything because the previous integration was not empty', () => {
            const integration: Integration = fromJS({
                id: 1,
                meta: {
                    oauth: { status: SUCCESS_AUTHENTICATION_STATUS },
                    sync_state: { is_initialized: false },
                },
                name: 'foo',
            })

            const { container, rerender } = renderWithRouter(
                <SmileIntegrationDetailComponent
                    {...defaultProps}
                    integration={integration}
                />,
            )

            rerender(
                <SmileIntegrationDetailComponent
                    {...defaultProps}
                    integration={integration.set('name', 'bar')}
                />,
            )

            expect(container.firstChild).toMatchSnapshot()
            jest.runAllTimers()
            expect(actions.fetchIntegration).not.toHaveBeenCalled()
        })

        it(
            'should set the name of the integration in the state because there was no integration before and there is ' +
                'one now',
            () => {
                const integration: Integration = fromJS({
                    id: 1,
                    meta: {
                        oauth: { status: SUCCESS_AUTHENTICATION_STATUS },
                        sync_state: { is_initialized: false },
                    },
                    name: 'foo',
                })

                const { container, rerender } = renderWithRouter(
                    <SmileIntegrationDetailComponent
                        {...defaultProps}
                        integration={fromJS({})}
                    />,
                )

                rerender(
                    <SmileIntegrationDetailComponent
                        {...defaultProps}
                        integration={integration}
                    />,
                )

                expect(container.firstChild).toMatchSnapshot()
                jest.runAllTimers()
                expect(actions.fetchIntegration).not.toHaveBeenCalled()
            },
        )

        it(
            'should set the name of the integration the state and set a timeout to fetch the integration because ' +
                'the action in the URL is set to `authentication` and the integration is not yet authenticated',
            () => {
                const integration: Integration = fromJS({
                    id: 1,
                    type: SMILE_INTEGRATION_TYPE,
                    meta: {
                        oauth: { status: PENDING_AUTHENTICATION_STATUS },
                        sync_state: { is_initialized: false },
                    },
                    name: 'foo',
                })

                const { container, rerender } = renderWithRouter(
                    <SmileIntegrationDetailComponent
                        {...defaultProps}
                        integration={fromJS({})}
                    />,
                )

                rerender(
                    <SmileIntegrationDetailComponent
                        {...defaultProps}
                        integration={integration}
                        location={{ search: '?action=authentication' } as any}
                    />,
                )

                expect(container.firstChild).toMatchSnapshot()
                jest.runAllTimers()
                expect(actions.fetchIntegration).toHaveBeenCalledWith(
                    integration.get('id'),
                    integration.get('type'),
                    true,
                )
            },
        )

        it(
            'should set the name of the integration the state and trigger a success notification because the action ' +
                'in the URL is set to `authentication` and the integration is already authenticated',
            () => {
                const integration: Integration = fromJS({
                    id: 1,
                    type: SMILE_INTEGRATION_TYPE,
                    meta: {
                        oauth: { status: SUCCESS_AUTHENTICATION_STATUS },
                        sync_state: { is_initialized: false },
                    },
                    name: 'foo',
                })

                const { container, rerender } = renderWithRouter(
                    <SmileIntegrationDetailComponent
                        {...defaultProps}
                        integration={fromJS({})}
                    />,
                )

                rerender(
                    <SmileIntegrationDetailComponent
                        {...defaultProps}
                        integration={integration}
                        location={{ search: '?action=authentication' } as any}
                    />,
                )

                expect(container.firstChild).toMatchSnapshot()
                jest.runAllTimers()
                expect(actions.fetchIntegration).not.toHaveBeenCalled()
            },
        )
    })

    describe('_handleUpdate()', () => {
        it(
            'should call `updateOrCreateIntegration` with the integration passed in the props updated with the name' +
                'from the state',
            () => {
                const integration: Integration = fromJS({
                    id: 1,
                    meta: {
                        oauth: { status: SUCCESS_AUTHENTICATION_STATUS },
                        sync_state: { is_initialized: false },
                    },
                    name: 'foo',
                })
                const newName = 'bar'

                renderWithRouter(
                    <SmileIntegrationDetailComponent
                        {...defaultProps}
                        integration={integration}
                    />,
                )

                userEvent.clear(
                    screen.getByRole('textbox', { name: 'Integration name' }),
                )
                userEvent.paste(
                    screen.getByRole('textbox', { name: 'Integration name' }),
                    newName,
                )
                userEvent.click(
                    screen.getByRole('button', { name: 'Update integration' }),
                )

                expect(actions.updateOrCreateIntegration).toHaveBeenCalledWith(
                    fromJS({ id: integration.get('id'), name: newName }),
                )
            },
        )
    })

    describe('render()', () => {
        it('should render a loader because the integration is loading', () => {
            const { container } = renderWithRouter(
                <SmileIntegrationDetailComponent
                    {...defaultProps}
                    integration={fromJS({
                        id: 1,
                        meta: {
                            oauth: { status: SUCCESS_AUTHENTICATION_STATUS },
                            sync_state: { is_initialized: false },
                        },
                    })}
                    loading={fromJS({ integration: true })}
                />,
            )

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render an alert because the import is in progress', () => {
            const { container } = renderWithRouter(
                <SmileIntegrationDetailComponent
                    {...defaultProps}
                    integration={fromJS({
                        id: 1,
                        meta: {
                            oauth: { status: SUCCESS_AUTHENTICATION_STATUS },
                            sync_state: { is_initialized: false },
                        },
                    })}
                />,
            )

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render a small paragraph because the import is over', () => {
            const { container } = renderWithRouter(
                <SmileIntegrationDetailComponent
                    {...defaultProps}
                    integration={fromJS({
                        id: 1,
                        meta: {
                            oauth: { status: SUCCESS_AUTHENTICATION_STATUS },
                            sync_state: { is_initialized: true },
                        },
                    })}
                />,
            )

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render buttons loading and disabled because a submit is in progress', () => {
            const { container } = renderWithRouter(
                <SmileIntegrationDetailComponent
                    {...defaultProps}
                    integration={fromJS({
                        id: 1,
                        meta: {
                            oauth: { status: SUCCESS_AUTHENTICATION_STATUS },
                            sync_state: { is_initialized: false },
                        },
                    })}
                    loading={fromJS({ updateIntegration: true })}
                />,
            )

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render not render deactivate / reactivate buttons because authentication is required', () => {
            const { container } = renderWithRouter(
                <SmileIntegrationDetailComponent
                    {...defaultProps}
                    integration={fromJS({
                        id: 1,
                        meta: {
                            oauth: { status: PENDING_AUTHENTICATION_STATUS },
                            sync_state: { is_initialized: false },
                        },
                    })}
                />,
            )

            expect(container.firstChild).toMatchSnapshot()
        })

        it(
            'should not render anything about the import and render the re-activate button instead of the deactivate ' +
                'button because the integration is deactivated',
            () => {
                const { container } = renderWithRouter(
                    <SmileIntegrationDetailComponent
                        {...defaultProps}
                        integration={fromJS({
                            id: 1,
                            meta: {
                                oauth: {
                                    status: SUCCESS_AUTHENTICATION_STATUS,
                                },
                                sync_state: { is_initialized: false },
                            },
                            deactivated_datetime: '2018-01-01 10:12',
                        })}
                    />,
                )

                expect(container.firstChild).toMatchSnapshot()
            },
        )

        it('should check the warning message of removing the integration, it should contain the text related to saved filters', () => {
            const { getByRole, getByText } = renderWithRouter(
                <SmileIntegrationDetailComponent
                    {...{
                        ...defaultProps,
                    }}
                    integration={fromJS({
                        id: 1,
                        meta: {
                            oauth: { status: SUCCESS_AUTHENTICATION_STATUS },
                            sync_state: { is_initialized: false },
                        },
                    })}
                />,
            )

            fireEvent.click(
                getByRole('button', { name: /Delete integration/i }),
            )

            expect(
                getByText(INTEGRATION_REMOVAL_CONFIGURATION_TEXT),
            ).toBeInTheDocument()
        })
    })
})
