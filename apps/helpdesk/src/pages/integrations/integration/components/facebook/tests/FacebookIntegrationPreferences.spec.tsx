import React, { ComponentProps } from 'react'

import { fireEvent, render, waitFor } from '@testing-library/react'
import { fromJS, Map } from 'immutable'

import {
    CHAT_AUTO_RESPONDER_ENABLED_DEFAULT,
    CHAT_AUTO_RESPONDER_REPLY_DEFAULT,
    CHAT_AUTO_RESPONDER_REPLY_IN_DAY,
    CHAT_AUTO_RESPONDER_REPLY_IN_HOURS,
} from 'config/integrations'
import { FACEBOOK_LANGUAGE_DEFAULT } from 'config/integrations/facebook'
import { FACEBOOK_INTEGRATION_TYPE } from 'constants/integration'

import { FacebookIntegrationPreferences } from '../FacebookIntegrationPreferences'

const mockUpdateOrCreateIntegration = jest.fn()

describe('<FacebookIntegrationPreferences/>', () => {
    const minProps: ComponentProps<typeof FacebookIntegrationPreferences> = {
        updateOrCreateIntegration: mockUpdateOrCreateIntegration,
        integration: fromJS({}),
    }

    describe('componentWillMount()', () => {
        it('should not initialize the state because the passed integration is empty', () => {
            const { getByText, queryByRole } = render(
                <FacebookIntegrationPreferences {...minProps} />,
            )

            expect(getByText(/This message will be sent/)).toHaveClass(
                'text-faded',
            )
            expect(queryByRole('radio')).toBeNull()
        })

        it('should initialize the state because the passed integration is not empty', async () => {
            const integration: ComponentProps<
                typeof FacebookIntegrationPreferences
            >['integration'] = fromJS({
                id: 1,
                type: FACEBOOK_INTEGRATION_TYPE,
                meta: {
                    language: FACEBOOK_LANGUAGE_DEFAULT,
                    preferences: {
                        auto_responder: {
                            enabled: true,
                            reply: CHAT_AUTO_RESPONDER_REPLY_IN_HOURS,
                        },
                    },
                },
            })

            const { getByText } = render(
                <FacebookIntegrationPreferences
                    {...minProps}
                    integration={integration}
                />,
            )

            expect(getByText(/This message will be sent/)).not.toHaveClass(
                'text-faded',
            )
            await waitFor(() => {
                expect(
                    document.getElementById(CHAT_AUTO_RESPONDER_REPLY_IN_HOURS),
                ).toBeChecked()
            })
        })
    })

    describe('componentDidUpdate()', () => {
        it('should not initialize the state because the passed integration is empty', () => {
            const { getByText, queryByRole, rerender } = render(
                <FacebookIntegrationPreferences {...minProps} />,
            )

            rerender(
                <FacebookIntegrationPreferences
                    {...minProps}
                    integration={fromJS({})}
                />,
            )

            expect(getByText(/This message will be sent/)).toHaveClass(
                'text-faded',
            )
            expect(queryByRole('radio')).toBeNull()
        })

        it('should initialize the state because the passed integration is not empty', async () => {
            const integration: ComponentProps<
                typeof FacebookIntegrationPreferences
            >['integration'] = fromJS({
                id: 1,
                type: FACEBOOK_INTEGRATION_TYPE,
                meta: {
                    language: FACEBOOK_LANGUAGE_DEFAULT,
                    preferences: {
                        auto_responder: {
                            enabled: true,
                            reply: CHAT_AUTO_RESPONDER_REPLY_IN_HOURS,
                        },
                    },
                },
            })
            const { getByText, rerender } = render(
                <FacebookIntegrationPreferences {...minProps} />,
            )
            rerender(
                <FacebookIntegrationPreferences
                    {...minProps}
                    integration={integration}
                />,
            )

            expect(getByText(/This message will be sent/)).not.toHaveClass(
                'text-faded',
            )
            await waitFor(() => {
                expect(
                    document.getElementById(CHAT_AUTO_RESPONDER_REPLY_IN_HOURS),
                ).toBeChecked()
            })
        })
    })

    describe('_setAutoResponderEnabled()', () => {
        it('should set passed value in the state', () => {
            const { getByRole } = render(
                <FacebookIntegrationPreferences {...minProps} />,
            )
            const checkbox = getByRole('checkbox')

            expect(checkbox).not.toBeChecked()

            fireEvent.click(checkbox)

            expect(checkbox).toBeChecked()
        })
    })

    describe('_setAutoResponderReply()', () => {
        it('should set passed value in the state', async () => {
            const integration: ComponentProps<
                typeof FacebookIntegrationPreferences
            >['integration'] = fromJS({
                id: 1,
                type: FACEBOOK_INTEGRATION_TYPE,
                meta: {
                    language: FACEBOOK_LANGUAGE_DEFAULT,
                    preferences: {
                        auto_responder: {
                            enabled: true,
                            reply: CHAT_AUTO_RESPONDER_REPLY_IN_HOURS,
                        },
                    },
                },
            })

            render(
                <FacebookIntegrationPreferences
                    {...minProps}
                    integration={integration}
                />,
            )

            fireEvent.click(
                document.getElementById(CHAT_AUTO_RESPONDER_REPLY_IN_DAY)!,
            )

            await waitFor(() => {
                expect(
                    document.getElementById(CHAT_AUTO_RESPONDER_REPLY_IN_DAY),
                ).toBeChecked()
            })
        })
    })

    describe('form submission', () => {
        it('should submit the form with defaults', () => {
            const { getByText } = render(
                <FacebookIntegrationPreferences {...minProps} />,
            )

            fireEvent.click(getByText('Save changes'))

            expect(mockUpdateOrCreateIntegration).toHaveBeenCalledWith(
                fromJS({
                    id: undefined,
                    meta: {
                        preferences: {
                            auto_responder: {
                                enabled: CHAT_AUTO_RESPONDER_ENABLED_DEFAULT,
                                reply: CHAT_AUTO_RESPONDER_REPLY_DEFAULT,
                            },
                        },
                    },
                }),
            )
        })

        it('should submit the form with loaded values', () => {
            const integration: ComponentProps<
                typeof FacebookIntegrationPreferences
            >['integration'] = fromJS({
                id: 1,
                type: FACEBOOK_INTEGRATION_TYPE,
                meta: {
                    language: FACEBOOK_LANGUAGE_DEFAULT,
                    preferences: {
                        auto_responder: {
                            enabled: true,
                            reply: CHAT_AUTO_RESPONDER_REPLY_IN_HOURS,
                        },
                    },
                },
            })
            const { getByText } = render(
                <FacebookIntegrationPreferences
                    {...minProps}
                    integration={integration}
                />,
            )

            fireEvent.click(
                document.getElementById(CHAT_AUTO_RESPONDER_REPLY_IN_DAY)!,
            )
            fireEvent.click(getByText('Save changes'))

            expect(mockUpdateOrCreateIntegration).toHaveBeenCalledWith(
                fromJS({
                    id: integration.get('id'),
                    meta: (integration.get('meta') as Map<any, any>).setIn(
                        ['preferences', 'auto_responder', 'reply'],
                        CHAT_AUTO_RESPONDER_REPLY_IN_DAY,
                    ),
                }),
            )
        })
    })

    describe('render()', () => {
        it('should render the Facebook preferences', () => {
            const { container } = render(
                <FacebookIntegrationPreferences
                    {...minProps}
                    integration={fromJS({
                        id: 2,
                        type: FACEBOOK_INTEGRATION_TYPE,
                        meta: { language: FACEBOOK_LANGUAGE_DEFAULT },
                    })}
                />,
            )

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render loading buttons because the integration is being updated', () => {
            const { getByText } = render(
                <FacebookIntegrationPreferences
                    {...minProps}
                    integration={fromJS({
                        id: 2,
                        type: FACEBOOK_INTEGRATION_TYPE,
                        meta: { language: FACEBOOK_LANGUAGE_DEFAULT },
                    })}
                />,
            )

            fireEvent.click(getByText('Save changes'))

            expect(getByText('Save changes').parentNode).toHaveClass(
                'btn-loading',
            )
        })
    })
})
