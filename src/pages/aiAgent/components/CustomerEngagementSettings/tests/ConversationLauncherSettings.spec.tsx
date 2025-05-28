import { ReactNode } from 'react'

import { fireEvent, render, screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { ldClientMock } from 'jest-launchdarkly-mock'
import { FormProvider, useForm } from 'react-hook-form'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import configureStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { integrationsState } from 'fixtures/integrations'
import { getStoreConfigurationFixture } from 'pages/aiAgent/fixtures/storeConfiguration.fixtures'
import { getLDClient } from 'utils/launchDarkly'

import {
    ConversationLauncherAdvancedSettings,
    ConversationLauncherSettings,
} from '../ConversationLauncherSettings'

jest.mock(
    'pages/aiAgent/components/CustomerEngagementSettings/hooks/usePotentialImpact',
    () => {
        return {
            usePotentialImpact: jest.fn(
                () => 'Unlock up to ~5% additional GMV',
            ),
        }
    },
)

const mockStoreConfigurationWithOneChat = getStoreConfigurationFixture({
    monitoredChatIntegrations: [1234],
})

const mockStoreConfigurationWithMultipleChats = getStoreConfigurationFixture({
    monitoredChatIntegrations: [1234, 4567, 7890],
})

const mockTranslations = {
    texts: {},
    sspTexts: {},
    meta: {},
}

const mockStore = configureStore([thunk])
const store = mockStore({ integrations: fromJS(integrationsState) })

type FormValues = {
    isFloatingInputEnabled?: boolean
    isFloatingInputDesktopOnly?: boolean
    needHelpText?: string
}

const Wrapper = ({
    children,
    defaultValues = {
        isFloatingInputEnabled: false,
        isFloatingInputDesktopOnly: false,
        needHelpText: '',
    },
}: {
    children: ReactNode
    defaultValues?: FormValues
}) => {
    const methods = useForm<FormValues>({ defaultValues })

    return (
        <Provider store={store}>
            <MemoryRouter>
                <FormProvider {...methods}>{children}</FormProvider>
            </MemoryRouter>
        </Provider>
    )
}

describe('ConversationLauncherSettings', () => {
    const getCardTitle = () => {
        return screen.getAllByText('Ask anything input')[0]
    }

    beforeEach(() => {
        ldClientMock.allFlags.mockReturnValue({})
        let client = getLDClient()
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        client = ldClientMock
    })

    it('renders the main Ask anything input title', () => {
        render(
            <Wrapper>
                <ConversationLauncherSettings
                    isGmvLoading={false}
                    gmv={[]}
                    primaryLanguage="en-US"
                    translations={mockTranslations}
                />
            </Wrapper>,
        )

        expect(getCardTitle()).toBeInTheDocument()
        expect(
            screen.getByText('Unlock up to ~5% additional GMV'),
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                'Drive more sales by adding an always-on input field that encourages shoppers to start a conversation.',
            ),
        ).toBeInTheDocument()
        expect(
            screen.getByAltText(
                'image showing an example of the Ask anything input',
            ),
        ).toBeInTheDocument()
        expect(screen.getByText('Advanced settings')).toBeInTheDocument()
    })

    it('does not allow opening Advanced settings when toggle is off', () => {
        const { container } = render(
            <Wrapper>
                <ConversationLauncherSettings
                    isGmvLoading={false}
                    gmv={[]}
                    primaryLanguage="en-US"
                    translations={mockTranslations}
                />
            </Wrapper>,
        )

        fireEvent.click(screen.getByText('Advanced settings'))

        const drawer = container.querySelector('[class="drawer"]')
        expect(drawer).not.toHaveClass('opened')
        expect(drawer).not.toBeVisible()
    })

    it('opens Advanced settings when toggle is on', () => {
        render(
            <Wrapper defaultValues={{ isFloatingInputEnabled: true }}>
                <ConversationLauncherSettings
                    isGmvLoading={false}
                    gmv={[]}
                    primaryLanguage="en-US"
                    translations={mockTranslations}
                />
            </Wrapper>,
        )

        fireEvent.click(screen.getByText('Advanced settings'))

        expect(screen.getByText('Enable on Desktop only')).toBeVisible()
    })
})

describe('ConversationLauncherAdvancedSettings', () => {
    const mockOnClose = jest.fn()

    it('renders with slide out animation class when isOpen is false', () => {
        const { container } = render(
            <Wrapper>
                <ConversationLauncherAdvancedSettings
                    isOpen={false}
                    onClose={mockOnClose}
                    primaryLanguage="en-US"
                    translations={mockTranslations}
                />
            </Wrapper>,
        )

        const drawer = container.querySelector('[class="drawer"]')
        expect(drawer).not.toHaveClass('opened')
        expect(drawer).not.toBeVisible()
    })

    it('renders toggle and buttons when open', () => {
        render(
            <Wrapper defaultValues={{ isFloatingInputDesktopOnly: false }}>
                <ConversationLauncherAdvancedSettings
                    isOpen
                    onClose={mockOnClose}
                    primaryLanguage="en-US"
                    translations={mockTranslations}
                />
            </Wrapper>,
        )

        expect(screen.getByText('Enable on Desktop only')).toBeInTheDocument()
        expect(screen.getByRole('switch')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Update' })).toHaveAttribute(
            'aria-disabled',
            'true',
        )
        expect(
            screen.getByRole('button', { name: 'Cancel' }),
        ).not.toBeDisabled()
    })

    it('should not render placeholder customization when store has more than one associated chat', () => {
        render(
            <Wrapper defaultValues={{ isFloatingInputDesktopOnly: false }}>
                <ConversationLauncherAdvancedSettings
                    isOpen
                    onClose={mockOnClose}
                    storeConfiguration={mockStoreConfigurationWithMultipleChats}
                    primaryLanguage="en-US"
                    translations={mockTranslations}
                />
            </Wrapper>,
        )

        expect(screen.queryByText('Need more help?')).not.toBeInTheDocument()
        expect(
            screen.queryByTestId('need-help-placeholder-input'),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByRole('button', { name: 'Update' }),
        ).toHaveAttribute('aria-disabled', 'true')
        expect(
            screen.getByRole('button', { name: 'Cancel' }),
        ).not.toBeDisabled()
    })

    it('should render placeholder customization when store has only one associated chat', () => {
        render(
            <Wrapper defaultValues={{ isFloatingInputDesktopOnly: false }}>
                <ConversationLauncherAdvancedSettings
                    isOpen
                    onClose={mockOnClose}
                    storeConfiguration={mockStoreConfigurationWithOneChat}
                    primaryLanguage="en-US"
                    translations={mockTranslations}
                />
            </Wrapper>,
        )

        expect(screen.getByText('Customize placeholder')).toBeInTheDocument()
        expect(
            screen.getByPlaceholderText('Enter custom value'),
        ).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Update' })).toHaveAttribute(
            'aria-disabled',
            'true',
        )
        expect(
            screen.getByRole('button', { name: 'Cancel' }),
        ).not.toBeDisabled()
    })

    it('enables Update button when local toggle changes', () => {
        render(
            <Wrapper defaultValues={{ isFloatingInputDesktopOnly: false }}>
                <ConversationLauncherAdvancedSettings
                    isOpen
                    onClose={mockOnClose}
                    primaryLanguage="en-US"
                    translations={mockTranslations}
                />
            </Wrapper>,
        )

        const toggle = screen.getByRole('switch')
        fireEvent.click(toggle)

        expect(
            screen.getByRole('button', { name: 'Update' }),
        ).not.toBeDisabled()
    })

    it('enables Update button when placeholder is different than initial value', async () => {
        render(
            <Wrapper defaultValues={{ isFloatingInputDesktopOnly: false }}>
                <ConversationLauncherAdvancedSettings
                    isOpen
                    onClose={mockOnClose}
                    storeConfiguration={mockStoreConfigurationWithOneChat}
                    primaryLanguage="en-US"
                    translations={mockTranslations}
                />
            </Wrapper>,
        )

        const placeholderInput =
            screen.getByPlaceholderText('Enter custom value')
        fireEvent.change(placeholderInput, {
            target: { value: 'New placeholder' },
        })
        fireEvent.blur(placeholderInput)

        expect(
            screen.getByRole('button', { name: 'Update' }),
        ).not.toBeDisabled()
    })

    it('calls onClose and setValue on update', () => {
        render(
            <Wrapper defaultValues={{ isFloatingInputDesktopOnly: false }}>
                <ConversationLauncherAdvancedSettings
                    isOpen
                    onClose={mockOnClose}
                    primaryLanguage="en-US"
                    translations={mockTranslations}
                />
            </Wrapper>,
        )

        fireEvent.click(screen.getByRole('switch'))
        fireEvent.click(screen.getByRole('button', { name: 'Update' }))

        expect(mockOnClose).toHaveBeenCalled()
    })
})
