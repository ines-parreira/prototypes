import {fireEvent, render, screen} from '@testing-library/react'
import {fromJS} from 'immutable'
import {mockFlags} from 'jest-launchdarkly-mock'
import React, {ComponentProps} from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {FeatureFlagKey} from 'config/featureFlags'
import {integrationsState} from 'fixtures/integrations'
import {
    addInternalNoteAction,
    setOpenStatusAction,
    setSubjectAction,
    setTextAction,
    snoozeTicketAction,
} from 'fixtures/macro'
import {IntegrationType} from 'models/integration/types'
import {MacroActionName} from 'models/macroAction/types'
import {Attachment} from 'models/ticket/types'

import MacroEdit from '../MacroEdit'

jest.mock(
    'pages/tickets/detail/components/TicketDetails/TicketTags',
    () => () => 'TicketTagsMock'
)

jest.mock(
    'pages/common/forms/FileField',
    () =>
        ({onChange}: {onChange: (files: Attachment[]) => void}) => (
            <input
                onClick={() =>
                    onChange([{name: 'attachement name'} as Attachment])
                }
                value="FileFieldMock"
            />
        )
)

const mockStore = configureMockStore([thunk])

// To avoid snapshoting all languages
jest.mock('constants/languages', () => {
    const module: Record<string, unknown> = jest.requireActual(
        'constants/languages'
    )
    return {
        ...module,
        ISO639English: {
            aa: 'Afar',
            ab: 'Abkhazian',
        },
    }
})

const forwardByEmailAction = {
    type: 'user',
    execution: 'front',
    name: MacroActionName.ForwardByEmail,
    title: 'Add forward by email',
    arguments: {
        body_text: '',
        body_html: '',
        cc: 'test@gorgias.com',
        bcc: 'test@gorgias.com',
        from: 'test@gorgias.com',
    },
}

const removeTagAction = {
    type: 'user',
    execution: 'back',
    name: MacroActionName.RemoveTags,
    title: 'Remove tags',
    arguments: {
        tags: 'ai_close',
    },
}

const setAssignee = {
    type: 'user',
    execution: 'back',
    name: MacroActionName.SetAssignee,
    title: 'Assign an agent',
    arguments: {
        assignee_user: {
            name: 'Assigned user name',
        },
    },
}

const setTeamAssignee = {
    type: 'user',
    execution: 'back',
    name: MacroActionName.SetTeamAssignee,
    title: 'Assign a team',
    arguments: {
        assignee_user: {
            name: 'Assigned team name',
        },
    },
}

const flags = {
    [FeatureFlagKey.MacroResponseTextCcBcc]: true,
    [FeatureFlagKey.MacroForwardByEmail]: true,
}

mockFlags(flags)

const state = {
    ...integrationsState,
    integrations: [
        ...integrationsState.integrations,
        {
            deleted_datetime: null,
            meta: null,
            deactivated_datetime: null,
            name: 'Shopify',
            uri: '/api/integrations/88/',
            decoration: null,
            locked_datetime: null,
            created_datetime: '2017-02-07T06:07:43.481450+00:00',
            type: IntegrationType.Shopify,
            id: 88,
            description: null,
            updated_datetime: '2017-02-07T06:07:43.481517+00:00',
            managed: false,
        },
    ],
}

describe('MacroEdit component', () => {
    const defaultProps = {
        actions: fromJS([]),
        agents: fromJS({}),
        currentMacro: fromJS({id: 1}),
        name: 'Pizza Pepperoni',
        setActions: jest.fn(),
        setName: jest.fn(),
        flags,
    } as any as ComponentProps<typeof MacroEdit>

    it('should render the macro edit form', () => {
        const {container} = render(
            <Provider store={mockStore({integrations: fromJS(state)})}>
                <MacroEdit {...defaultProps} />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should change name input value', () => {
        render(
            <Provider store={mockStore({integrations: fromJS(state)})}>
                <MacroEdit {...defaultProps} name="Pizza Capricciosa" />
            </Provider>
        )

        fireEvent.change(screen.getByDisplayValue('Pizza Capricciosa'), {
            target: {value: 'Pizza 4 formaggi'},
        })
        expect(defaultProps.setName).toHaveBeenCalledWith('Pizza 4 formaggi')
    })

    it('should convert forwardByEmail to setResponseText', () => {
        render(
            <Provider store={mockStore({integrations: fromJS(state)})}>
                <MacroEdit
                    {...defaultProps}
                    actions={fromJS([
                        {
                            ...forwardByEmailAction,
                            arguments: {
                                ...forwardByEmailAction.arguments,
                                to: 'test@gorgias.com',
                            },
                        },
                    ])}
                />
            </Provider>
        )

        fireEvent.click(screen.getByText('Response text'))

        expect(defaultProps.setActions).toHaveBeenCalledWith(
            fromJS([
                {
                    ...forwardByEmailAction,
                    name: MacroActionName.SetResponseText,
                    title: 'Add response text',
                },
            ])
        )
    })

    it('should convert forwardByEmail to addInternalNote', () => {
        render(
            <Provider store={mockStore({integrations: fromJS(state)})}>
                <MacroEdit
                    {...defaultProps}
                    actions={fromJS([
                        {
                            ...forwardByEmailAction,
                            arguments: {
                                ...forwardByEmailAction.arguments,
                                body_text: 'test body',
                                body_html: 'test body',
                            },
                        },
                    ])}
                />
            </Provider>
        )

        expect(screen.getByText('test body')).toBeInTheDocument()
    })

    it('should remove tags action', () => {
        render(
            <Provider store={mockStore({integrations: fromJS(state)})}>
                <MacroEdit
                    {...defaultProps}
                    actions={fromJS([removeTagAction])}
                />
            </Provider>
        )

        expect(screen.getByText('Remove tags from ticket')).toBeInTheDocument()
    })

    it('should add tags action', () => {
        const {rerender} = render(
            <Provider store={mockStore({integrations: fromJS(state)})}>
                <MacroEdit {...defaultProps} />
            </Provider>
        )

        rerender(
            <Provider store={mockStore({integrations: fromJS(state)})}>
                <MacroEdit
                    {...defaultProps}
                    actions={fromJS([
                        {
                            name: MacroActionName.AddTags,
                            arguments: {},
                        },
                    ])}
                />
            </Provider>
        )

        expect(screen.getByText('Add tags to ticket')).toBeInTheDocument()
    })

    it('should add attachments', () => {
        const action = {
            name: MacroActionName.AddAttachments,
            arguments: {
                attachments: [],
            },
        }
        render(
            <Provider store={mockStore({integrations: fromJS(state)})}>
                <MacroEdit {...defaultProps} actions={fromJS([action])} />
            </Provider>
        )

        fireEvent.click(screen.getByDisplayValue('FileFieldMock'))
        expect(defaultProps.setActions).toHaveBeenCalledWith(
            fromJS([
                {
                    ...action,
                    arguments: {
                        attachments: fromJS([{name: 'attachement name'}]),
                    },
                },
            ])
        )
    })

    it('should remove attachments', () => {
        const action = {
            name: MacroActionName.AddAttachments,
            arguments: {
                attachments: [{name: 'attachement name', content_type: ''}],
            },
        }
        render(
            <Provider store={mockStore({integrations: fromJS(state)})}>
                <MacroEdit {...defaultProps} actions={fromJS([action])} />
            </Provider>
        )

        fireEvent.click(screen.getAllByText('close')[1])
        expect(defaultProps.setActions).toHaveBeenCalledWith(
            fromJS([
                {
                    ...action,
                    arguments: {
                        attachments: fromJS([]),
                    },
                },
            ])
        )
    })

    it('should update title of http action', () => {
        const action = {
            name: MacroActionName.Http,
            title: 'http action title',
            arguments: {},
        }
        render(
            <Provider store={mockStore({integrations: fromJS(state)})}>
                <MacroEdit {...defaultProps} actions={fromJS([action])} />
            </Provider>
        )

        fireEvent.change(screen.getByDisplayValue('http action title'), {
            target: {value: 'new title'},
        })
        expect(defaultProps.setActions).toHaveBeenCalledWith(
            fromJS([
                {
                    ...action,
                    title: 'new title',
                },
            ])
        )
    })

    it('should remove action', () => {
        render(
            <Provider store={mockStore({integrations: fromJS(state)})}>
                <MacroEdit
                    {...defaultProps}
                    actions={fromJS([
                        {
                            name: MacroActionName.AddTags,
                            arguments: {},
                        },
                    ])}
                />
            </Provider>
        )

        fireEvent.click(screen.getByText('close'))
        expect(defaultProps.setActions).toHaveBeenCalledWith(fromJS([]))
    })

    it('should set status action', () => {
        render(
            <Provider store={mockStore({integrations: fromJS(state)})}>
                <MacroEdit
                    {...defaultProps}
                    actions={fromJS([setOpenStatusAction])}
                />
            </Provider>
        )

        expect(screen.getByText(setOpenStatusAction.title)).toBeInTheDocument()
    })

    it('should set response text', () => {
        render(
            <Provider store={mockStore({integrations: fromJS(state)})}>
                <MacroEdit
                    {...defaultProps}
                    actions={fromJS([setTextAction])}
                />
            </Provider>
        )

        expect(screen.getAllByText('Response text')).toHaveLength(2)
    })

    it('should add inernal note action', () => {
        render(
            <Provider store={mockStore({integrations: fromJS(state)})}>
                <MacroEdit
                    {...defaultProps}
                    actions={fromJS([addInternalNoteAction])}
                />
            </Provider>
        )

        expect(screen.getAllByText('Internal note')).toHaveLength(3)
    })

    it('should set user assignee action', () => {
        render(
            <Provider store={mockStore({integrations: fromJS(state)})}>
                <MacroEdit {...defaultProps} actions={fromJS([setAssignee])} />
            </Provider>
        )

        expect(screen.getByText('Set user assignee')).toBeInTheDocument()
    })

    it('should set team assignee action', () => {
        render(
            <Provider store={mockStore({integrations: fromJS(state)})}>
                <MacroEdit
                    {...defaultProps}
                    actions={fromJS([setTeamAssignee])}
                />
            </Provider>
        )

        expect(screen.getByText('Set team assignee')).toBeInTheDocument()
    })

    it('should set subject action', () => {
        render(
            <Provider store={mockStore({integrations: fromJS(state)})}>
                <MacroEdit
                    {...defaultProps}
                    actions={fromJS([setSubjectAction])}
                />
            </Provider>
        )

        expect(screen.getByText('Set ticket subject')).toBeInTheDocument()
    })

    it('should set snooze action', () => {
        render(
            <Provider store={mockStore({integrations: fromJS(state)})}>
                <MacroEdit
                    {...defaultProps}
                    actions={fromJS([snoozeTicketAction])}
                />
            </Provider>
        )

        expect(screen.getByText('Snooze for')).toBeInTheDocument()
    })
})
