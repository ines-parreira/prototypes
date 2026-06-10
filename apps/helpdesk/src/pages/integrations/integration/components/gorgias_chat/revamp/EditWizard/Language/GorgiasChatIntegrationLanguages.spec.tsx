import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { fromJS } from 'immutable'

import { LANGUAGE } from 'constants/languages'

import { GorgiasChatIntegrationLanguagesRevamp } from './GorgiasChatIntegrationLanguages'

const mockAddLanguage = jest.fn()
const mockUpdateDefaultLanguage = jest.fn().mockResolvedValue(undefined)
const mockDeleteLanguage = jest.fn()
const mockLanguagesCard = jest.fn()

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/common/GorgiasChatRevampLayout',
    () => ({
        GorgiasChatRevampLayout: ({
            children,
        }: {
            children: React.ReactNode
        }) => <>{children}</>,
    }),
)

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/EditWizard/Language/useLanguagesTable',
    () => ({
        useLanguagesTable: jest.fn(() => ({
            languagesAvailable: [{ value: LANGUAGE.DE, label: 'German' }],
            languagesRows: [
                {
                    language: LANGUAGE.EN_US,
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
    'pages/integrations/integration/components/gorgias_chat/revamp/EditWizard/Language/components/LanguagesCard/LanguagesCard',
    () => ({
        LanguagesCard: (props: any) => {
            mockLanguagesCard(props)
            return null
        },
    }),
)

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
                    expect.objectContaining({ language: LANGUAGE.EN_US }),
                ]),
            }),
        )
    })

    it('should call addLanguage when a language option is selected', async () => {
        const user = userEvent.setup()
        render(
            <GorgiasChatIntegrationLanguagesRevamp
                integration={fromJS({ id: 1 })}
                loading={mockLoading}
            />,
        )

        await user.click(screen.getByRole('button', { name: /add language/i }))
        await user.click(await screen.findByRole('option', { name: 'German' }))

        expect(mockAddLanguage).toHaveBeenCalledWith({
            language: LANGUAGE.DE,
        })
    })

    it('should render the available language options in the Select', async () => {
        const user = userEvent.setup()
        render(
            <GorgiasChatIntegrationLanguagesRevamp
                integration={fromJS({ id: 1 })}
                loading={mockLoading}
            />,
        )

        await user.click(screen.getByRole('button', { name: /add language/i }))

        expect(
            await screen.findByRole('option', { name: 'German' }),
        ).toBeInTheDocument()
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
            const language = { language: LANGUAGE.FR }

            await onClickSetDefault(language)

            expect(mockUpdateDefaultLanguage).toHaveBeenCalledWith(language)
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
        const language = { language: LANGUAGE.EN_US }
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
