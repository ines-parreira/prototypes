import type { ComponentProps } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { history } from '@repo/routing'
import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import { Router } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'

import { GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT } from 'config/integrations/gorgias_chat'
import {
    GORGIAS_CHAT_INTEGRATION_TYPE,
    SHOPIFY_INTEGRATION_TYPE,
} from 'constants/integration'
import { entitiesInitialState } from 'fixtures/entities'
import { user } from 'fixtures/users'
import {
    GorgiasChatAvatarImageType,
    GorgiasChatAvatarNameType,
    GorgiasChatLauncherType,
} from 'models/integration/types'
import type * as IntegrationsActions from 'state/integrations/actions'
import type { RootState, StoreDispatch } from 'state/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import { GorgiasChatIntegrationAppearanceComponent } from '../GorgiasChatIntegrationAppearance'

const mockStore = configureMockStore<RootState, StoreDispatch>()

const defaultState = {
    agents: fromJS({
        all: [user],
    }),
    entities: entitiesInitialState,
} as unknown as RootState

jest.mock('@repo/feature-flags')
const mockUseFlag = useFlag as jest.MockedFunction<typeof useFlag>

jest.mock('lodash/uniqueId', () => (id?: string) => `${id || ''}42`)

jest.mock('pages/common/forms/FileField', () => {
    type MockedProps = {
        required: boolean
    }

    const FileFieldMocked = ({ required }: MockedProps) => {
        return (
            <div>
                FileField component is required ? {required ? 'true' : 'false'}
            </div>
        )
    }

    return {
        __esModule: true,
        default: FileFieldMocked,
    }
})

type Props = ComponentProps<typeof GorgiasChatIntegrationAppearanceComponent>

jest.mock('../../../GorgiasChatIntegrationConnectedChannel', () => () => {
    return <div data-testid="GorgiasChatIntegrationConnectedChannel" />
})

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/legacy/GorgiasChatIntegrationHeader',
    () => () => {
        return <div data-testid="GorgiasChatIntegrationHeader" />
    },
)

const mockClient = mockQueryClient()

const singleStore = [
    {
        id: 1,
        name: 'myStore1',
        type: SHOPIFY_INTEGRATION_TYPE,
        meta: {
            shop_name: 'myStore1',
        },
    },
] as any

const twoStores = [
    ...singleStore,
    {
        id: 2,
        name: 'myStore2',
        type: SHOPIFY_INTEGRATION_TYPE,
        meta: {
            shop_name: 'myStore2',
        },
    },
] as any

function createActions(overrides: Record<string, jest.Mock> = {}) {
    return {
        createGorgiasChatIntegration: jest.fn(() => Promise.resolve()),
        deleteIntegration: jest.fn(() => Promise.resolve()),
        updateOrCreateIntegration: jest.fn(() => Promise.resolve()),
        ...overrides,
    } as unknown as typeof IntegrationsActions
}

describe('<GorgiasChatIntegrationAppearanceRevamp/>', () => {
    const realCSS = global.CSS

    const minProps = {
        gorgiasChatIntegrations: [] as any,
        storeIntegrations: twoStores,
        actions: createActions(),
        currentAccount: fromJS({
            meta: {
                company_name: 'Acme Corp',
            },
        }) as Map<any, any>,
    } as any as Props

    function renderComponent(propOverrides: Partial<Props> = {}) {
        const props = { ...minProps, ...propOverrides }
        return render(
            <Router history={history}>
                <QueryClientProvider client={mockClient}>
                    <Provider store={mockStore(defaultState)}>
                        <GorgiasChatIntegrationAppearanceComponent {...props} />
                    </Provider>
                </QueryClientProvider>
            </Router>,
        )
    }

    beforeEach(() => {
        jest.resetAllMocks()

        const fixedDate = new Date('2019-06-24')
        jest.spyOn(Date, 'now').mockImplementation(() => fixedDate.getTime())

        global.CSS = {
            ...global.CSS,
            supports: (): boolean => true,
            escape: realCSS?.escape,
        }

        mockUseFlag.mockImplementation((key, defaultValue) => {
            if (key === FeatureFlagKey.ChatEnableTranslationEdit) {
                return true
            }
            if (key === FeatureFlagKey.ChatControlBotLabelVisibility) {
                return true
            }
            if (key === FeatureFlagKey.ChatControlOutsideBusinessHoursColor) {
                return true
            }
            return defaultValue
        })
    })

    afterEach(() => {
        global.CSS = realCSS
    })

    describe('render()', () => {
        it('should render platform type selection when creating a new chat integration', () => {
            renderComponent({
                loading: fromJS({ updateIntegration: false }),
                integration: fromJS({}),
                isUpdate: false,
            })

            expect(screen.getByText('Ecommerce platforms')).toBeInTheDocument()
            expect(screen.getByText('Any other website')).toBeInTheDocument()
        })

        it('should not show chat title field when ecommerce platform is selected', () => {
            renderComponent({
                loading: fromJS({ updateIntegration: false }),
                integration: fromJS({}),
                isUpdate: false,
            })

            expect(
                screen.queryByRole('textbox', { name: /Chat title/i }),
            ).not.toBeInTheDocument()
        })

        it('should show chat title field when "any other website" is selected', async () => {
            const interactor = userEvent.setup()

            renderComponent({
                loading: fromJS({ updateIntegration: false }),
                integration: fromJS({}),
                isUpdate: false,
            })

            await interactor.click(screen.getByText('Any other website'))

            expect(
                screen.getByRole('textbox', { name: /Chat title/i }),
            ).toBeInTheDocument()
        })

        it('should render brand color field when updating', () => {
            renderComponent({
                loading: fromJS({ updateIntegration: false }),
                integration: fromJS({
                    id: 1,
                    name: 'Acme Chat',
                    type: GORGIAS_CHAT_INTEGRATION_TYPE,
                    decoration: {},
                    meta: {
                        language: GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT,
                    },
                }),
                isUpdate: true,
            })

            expect(screen.getByText('Brand color')).toBeInTheDocument()
        })

        it('should not render conversation color field (deprecated in revamp)', () => {
            renderComponent({
                loading: fromJS({ updateIntegration: false }),
                integration: fromJS({}),
                isUpdate: false,
            })

            expect(
                screen.queryByText('Conversation color'),
            ).not.toBeInTheDocument()
        })

        it('should render launcher position settings', () => {
            renderComponent({
                loading: fromJS({ updateIntegration: false }),
                integration: fromJS({}),
                isUpdate: false,
            })

            expect(screen.getByText('Launcher position')).toBeInTheDocument()
            expect(screen.getByText('Position')).toBeInTheDocument()
            expect(screen.getByText('Move horizontally')).toBeInTheDocument()
            expect(screen.getByText('Move vertically')).toBeInTheDocument()
        })

        it('should preselect shopify integration if there is only one available', () => {
            const shopifyStoreName = 'MY ONLY SHOPIFY STORE'

            renderComponent({
                gorgiasChatIntegrations: [] as any,
                storeIntegrations: [
                    {
                        id: 1,
                        name: shopifyStoreName,
                        type: SHOPIFY_INTEGRATION_TYPE,
                        meta: {
                            shop_name: shopifyStoreName,
                        },
                    },
                ] as any,
                loading: fromJS({ updateIntegration: false }),
                integration: fromJS({}),
                isUpdate: false,
            })

            const storeDropdownButton = screen.getByRole('button', {
                name: new RegExp(shopifyStoreName),
            })
            expect(storeDropdownButton).toBeInTheDocument()
        })

        it('should render agent avatar settings when updating', () => {
            renderComponent({
                loading: fromJS({ updateIntegration: false }),
                integration: fromJS({
                    id: 1,
                    name: 'Acme Chat',
                    type: GORGIAS_CHAT_INTEGRATION_TYPE,
                    decoration: {
                        avatar: {
                            image_type:
                                GorgiasChatAvatarImageType.AGENT_PICTURE,
                            name_type:
                                GorgiasChatAvatarNameType.AGENT_FIRST_NAME,
                        },
                    },
                    meta: {
                        language: GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT,
                    },
                }),
                isUpdate: true,
            })

            expect(
                screen.getByText('How your team appears to customers'),
            ).toBeInTheDocument()
            expect(screen.getByText('Name')).toBeInTheDocument()
            expect(
                screen.getAllByText('Profile picture').length,
            ).toBeGreaterThan(0)
        })

        it('should render logo inputs when updating', () => {
            renderComponent({
                loading: fromJS({ updateIntegration: false }),
                integration: fromJS({
                    id: 1,
                    name: 'Acme Chat',
                    type: GORGIAS_CHAT_INTEGRATION_TYPE,
                    decoration: {
                        avatar: {
                            image_type: GorgiasChatAvatarImageType.COMPANY_LOGO,
                            name_type:
                                GorgiasChatAvatarNameType.AGENT_FIRST_NAME,
                            company_logo_url:
                                'https://gorgias.io/avatar_picture.png',
                        },
                        header_picture_url:
                            'https://gorgias.io/header_picture.png',
                    },
                    meta: {
                        language: GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT,
                    },
                }),
                isUpdate: true,
            })

            expect(screen.getByText('Home page logo')).toBeInTheDocument()
            expect(screen.getByText('Avatar logo')).toBeInTheDocument()
        })
    })

    describe('form submission', () => {
        it('should call createGorgiasChatIntegration with store when store is selected', async () => {
            const interactor = userEvent.setup()
            const mockCreateGorgiasChatIntegration = jest.fn(
                (...__args: any[]) => Promise.resolve(),
            )

            renderComponent({
                actions: createActions({
                    createGorgiasChatIntegration:
                        mockCreateGorgiasChatIntegration,
                }),
                gorgiasChatIntegrations: [] as any,
                storeIntegrations: singleStore,
                loading: fromJS({ updateIntegration: false }),
                integration: fromJS({}),
                isUpdate: false,
            })

            await interactor.click(screen.getByText(/Add new chat/))

            expect(mockCreateGorgiasChatIntegration).toHaveBeenCalled()
            const callArg = mockCreateGorgiasChatIntegration.mock.calls[0]![0]!
            expect(callArg.get('name')).toBe('myStore1 Support')
            expect(callArg.getIn(['meta', 'shop_name'])).toBe('myStore1')
            expect(callArg.getIn(['meta', 'shop_type'])).toBe('shopify')
            expect(callArg.getIn(['decoration', 'main_color'])).toBe('#115cb5')
            expect(callArg.getIn(['decoration', 'conversation_color'])).toBe(
                '#115cb5',
            )
        })

        it('should call createGorgiasChatIntegration with chat title when "any other website" is selected', async () => {
            const interactor = userEvent.setup()
            const mockCreateGorgiasChatIntegration = jest.fn(
                (...__args: any[]) => Promise.resolve(),
            )

            renderComponent({
                actions: createActions({
                    createGorgiasChatIntegration:
                        mockCreateGorgiasChatIntegration,
                }),
                gorgiasChatIntegrations: [],
                storeIntegrations: singleStore,
                loading: fromJS({ updateIntegration: false }),
                integration: fromJS({}),
                isUpdate: false,
            })

            await interactor.click(screen.getByText('Any other website'))

            const chatTitleInput = screen.getByRole('textbox', {
                name: /Chat title/i,
            })
            await interactor.clear(chatTitleInput)
            await interactor.type(chatTitleInput, 'My Custom Chat')

            await interactor.click(screen.getByText(/Add new chat/))

            expect(mockCreateGorgiasChatIntegration).toHaveBeenCalled()
            const callArg = mockCreateGorgiasChatIntegration.mock.calls[0]![0]!
            expect(callArg.get('name')).toBe('My Custom Chat')
        })

        it('should call updateOrCreateIntegration when updating', async () => {
            const interactor = userEvent.setup()
            const mockUpdateOrCreateIntegration = jest.fn((...__args: any[]) =>
                Promise.resolve(),
            )

            renderComponent({
                actions: createActions({
                    updateOrCreateIntegration: mockUpdateOrCreateIntegration,
                }),
                gorgiasChatIntegrations: [
                    {
                        id: 1,
                        name: 'myChat1',
                        type: GORGIAS_CHAT_INTEGRATION_TYPE,
                        meta: {
                            shop_name: 'myStore1',
                            shop_type: SHOPIFY_INTEGRATION_TYPE,
                        },
                    },
                ] as any,
                storeIntegrations: singleStore,
                loading: fromJS({ updateIntegration: false }),
                integration: fromJS({
                    id: 1,
                    name: 'myChat1',
                    type: GORGIAS_CHAT_INTEGRATION_TYPE,
                    meta: {
                        shop_name: 'myStore1',
                        shop_type: SHOPIFY_INTEGRATION_TYPE,
                        shop_integration_id: 1,
                    },
                }),
                isUpdate: true,
            })

            await interactor.click(screen.getByRole('button', { name: /Save/ }))

            expect(mockUpdateOrCreateIntegration).toHaveBeenCalled()
            const callArg = mockUpdateOrCreateIntegration.mock.calls[0]![0]!
            expect(callArg.get('id')).toBe(1)
            expect(callArg.get('name')).toBe('myChat1')
        })

        it('should include company logo and header pictures in form submission when set', async () => {
            const interactor = userEvent.setup()
            const mockUpdateOrCreateIntegration = jest.fn((...__args: any[]) =>
                Promise.resolve(),
            )

            renderComponent({
                actions: createActions({
                    updateOrCreateIntegration: mockUpdateOrCreateIntegration,
                }),
                gorgiasChatIntegrations: [],
                storeIntegrations: singleStore,
                loading: fromJS({ updateIntegration: false }),
                integration: fromJS({
                    id: 1,
                    name: 'myChat1',
                    type: GORGIAS_CHAT_INTEGRATION_TYPE,
                    decoration: {
                        avatar: {
                            image_type: 'company-logo',
                            name_type: 'agent-first-name',
                            company_logo_url: 'https://example.com/logo.png',
                        },
                        header_picture_url: 'https://example.com/header.png',
                        header_picture_url_offline:
                            'https://example.com/header-offline.png',
                    },
                    meta: {
                        shop_name: 'myStore1',
                        shop_type: SHOPIFY_INTEGRATION_TYPE,
                        shop_integration_id: 1,
                    },
                }),
                isUpdate: true,
            })

            await interactor.click(screen.getByRole('button', { name: /Save/ }))

            expect(mockUpdateOrCreateIntegration).toHaveBeenCalled()
            const callArg = mockUpdateOrCreateIntegration.mock.calls[0]![0]!
            expect(
                callArg.getIn(['decoration', 'avatar', 'company_logo_url']),
            ).toBe('https://example.com/logo.png')
            expect(callArg.getIn(['decoration', 'header_picture_url'])).toBe(
                'https://example.com/header.png',
            )
            expect(
                callArg.getIn(['decoration', 'header_picture_url_offline']),
            ).toBe('https://example.com/header-offline.png')
        })

        it('should disable submit button when no store is selected and ecommerce is chosen', () => {
            renderComponent({
                gorgiasChatIntegrations: [],
                storeIntegrations: twoStores,
                loading: fromJS({ updateIntegration: false }),
                integration: fromJS({}),
                isUpdate: false,
            })

            const addNewChatButton = screen.getByRole('button', {
                name: /Add new chat/,
            })
            expect(addNewChatButton).toHaveAttribute('aria-disabled', 'true')
        })

        it('should disable submit button when "any other website" is selected and chat title is empty', async () => {
            const interactor = userEvent.setup()

            renderComponent({
                gorgiasChatIntegrations: [],
                storeIntegrations: twoStores,
                loading: fromJS({ updateIntegration: false }),
                integration: fromJS({}),
                isUpdate: false,
            })

            await interactor.click(screen.getByText('Any other website'))

            const addNewChatButton = screen.getByRole('button', {
                name: /Add new chat/,
            })
            expect(addNewChatButton).toHaveAttribute('aria-disabled', 'true')
        })

        it('should disable button when submitting', () => {
            renderComponent({
                loading: fromJS({ updateIntegration: 1 }),
                integration: fromJS({
                    id: 1,
                    name: 'myChat1',
                    type: GORGIAS_CHAT_INTEGRATION_TYPE,
                    meta: {
                        shop_name: 'myStore1',
                        shop_type: SHOPIFY_INTEGRATION_TYPE,
                        shop_integration_id: 1,
                    },
                }),
                isUpdate: true,
            })

            const saveButton = screen.getByRole('button', { name: /Save/ })
            expect(saveButton).toHaveAttribute('aria-disabled', 'true')
        })
    })

    describe('store picker', () => {
        it('should render store picker when creating new integration with multiple stores', () => {
            renderComponent({
                gorgiasChatIntegrations: [] as any,
                storeIntegrations: [
                    {
                        id: 1,
                        name: 'Store A',
                        type: SHOPIFY_INTEGRATION_TYPE,
                        meta: {
                            shop_name: 'Store A',
                        },
                    },
                    {
                        id: 2,
                        name: 'Store B',
                        type: SHOPIFY_INTEGRATION_TYPE,
                        meta: {
                            shop_name: 'Store B',
                        },
                    },
                ] as any,
                loading: fromJS({ updateIntegration: false }),
                integration: fromJS({}),
                isUpdate: false,
            })

            expect(
                screen.getByRole('listbox', { name: /Store selection/ }),
            ).toBeInTheDocument()
            expect(screen.getByText('Connect a store')).toBeInTheDocument()
        })
    })

    describe('color picker', () => {
        it('should use default color when invalid color is provided', async () => {
            const interactor = userEvent.setup()
            const mockUpdateOrCreateIntegration = jest.fn((...__args: any[]) =>
                Promise.resolve(),
            )

            global.CSS = {
                ...global.CSS,
                supports: (): boolean => false,
                escape: global.CSS?.escape,
            }

            renderComponent({
                actions: createActions({
                    updateOrCreateIntegration: mockUpdateOrCreateIntegration,
                }),
                loading: fromJS({ updateIntegration: false }),
                integration: fromJS({
                    id: 1,
                    name: 'myChat1',
                    type: GORGIAS_CHAT_INTEGRATION_TYPE,
                    decoration: {
                        main_color: 'invalid-color',
                    },
                    meta: {
                        language: GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT,
                    },
                }),
                isUpdate: true,
            })

            await interactor.click(screen.getByRole('button', { name: /Save/ }))

            expect(mockUpdateOrCreateIntegration).toHaveBeenCalled()
            const callArg = mockUpdateOrCreateIntegration.mock.calls[0]![0]!
            expect(callArg.getIn(['decoration', 'main_color'])).toBe('#115cb5')
        })
    })

    describe('launcher type', () => {
        it('should include launcher with ICON type in form submission by default', async () => {
            const interactor = userEvent.setup()
            const mockCreateGorgiasChatIntegration = jest.fn(
                (...__args: any[]) => Promise.resolve(),
            )

            renderComponent({
                actions: createActions({
                    createGorgiasChatIntegration:
                        mockCreateGorgiasChatIntegration,
                }),
                gorgiasChatIntegrations: [] as any,
                storeIntegrations: singleStore,
                loading: fromJS({ updateIntegration: false }),
                integration: fromJS({}),
                isUpdate: false,
            })

            await interactor.click(screen.getByText(/Add new chat/))

            expect(mockCreateGorgiasChatIntegration).toHaveBeenCalled()
            const callArg = mockCreateGorgiasChatIntegration.mock.calls[0]![0]!
            expect(callArg.getIn(['decoration', 'launcher', 'type'])).toBe(
                'icon',
            )
        })

        it('should render launcher type selector in create flow', () => {
            renderComponent({
                loading: fromJS({ updateIntegration: false }),
                integration: fromJS({}),
                isUpdate: false,
            })

            expect(screen.getByText('Launcher appearance')).toBeInTheDocument()
            const radios = screen.getAllByRole('radio')
            const radioLabels = radios.map((r) => r.getAttribute('value'))
            expect(radioLabels).toContain('icon')
            expect(radioLabels).toContain('icon-label')
        })

        it('should render launcher type selector in update flow', () => {
            renderComponent({
                loading: fromJS({ updateIntegration: false }),
                integration: fromJS({
                    id: 1,
                    name: 'Acme Chat',
                    type: GORGIAS_CHAT_INTEGRATION_TYPE,
                    decoration: {},
                    meta: {
                        language: GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT,
                    },
                }),
                isUpdate: true,
            })

            expect(screen.getByText('Launcher appearance')).toBeInTheDocument()
            expect(screen.getByText('Launcher')).toBeInTheDocument()
            const radios = screen.getAllByRole('radio')
            const radioValues = radios.map((r) => r.getAttribute('value'))
            expect(radioValues).toContain('icon')
            expect(radioValues).toContain('icon-label')
        })

        it('should not show label input when Icon is selected', () => {
            renderComponent({
                loading: fromJS({ updateIntegration: false }),
                integration: fromJS({}),
                isUpdate: false,
            })

            expect(
                screen.queryByRole('textbox', { name: /Label/ }),
            ).not.toBeInTheDocument()
        })

        it('should show label input with default value when "Icon and label" is selected', async () => {
            const interactor = userEvent.setup()

            renderComponent({
                loading: fromJS({ updateIntegration: false }),
                integration: fromJS({}),
                isUpdate: false,
            })

            const iconAndLabelRadio = screen
                .getAllByRole('radio')
                .find((r) => r.getAttribute('value') === 'icon-label')!
            await interactor.click(iconAndLabelRadio)

            const labelInput = screen.getByRole('textbox', { name: /Label/ })
            expect(labelInput).toBeInTheDocument()
            expect(labelInput).toHaveValue('Chat with us')
        })

        it('should submit ICON_AND_LABEL with custom label', async () => {
            const interactor = userEvent.setup()
            const mockCreateGorgiasChatIntegration = jest.fn(
                (...__args: any[]) => Promise.resolve(),
            )

            renderComponent({
                actions: createActions({
                    createGorgiasChatIntegration:
                        mockCreateGorgiasChatIntegration,
                }),
                gorgiasChatIntegrations: [] as any,
                storeIntegrations: singleStore,
                loading: fromJS({ updateIntegration: false }),
                integration: fromJS({}),
                isUpdate: false,
            })

            const iconAndLabelRadio = screen
                .getAllByRole('radio')
                .find((r) => r.getAttribute('value') === 'icon-label')!
            await interactor.click(iconAndLabelRadio)

            const labelInput = screen.getByRole('textbox', { name: /Label/ })
            await interactor.clear(labelInput)
            await interactor.type(labelInput, 'Help me!')

            await interactor.click(screen.getByText(/Add new chat/))

            expect(mockCreateGorgiasChatIntegration).toHaveBeenCalled()
            const callArg = mockCreateGorgiasChatIntegration.mock.calls[0]![0]!
            expect(callArg.getIn(['decoration', 'launcher', 'type'])).toBe(
                GorgiasChatLauncherType.ICON_AND_LABEL,
            )
            expect(callArg.getIn(['decoration', 'launcher', 'label'])).toBe(
                'Help me!',
            )
        })

        it('should initialize with existing ICON_AND_LABEL launcher from integration', () => {
            renderComponent({
                loading: fromJS({ updateIntegration: false }),
                integration: fromJS({
                    id: 1,
                    name: 'Acme Chat',
                    type: GORGIAS_CHAT_INTEGRATION_TYPE,
                    decoration: {
                        launcher: {
                            type: GorgiasChatLauncherType.ICON_AND_LABEL,
                            label: 'Hi there!',
                        },
                    },
                    meta: {
                        language: GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT,
                    },
                }),
                isUpdate: true,
            })

            const iconAndLabelRadio = screen
                .getAllByRole('radio')
                .find((r) => r.getAttribute('value') === 'icon-label')!
            expect(iconAndLabelRadio).toBeChecked()
            expect(screen.getByRole('textbox', { name: /Label/ })).toHaveValue(
                'Hi there!',
            )
        })

        it('should submit ICON type without label after switching back from ICON_AND_LABEL', async () => {
            const interactor = userEvent.setup()
            const mockCreateGorgiasChatIntegration = jest.fn(
                (...__args: any[]) => Promise.resolve(),
            )

            renderComponent({
                actions: createActions({
                    createGorgiasChatIntegration:
                        mockCreateGorgiasChatIntegration,
                }),
                gorgiasChatIntegrations: [] as any,
                storeIntegrations: singleStore,
                loading: fromJS({ updateIntegration: false }),
                integration: fromJS({}),
                isUpdate: false,
            })

            const findRadio = (value: string) =>
                screen
                    .getAllByRole('radio')
                    .find((r) => r.getAttribute('value') === value)!

            await interactor.click(findRadio('icon-label'))

            const labelInput = screen.getByRole('textbox', { name: /Label/ })
            await interactor.clear(labelInput)
            await interactor.type(labelInput, 'Custom text')

            await interactor.click(findRadio('icon'))

            expect(
                screen.queryByRole('textbox', { name: /Label/ }),
            ).not.toBeInTheDocument()

            await interactor.click(screen.getByText(/Add new chat/))

            expect(mockCreateGorgiasChatIntegration).toHaveBeenCalled()
            const callArg = mockCreateGorgiasChatIntegration.mock.calls[0]![0]!
            expect(callArg.getIn(['decoration', 'launcher', 'type'])).toBe(
                GorgiasChatLauncherType.ICON,
            )
            expect(
                callArg.getIn(['decoration', 'launcher', 'label']),
            ).toBeUndefined()
        })

        it('should disable submit when ICON_AND_LABEL is selected with empty label in create flow', async () => {
            const interactor = userEvent.setup()

            renderComponent({
                gorgiasChatIntegrations: [] as any,
                storeIntegrations: singleStore,
                loading: fromJS({ updateIntegration: false }),
                integration: fromJS({}),
                isUpdate: false,
            })

            const iconAndLabelRadio = screen
                .getAllByRole('radio')
                .find((r) => r.getAttribute('value') === 'icon-label')!
            await interactor.click(iconAndLabelRadio)

            const labelInput = screen.getByRole('textbox', { name: /Label/ })
            await interactor.clear(labelInput)

            expect(
                screen.getByRole('button', { name: /Add new chat/ }),
            ).toHaveAttribute('aria-disabled', 'true')
        })

        it('should disable submit when ICON_AND_LABEL is selected with empty label in update flow', async () => {
            const interactor = userEvent.setup()

            renderComponent({
                loading: fromJS({ updateIntegration: false }),
                integration: fromJS({
                    id: 1,
                    name: 'Acme Chat',
                    type: GORGIAS_CHAT_INTEGRATION_TYPE,
                    decoration: {},
                    meta: {
                        language: GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT,
                    },
                }),
                isUpdate: true,
            })

            const iconAndLabelRadio = screen
                .getAllByRole('radio')
                .find((r) => r.getAttribute('value') === 'icon-label')!
            await interactor.click(iconAndLabelRadio)

            const labelInput = screen.getByRole('textbox', { name: /Label/ })
            await interactor.clear(labelInput)

            expect(
                screen.getByRole('button', { name: /Save/ }),
            ).toHaveAttribute('aria-disabled', 'true')
        })

        it('should fall back to ICON type when integration has unrecognized launcher type', async () => {
            const interactor = userEvent.setup()
            const mockUpdateOrCreateIntegration = jest.fn((...__args: any[]) =>
                Promise.resolve(),
            )

            renderComponent({
                actions: createActions({
                    updateOrCreateIntegration: mockUpdateOrCreateIntegration,
                }),
                loading: fromJS({ updateIntegration: false }),
                integration: fromJS({
                    id: 1,
                    name: 'Acme Chat',
                    type: GORGIAS_CHAT_INTEGRATION_TYPE,
                    decoration: {
                        launcher: {
                            type: 'unknown-future-type',
                        },
                    },
                    meta: {
                        language: GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT,
                    },
                }),
                isUpdate: true,
            })

            expect(
                screen.queryByRole('textbox', { name: /Label/ }),
            ).not.toBeInTheDocument()

            await interactor.click(screen.getByRole('button', { name: /Save/ }))

            expect(mockUpdateOrCreateIntegration).toHaveBeenCalled()
            const callArg = mockUpdateOrCreateIntegration.mock.calls[0]![0]!
            expect(callArg.getIn(['decoration', 'launcher', 'type'])).toBe(
                GorgiasChatLauncherType.ICON,
            )
        })

        it('should default label when integration has ICON_AND_LABEL without label', () => {
            renderComponent({
                loading: fromJS({ updateIntegration: false }),
                integration: fromJS({
                    id: 1,
                    name: 'Acme Chat',
                    type: GORGIAS_CHAT_INTEGRATION_TYPE,
                    decoration: {
                        launcher: {
                            type: GorgiasChatLauncherType.ICON_AND_LABEL,
                        },
                    },
                    meta: {
                        language: GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT,
                    },
                }),
                isUpdate: true,
            })

            const iconAndLabelRadio = screen
                .getAllByRole('radio')
                .find((r) => r.getAttribute('value') === 'icon-label')!
            expect(iconAndLabelRadio).toBeChecked()
            expect(screen.getByRole('textbox', { name: /Label/ })).toHaveValue(
                'Chat with us',
            )
        })

        it('should submit ICON_AND_LABEL with label in update flow', async () => {
            const interactor = userEvent.setup()
            const mockUpdateOrCreateIntegration = jest.fn((...__args: any[]) =>
                Promise.resolve(),
            )

            renderComponent({
                actions: createActions({
                    updateOrCreateIntegration: mockUpdateOrCreateIntegration,
                }),
                loading: fromJS({ updateIntegration: false }),
                integration: fromJS({
                    id: 1,
                    name: 'Acme Chat',
                    type: GORGIAS_CHAT_INTEGRATION_TYPE,
                    decoration: {},
                    meta: {
                        language: GORGIAS_CHAT_WIDGET_LANGUAGE_DEFAULT,
                    },
                }),
                isUpdate: true,
            })

            const iconAndLabelRadio = screen
                .getAllByRole('radio')
                .find((r) => r.getAttribute('value') === 'icon-label')!
            await interactor.click(iconAndLabelRadio)

            const labelInput = screen.getByRole('textbox', { name: /Label/ })
            await interactor.clear(labelInput)
            await interactor.type(labelInput, 'Need help?')

            await interactor.click(screen.getByRole('button', { name: /Save/ }))

            expect(mockUpdateOrCreateIntegration).toHaveBeenCalled()
            const callArg = mockUpdateOrCreateIntegration.mock.calls[0]![0]!
            expect(callArg.getIn(['decoration', 'launcher', 'type'])).toBe(
                GorgiasChatLauncherType.ICON_AND_LABEL,
            )
            expect(callArg.getIn(['decoration', 'launcher', 'label'])).toBe(
                'Need help?',
            )
        })
    })

    describe('platform type selection', () => {
        it('should switch to ecommerce platform when clicking the radio button', async () => {
            const interactor = userEvent.setup()

            renderComponent({
                gorgiasChatIntegrations: [] as any,
                storeIntegrations: singleStore,
                loading: fromJS({ updateIntegration: false }),
                integration: fromJS({}),
                isUpdate: false,
            })

            await interactor.click(screen.getByText('Any other website'))

            expect(
                screen.getByRole('textbox', { name: /Chat title/i }),
            ).toBeInTheDocument()

            await interactor.click(screen.getByText('Ecommerce platforms'))

            expect(
                screen.queryByRole('textbox', { name: /Chat title/i }),
            ).not.toBeInTheDocument()
        })
    })
})
