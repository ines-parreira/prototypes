import type { TranslationLanguageOption } from '@repo/utils'
import { act, cleanup, screen, waitFor } from '@testing-library/react'

import { mockTicketMessage } from '@gorgias/helpdesk-mocks'
import { Language, TicketMessageSourceType } from '@gorgias/helpdesk-types'

import { render as renderPrimitive } from '../../../tests/render.utils'
import { useRetranslateTicket } from '../../hooks/useRetranslateTicket'
import { useTicketTranslationLanguageOptions } from '../../hooks/useTicketTranslationLanguageOptions'
import { TranslateTicketModal } from '../TranslateTicketModal'

vi.mock('../../hooks/useRetranslateTicket')
vi.mock('../../hooks/useTicketTranslationLanguageOptions')
const mockUseRetranslateTicket = vi.mocked(useRetranslateTicket)
const mockUseTicketTranslationLanguageOptions = vi.mocked(
    useTicketTranslationLanguageOptions,
)
const retranslateTicket = vi.fn()
const frenchOption = {
    code: Language.Fr,
    name: 'French',
} as TranslationLanguageOption
const germanOption = {
    code: Language.De,
    name: 'German',
} as TranslationLanguageOption

const render = (onOpenChange = vi.fn()) =>
    renderPrimitive(
        <TranslateTicketModal
            isOpen={true}
            isLoading={false}
            onOpenChange={onOpenChange}
            ticketId={123}
            ticketLanguage={Language.Fr}
            ticketMessages={[
                mockTicketMessage({
                    id: 101,
                    source: {
                        type: TicketMessageSourceType.Email,
                    },
                } as never),
                mockTicketMessage({
                    id: 202,
                    source: {
                        type: TicketMessageSourceType.InternalNote,
                    },
                } as never),
            ]}
        />,
    )

beforeEach(() => {
    retranslateTicket.mockReset()
    mockUseRetranslateTicket.mockReturnValue({
        retranslateTicket,
        isRetranslatingTicket: false,
        primary: Language.En,
    })
    mockUseTicketTranslationLanguageOptions.mockReturnValue({
        detectedLanguage: frenchOption,
        filteredLanguages: [frenchOption, germanOption],
        resetSearch: vi.fn(),
        searchTerm: '',
        sections: [
            {
                id: 'detected-language',
                name: 'Detected language',
                items: [frenchOption],
            },
            {
                id: 'all-languages',
                name: 'All languages (A->Z)',
                items: [frenchOption, germanOption],
            },
        ],
        setSearchTerm: vi.fn(),
    })
})

afterEach(async () => {
    cleanup()
    vi.clearAllMocks()
})

const clickElement = async (
    user: ReturnType<typeof render>['user'],
    element: HTMLElement,
) => {
    await act(async () => {
        await user.click(element)
    })
}

describe('TranslateTicketModal', () => {
    it('renders the translate ticket copy and language sections', async () => {
        const { user } = render()

        expect(
            screen.getByRole('heading', { name: /translate ticket/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                /please select the source language of the ticket/i,
            ),
        ).toBeInTheDocument()

        await clickElement(
            user,
            screen.getByRole('textbox', { name: /translate from/i }),
        )

        expect(screen.getByText('Detected language')).toBeInTheDocument()
        expect(screen.getAllByText('French').length).toBeGreaterThan(0)
        expect(screen.getByText('All languages (A->Z)')).toBeInTheDocument()
    })

    it('updates the ticket language and closes the modal', async () => {
        const onOpenChange = vi.fn()

        const { user } = render(onOpenChange)

        await clickElement(
            user,
            screen.getByRole('textbox', { name: /translate from/i }),
        )
        await clickElement(
            user,
            screen.getAllByRole('option', { name: 'German' })[0]!,
        )

        await waitFor(() => {
            expect(
                screen.getByRole('button', { name: /^translate$/i }),
            ).toBeEnabled()
        })

        await clickElement(
            user,
            screen.getByRole('button', { name: /^translate$/i }),
        )

        await waitFor(() => {
            expect(retranslateTicket).toHaveBeenCalledWith(Language.De)
        })

        await waitFor(() => {
            expect(onOpenChange).toHaveBeenCalledWith(false)
        })
    })
})
