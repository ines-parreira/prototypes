import { render } from '@testing-library/react'
import { fromJS } from 'immutable'

import { Language } from 'constants/languages'

import { GorgiasChatIntegrationLanguagesRevamp } from '../GorgiasChatIntegrationLanguages'

const mockAddLanguage = jest.fn()
const mockUpdateDefaultLanguage = jest.fn().mockResolvedValue(undefined)
const mockDeleteLanguage = jest.fn()
const mockLanguagesCard = jest.fn()
const mockSelect = jest.fn()
const mockUpdateLanguage = jest.fn().mockResolvedValue(undefined)

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/GorgiasChatRevampLayout',
    () => ({
        GorgiasChatRevampLayout: ({
            children,
        }: {
            children: React.ReactNode
        }) => <>{children}</>,
    }),
)

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/components/GorgiasChatIntegrationLanguages/useLanguagesTable',
    () => ({
        useLanguagesTable: jest.fn(() => ({
            languagesAvailable: [{ value: Language.German, label: 'German' }],
            languagesRows: [
                {
                    language: Language.EnglishUs,
                    label: 'English (US)',
                    link: '/app/settings/channels/gorgias-chat/1/languages/en-US',
                    primary: true,
                    showActions: false,
                },
            ],
            addLanguage: mockAddLanguage,
            updateDefaultLanguage: mockUpdateDefaultLanguage,
            deleteLanguage: mockDeleteLanguage,
            isUpdatePending: false,
        })),
    }),
)

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/components/GorgiasChatIntegrationLanguages/LanguagesCard/LanguagesCard',
    () => ({
        LanguagesCard: (props: any) => {
            mockLanguagesCard(props)
            return null
        },
    }),
)

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/components/ChatPreviewPanel/hooks/useChatPreviewPanel',
    () => ({
        useGorgiasChatCreationWizardContext: jest.fn(() => ({
            updateLanguage: mockUpdateLanguage,
        })),
    }),
)

jest.mock('@gorgias/axiom', () => ({
    Button: ({ children, ...rest }: { children?: React.ReactNode }) => (
        <button {...rest}>{children}</button>
    ),
    ButtonIntent: { Regular: 'regular' },
    ButtonSize: { Md: 'md' },
    ButtonVariant: { Primary: 'primary' },
    ListItem: ({ id, label }: { id: string; label: string }) => (
        <li id={id}>{label}</li>
    ),
    Select: (props: any) => {
        mockSelect(props)
        return null
    },
}))

const mockLoading = fromJS({ integration: false })

describe('GorgiasChatIntegrationLanguagesRevamp', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should pass languagesRows to LanguagesCard', () => {
        render(
            <GorgiasChatIntegrationLanguagesRevamp
                integration={fromJS({ id: 1 })}
                loading={mockLoading}
            />,
        )

        expect(mockLanguagesCard).toHaveBeenCalledWith(
            expect.objectContaining({
                languagesRows: expect.arrayContaining([
                    expect.objectContaining({ language: Language.EnglishUs }),
                ]),
            }),
        )
    })

    it('should call addLanguage when a language option is selected', async () => {
        render(
            <GorgiasChatIntegrationLanguagesRevamp
                integration={fromJS({ id: 1 })}
                loading={mockLoading}
            />,
        )

        const { onSelect } = mockSelect.mock.calls[0][0]
        await onSelect({ value: Language.French, label: 'French' })

        expect(mockAddLanguage).toHaveBeenCalledWith({
            language: Language.French,
        })
    })

    it('should pass languagesAvailable items to Select', () => {
        render(
            <GorgiasChatIntegrationLanguagesRevamp
                integration={fromJS({ id: 1 })}
                loading={mockLoading}
            />,
        )

        expect(mockSelect).toHaveBeenCalledWith(
            expect.objectContaining({
                items: [{ value: Language.German, label: 'German' }],
            }),
        )
    })

    describe('handleUpdateDefaultLanguage', () => {
        const renderAndGetOnClickSetDefault = () => {
            render(
                <GorgiasChatIntegrationLanguagesRevamp
                    integration={fromJS({ id: 1 })}
                    loading={mockLoading}
                />,
            )
            return mockLanguagesCard.mock.calls[0][0].onClickSetDefault
        }

        it('calls updateDefaultLanguage with the full language item', async () => {
            const onClickSetDefault = renderAndGetOnClickSetDefault()
            const language = { language: Language.French }

            await onClickSetDefault(language)

            expect(mockUpdateDefaultLanguage).toHaveBeenCalledWith(language)
        })

        it('calls updateLanguage with the language code', async () => {
            const onClickSetDefault = renderAndGetOnClickSetDefault()

            await onClickSetDefault({ language: Language.French })

            expect(mockUpdateLanguage).toHaveBeenCalledWith(Language.French)
        })

        it('does not call updateLanguage when updateDefaultLanguage rejects', async () => {
            mockUpdateDefaultLanguage.mockRejectedValueOnce(
                new Error('update failed'),
            )
            const onClickSetDefault = renderAndGetOnClickSetDefault()

            await expect(
                onClickSetDefault({ language: Language.French }),
            ).rejects.toThrow('update failed')

            expect(mockUpdateLanguage).not.toHaveBeenCalled()
        })
    })

    it('should call deleteLanguage when onClickDelete is invoked on LanguagesCard', async () => {
        render(
            <GorgiasChatIntegrationLanguagesRevamp
                integration={fromJS({ id: 1 })}
                loading={mockLoading}
            />,
        )

        const { onClickDelete } = mockLanguagesCard.mock.calls[0][0]
        const language = { language: Language.EnglishUs }
        await onClickDelete(language)

        expect(mockDeleteLanguage).toHaveBeenCalledWith(language)
    })

    describe('isOneClickInstallation', () => {
        it('should pass true to LanguagesCard when shop is in shopify_integration_ids', () => {
            const integration = fromJS({
                id: 1,
                meta: {
                    shop_integration_id: 42,
                    shopify_integration_ids: [42],
                },
            })

            render(
                <GorgiasChatIntegrationLanguagesRevamp
                    integration={integration}
                    loading={mockLoading}
                />,
            )

            expect(mockLanguagesCard).toHaveBeenCalledWith(
                expect.objectContaining({
                    isOneClickInstallation: true,
                }),
            )
        })

        it('should pass false to LanguagesCard when shop is not in shopify_integration_ids', () => {
            const integration = fromJS({
                id: 1,
                meta: {
                    shop_integration_id: 42,
                    shopify_integration_ids: [99],
                },
            })

            render(
                <GorgiasChatIntegrationLanguagesRevamp
                    integration={integration}
                    loading={mockLoading}
                />,
            )

            expect(mockLanguagesCard).toHaveBeenCalledWith(
                expect.objectContaining({
                    isOneClickInstallation: false,
                }),
            )
        })

        it('should pass undefined to LanguagesCard when shop_integration_id is absent', () => {
            render(
                <GorgiasChatIntegrationLanguagesRevamp
                    integration={fromJS({ id: 1 })}
                    loading={mockLoading}
                />,
            )

            expect(mockLanguagesCard).toHaveBeenCalledWith(
                expect.objectContaining({
                    isOneClickInstallation: undefined,
                }),
            )
        })
    })
})
