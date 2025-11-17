import { FeatureFlagKey } from '@repo/feature-flags'
import { QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { setupServer } from 'msw/node'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { mockListCustomFieldsHandler } from '@gorgias/helpdesk-mocks'

import { useFlag } from 'core/flags'
import { integrationsState } from 'fixtures/integrations'
import {
    addInternalNoteAction as addInternalNoteActionFixture,
    setOpenStatusAction,
    setPriorityAction,
    setSubjectAction,
    setTextAction,
    snoozeTicketAction,
} from 'fixtures/macro'
import { IntegrationType } from 'models/integration/types'
import { MacroActionName } from 'models/macroAction/types'
import type { Attachment } from 'models/ticket/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { renderWithRouter } from 'utils/testing'

import { MacroEdit } from '../MacroEdit'

const server = setupServer()
const queryClient = mockQueryClient()

beforeAll(() => server.listen())
afterEach(() => {
    server.resetHandlers()
})
afterAll(() => server.close())

jest.mock(
    'pages/common/forms/FileField',
    () =>
        ({ onChange }: { onChange: (files: Attachment[]) => void }) => (
            <input
                onClick={() =>
                    onChange([{ name: 'attachement name' } as Attachment])
                }
                value="FileFieldMock"
            />
        ),
)

jest.mock('../actions/SetCustomFieldValueAction', () => () => (
    <div data-testid="set-custom-field-value-action" />
))

jest.mock('../actions/SetStatusAction', () => () => (
    <div data-testid="set-status-action" />
))

jest.mock('../actions/SetPriorityAction', () => () => (
    <div data-testid="set-priority-action" />
))

jest.mock('core/flags')
const mockUseFlag = useFlag as jest.MockedFunction<typeof useFlag>

const mockStore = configureMockStore([thunk])

const mockListCustomFields = mockListCustomFieldsHandler()
server.use(mockListCustomFields.handler)

// To avoid snapshoting all languages
jest.mock('constants/languages', () => {
    const module: Record<string, unknown> = jest.requireActual(
        'constants/languages',
    )
    return {
        ...module,
        ISO639English: {
            aa: 'Afar',
            ab: 'Abkhazian',
        },
    }
})

const addInternalNoteAction = {
    ...addInternalNoteActionFixture,
    execution: 'back',
}

const setResponseTextAction = {
    type: 'user',
    execution: 'front',
    name: MacroActionName.SetResponseText,
    title: 'Add response text',
    arguments: {
        body_text: '',
        body_html: '',
    },
}

const forwardByEmailAction = {
    type: 'user',
    execution: 'back',
    name: MacroActionName.ForwardByEmail,
    title: 'Forward email',
    arguments: {
        body_text: '',
        body_html: '',
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
        currentMacro: { id: 1 },
        name: 'Pizza Pepperoni',
        setActions: jest.fn(),
        setName: jest.fn(),
        language: 'en',
        setLanguage: jest.fn(),
    }

    const renderComponent = (props?: Partial<typeof defaultProps>) =>
        renderWithRouter(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockStore({ integrations: fromJS(state) })}>
                    <MacroEdit {...defaultProps} {...props} />
                </Provider>
            </QueryClientProvider>,
        )

    beforeEach(() => {
        mockUseFlag.mockReturnValue(false)
    })

    it('should render the macro edit form', () => {
        renderComponent()

        expect(screen.getByDisplayValue(defaultProps.name)).toBeInTheDocument()
        expect(
            screen.getByText(new RegExp('Add action', 'i')),
        ).toBeInTheDocument()
        expect(
            screen.getByText(new RegExp('Add shopify action', 'i')),
        ).toBeInTheDocument()
    })

    it('should change name input value', () => {
        renderComponent({ name: 'Pizza Capricciosa' })

        fireEvent.change(screen.getByDisplayValue('Pizza Capricciosa'), {
            target: { value: 'Pizza 4 formaggi' },
        })

        expect(defaultProps.setName).toHaveBeenCalledWith('Pizza 4 formaggi')
    })

    it('should convert setResponseText to forwardByEmail', () => {
        mockUseFlag.mockReturnValue(true)
        const { container } = renderComponent({
            actions: fromJS([setResponseTextAction]),
        })

        fireEvent.click(
            container.querySelector(
                '#macro-action-header-item-forwardByEmail',
            ) as HTMLElement,
        )

        expect(defaultProps.setActions).toHaveBeenCalledWith(
            fromJS([
                {
                    ...forwardByEmailAction,
                    arguments: {
                        body_text: '',
                        body_html: '',
                    },
                },
            ]),
        )
    })

    it('should convert forwardByEmail to addInternalNote', () => {
        mockUseFlag.mockReturnValue(true)
        const { container } = renderComponent({
            actions: fromJS([forwardByEmailAction]),
        })

        fireEvent.click(
            container.querySelector(
                '#macro-action-header-item-addInternalNote',
            ) as HTMLElement,
        )

        expect(defaultProps.setActions).toHaveBeenCalledWith(
            fromJS([
                {
                    ...addInternalNoteAction,
                    arguments: {
                        body_text: '',
                        body_html: '',
                    },
                },
            ]),
        )
    })

    it('should preserve body_text and body_html when converting from AddInternalNote to SetResponseText', () => {
        mockUseFlag.mockReturnValue(true)
        const args = {
            body_text: 'Existing internal note text',
            body_html: '<p>Existing internal note HTML</p>',
            to: 'some@email.com',
        }
        const addInternalNoteWithContent = {
            ...addInternalNoteAction,
            arguments: args,
        }

        const { container } = renderComponent({
            actions: fromJS([addInternalNoteWithContent]),
        })

        fireEvent.click(
            container.querySelector(
                '#macro-action-header-item-setResponseText',
            ) as HTMLElement,
        )

        expect(defaultProps.setActions).toHaveBeenCalledWith(
            fromJS([
                {
                    name: MacroActionName.SetResponseText,
                    type: 'user',
                    execution: 'front',
                    title: 'Add response text',
                    arguments: {
                        body_text: args.body_text,
                        body_html: args.body_html,
                    },
                },
            ]),
        )
    })

    it('should remove tags action', () => {
        renderComponent({ actions: fromJS([removeTagAction]) })

        expect(screen.getByText('Remove tags from ticket')).toBeInTheDocument()
    })

    it('should add tags action', () => {
        renderComponent({
            actions: fromJS([
                {
                    name: MacroActionName.AddTags,
                    arguments: {},
                },
            ]),
        })

        expect(screen.getByText('Add tags to ticket')).toBeInTheDocument()
    })

    it('should add attachments', () => {
        const action = {
            name: MacroActionName.AddAttachments,
            arguments: {
                attachments: [],
            },
        }
        renderComponent({ actions: fromJS([action]) })

        fireEvent.click(screen.getByDisplayValue('FileFieldMock'))
        expect(defaultProps.setActions).toHaveBeenCalledWith(
            fromJS([
                {
                    ...action,
                    arguments: {
                        attachments: fromJS([{ name: 'attachement name' }]),
                    },
                },
            ]),
        )
    })

    it('should remove attachments', () => {
        const action = {
            name: MacroActionName.AddAttachments,
            arguments: {
                attachments: [{ name: 'attachement name', content_type: '' }],
            },
        }
        renderComponent({ actions: fromJS([action]) })

        fireEvent.click(screen.getAllByText('close')[1])
        expect(defaultProps.setActions).toHaveBeenCalledWith(
            fromJS([
                {
                    ...action,
                    arguments: {
                        attachments: fromJS([]),
                    },
                },
            ]),
        )
    })

    it('should update title of http action', () => {
        const action = {
            name: MacroActionName.Http,
            title: 'http action title',
            arguments: {},
        }
        renderComponent({ actions: fromJS([action]) })

        fireEvent.change(screen.getByDisplayValue('http action title'), {
            target: { value: 'new title' },
        })

        expect(defaultProps.setActions).toHaveBeenCalledWith(
            fromJS([
                {
                    ...action,
                    title: 'new title',
                },
            ]),
        )
    })

    it('should remove action', () => {
        renderComponent({
            actions: fromJS([
                {
                    name: MacroActionName.AddTags,
                    arguments: {},
                },
            ]),
        })

        fireEvent.click(screen.getByText('close'))

        expect(defaultProps.setActions).toHaveBeenCalledWith(fromJS([]))
    })

    it('should set status action', () => {
        renderComponent({ actions: fromJS([setOpenStatusAction]) })

        expect(screen.getByText(setOpenStatusAction.title)).toBeInTheDocument()
    })

    it('should set response text', () => {
        mockUseFlag.mockImplementation((flag) => {
            if (flag === FeatureFlagKey.MacroResponseTextCcBcc) {
                return true
            }
            return false
        })
        renderComponent({ actions: fromJS([setTextAction]) })

        expect(screen.getAllByText('Response text')).toHaveLength(2)
    })

    it('should add internal note action', () => {
        mockUseFlag.mockImplementation((flag) => {
            if (flag === FeatureFlagKey.MacroResponseTextCcBcc) {
                return true
            }
            return false
        })
        renderComponent({ actions: fromJS([addInternalNoteAction]) })

        expect(screen.getAllByText('Internal note')).toHaveLength(3)
    })

    it('should set user assignee action', () => {
        renderComponent({ actions: fromJS([setAssignee]) })

        expect(screen.getByText('Set user assignee')).toBeInTheDocument()
    })

    it('should set team assignee action', () => {
        renderComponent({ actions: fromJS([setTeamAssignee]) })

        expect(screen.getByText('Set team assignee')).toBeInTheDocument()
    })

    it('should set subject action', () => {
        renderComponent({ actions: fromJS([setSubjectAction]) })

        expect(screen.getByText('Set ticket subject')).toBeInTheDocument()
    })

    it('should set snooze action', () => {
        renderComponent({ actions: fromJS([snoozeTicketAction]) })

        expect(screen.getByText('Snooze for')).toBeInTheDocument()
    })

    it('should set priority action', () => {
        renderComponent({ actions: fromJS([setPriorityAction]) })

        expect(screen.getByText('Set priority')).toBeInTheDocument()
    })

    it('should add a new action when clicking on dropdown item', async () => {
        renderComponent()

        fireEvent.click(screen.getByText(new RegExp('Add action', 'i')))

        fireEvent.click(screen.getByText('Set status'))

        const setActionsCall = defaultProps.setActions.mock.calls[0][0]
        expect(setActionsCall).toBeImmutableList()
        expect(setActionsCall).toEqualImmutable(
            fromJS([
                {
                    name: MacroActionName.SetStatus,
                    type: 'user',
                    execution: 'back',
                    title: 'Set status',
                    arguments: {
                        status: 'open',
                    },
                },
            ]),
        )
    })

    it('should render ExcludeFromAutoMerge action', () => {
        const action = {
            name: MacroActionName.ExcludeFromAutoMerge,
            arguments: {},
        }
        renderComponent({ actions: fromJS([action]) })

        expect(
            screen.getByText('Exclude ticket from Auto-Merge'),
        ).toBeInTheDocument()
    })

    it('should render ExcludeFromCSAT action', () => {
        const action = {
            name: MacroActionName.ExcludeFromCSAT,
            arguments: {},
        }
        render(
            <Provider store={mockStore({ integrations: fromJS(state) })}>
                <MacroEdit {...defaultProps} actions={fromJS([action])} />
            </Provider>,
        )

        expect(screen.getByText('Exclude ticket from CSAT')).toBeInTheDocument()
    })

    it('should render SetCustomFieldValue action', () => {
        const action = {
            name: MacroActionName.SetCustomFieldValue,
            arguments: {
                custom_field_id: 1,
                value: 'Custom field value',
            },
        }
        renderComponent({ actions: fromJS([action]) })

        expect(screen.getAllByText('Set ticket field')).toHaveLength(2) // 2 because of the displayed action and the dropdown item
    })

    it('should not render integration action dropdown when all actions are already used', () => {
        // Create a macro with all available Shopify actions already used
        const allShopifyActions = [
            MacroActionName.ShopifyCancelLastOrder,
            MacroActionName.ShopifyCancelOrder,
            MacroActionName.ShopifyDuplicateLastOrder,
            MacroActionName.ShopifyEditNoteLastOrder,
            MacroActionName.ShopifyEditShippingAddressLastOrder,
            MacroActionName.ShopifyFullRefundLastOrder,
            MacroActionName.ShopifyPartialRefundLastOrder,
            MacroActionName.ShopifyRefundShippingCostLastOrder,
        ]

        const actionsWithAllShopify = allShopifyActions.map((actionName) => ({
            name: actionName,
            type: 'user',
            execution: 'back',
            arguments: {},
        }))

        renderComponent({ actions: fromJS(actionsWithAllShopify) })

        expect(
            screen.queryByText(/Add shopify action/i),
        ).not.toBeInTheDocument()
    })

    it('should render customer field action with proper title when feature flag is enabled', () => {
        mockUseFlag.mockReturnValue(true)
        const customerFieldAction = {
            name: MacroActionName.SetCustomerCustomFieldValue,
            arguments: {
                custom_field_id: 1,
                value: 'VIP Customer',
            },
        }
        renderComponent({ actions: fromJS([customerFieldAction]) })

        expect(screen.getAllByText('Set customer field')).toHaveLength(2)
    })

    it('should not render customer field action when feature flag is disabled', () => {
        mockUseFlag.mockReturnValue(false)
        const customerFieldAction = {
            name: MacroActionName.SetCustomerCustomFieldValue,
            arguments: {
                custom_field_id: 1,
                value: 'VIP Customer',
            },
        }
        renderComponent({ actions: fromJS([customerFieldAction]) })

        expect(screen.queryByText('Set customer field')).not.toBeInTheDocument()
    })

    it('should allow multiple customer field actions when feature flag is enabled', () => {
        mockUseFlag.mockReturnValue(true)
        const actionsWithMultipleCustomerFields = [
            {
                name: MacroActionName.SetCustomerCustomFieldValue,
                arguments: {
                    custom_field_id: 1,
                    value: 'VIP Customer',
                },
            },
            {
                name: MacroActionName.SetCustomerCustomFieldValue,
                arguments: {
                    custom_field_id: 2,
                    value: 'Premium Customer',
                },
            },
        ]

        renderComponent({ actions: fromJS(actionsWithMultipleCustomerFields) })

        expect(screen.getAllByText('Set customer field')).toHaveLength(3)
    })

    it('should show customer field action in dropdown when feature flag is enabled', () => {
        mockUseFlag.mockReturnValue(true)
        renderComponent()

        fireEvent.click(screen.getByText(new RegExp('Add action', 'i')))

        expect(screen.getByText('Set customer field')).toBeInTheDocument()
    })

    it('should not show customer field action in dropdown when feature flag is disabled', () => {
        mockUseFlag.mockReturnValue(false)
        renderComponent()

        fireEvent.click(screen.getByText(new RegExp('Add action', 'i')))

        expect(screen.queryByText('Set customer field')).not.toBeInTheDocument()
    })
})
