import { render } from '@repo/testing'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { useRcsTestSend } from 'AIJourney/queries/useRcsTestSend/useRcsTestSend'

import { BOUNDARY_TESTS } from './boundaryTests.fixture'
import { RcsBoundaryTests } from './RcsBoundaryTests'

jest.mock('AIJourney/queries/useRcsTestSend/useRcsTestSend', () => ({
    useRcsTestSend: jest.fn(),
}))

const mutateAsync = jest.fn()

const firstApiCase = BOUNDARY_TESTS.find(
    (t) => t.batch === 'api' && t.expected.kind === 'twilio_ok',
)!
const firstTwilioErrorCase = BOUNDARY_TESTS.find(
    (t) => t.batch === 'api' && t.expected.kind === 'twilio_error',
)!
const firstVisualCase = BOUNDARY_TESTS.find((t) => t.batch === 'visual')!

const apiCaseCount = BOUNDARY_TESTS.filter((t) => t.batch === 'api').length

const okResponse = (
    overrides: Partial<{
        template_name: string | null
        twilio_message_sid: string | null
    }> = {},
) => ({
    content_sid: 'HXabc',
    template_name: 'journey_carousel_2_cards_1_button',
    variables: {},
    message_classification: 'rich_content' as const,
    resolution_path: 'exact' as const,
    twilio_message_sid: 'MMxyz',
    warnings: [],
    templates_in_pool: 4,
    ...overrides,
})

const renderHarness = () =>
    render(
        <RcsBoundaryTests integrationId={42} recipientPhone="+15551234567" />,
    )

beforeEach(() => {
    jest.clearAllMocks()
    jest.mocked(useRcsTestSend).mockReturnValue({
        mutateAsync,
    } as unknown as ReturnType<typeof useRcsTestSend>)
})

describe('<RcsBoundaryTests />', () => {
    it('renders the cost warning and all defined test cases', () => {
        renderHarness()

        expect(
            screen.getByText(/Each case sends a real Twilio message/),
        ).toBeInTheDocument()

        for (const test of BOUNDARY_TESTS) {
            expect(
                screen.getByText(new RegExp(`${test.id}:`)),
            ).toBeInTheDocument()
        }
    })

    it('shows a select-account warning when integration or phone is missing', () => {
        render(<RcsBoundaryTests integrationId={undefined} recipientPhone="" />)

        expect(
            screen.getByText(/Please select account & sub-account/),
        ).toBeInTheDocument()
    })

    it('hides the select-account warning once integration and phone are set', () => {
        renderHarness()

        expect(
            screen.queryByText(/Please select account & sub-account/),
        ).not.toBeInTheDocument()
    })

    it('disables run buttons when integration or phone is missing', () => {
        render(<RcsBoundaryTests integrationId={undefined} recipientPhone="" />)

        const runButtons = screen.getAllByRole('button', {
            name: /Run case|Send case/,
        })
        for (const button of runButtons) {
            expect(button).toBeDisabled()
        }
    })

    it('calls mutateAsync with the case payload when a case is run', async () => {
        mutateAsync.mockResolvedValueOnce(okResponse())

        const user = userEvent.setup()
        renderHarness()

        const firstCaseRunButton = screen.getAllByRole('button', {
            name: /^Run case$/,
        })[0]
        await user.click(firstCaseRunButton)

        expect(mutateAsync).toHaveBeenCalledWith(
            expect.objectContaining({
                integration_id: 42,
                recipient_phone: '+15551234567',
                dry_run: false,
                rcs_context: firstApiCase.rcs_context,
            }),
        )
    })

    it('renders template name, SID, and Twilio Console link after a successful API run', async () => {
        mutateAsync.mockResolvedValueOnce(
            okResponse({
                template_name: 'journey_carousel_2_cards_1_button',
                twilio_message_sid: 'MMxyz',
            }),
        )

        const user = userEvent.setup()
        renderHarness()

        await user.click(
            screen.getAllByRole('button', { name: /^Run case$/ })[0],
        )

        expect(
            await screen.findByText(
                /Template: journey_carousel_2_cards_1_button.*SID: MMxyz/,
            ),
        ).toBeInTheDocument()
        const consoleLink = screen.getByRole('link', {
            name: /Check delivery status in Twilio Console/,
        })
        expect(consoleLink).toHaveAttribute(
            'href',
            'https://console.twilio.com/us1/develop/sms/logs/MMxyz',
        )
        expect(
            screen.getAllByText(
                /API queued — verify delivery in Twilio Console/,
            )[0],
        ).toBeInTheDocument()
    })

    it('omits the Twilio Console link when the response has no SID', async () => {
        mutateAsync.mockResolvedValueOnce(
            okResponse({
                template_name: null,
                twilio_message_sid: null,
            }),
        )

        const user = userEvent.setup()
        renderHarness()

        await user.click(
            screen.getAllByRole('button', { name: /^Run case$/ })[0],
        )

        expect(
            await screen.findByText(/Template: — · SID: —/),
        ).toBeInTheDocument()
        expect(
            screen.queryByRole('link', {
                name: /Check delivery status in Twilio Console/,
            }),
        ).not.toBeInTheDocument()
    })

    it('extracts a top-level Twilio error code from a failed API run', async () => {
        mutateAsync.mockRejectedValueOnce({
            message: 'boom',
            response: { data: { code: 21658 } },
        })

        const user = userEvent.setup()
        renderHarness()

        await user.click(
            screen.getAllByRole('button', { name: /^Run case$/ })[0],
        )

        expect(
            await screen.findByText(/Error: Unknown error \(code: 21658\)/),
        ).toBeInTheDocument()
    })

    it('extracts a nested response.data.error.code from a failed API run', async () => {
        mutateAsync.mockRejectedValueOnce(
            Object.assign(new Error('nested boom'), {
                response: { data: { error: { code: 21610 } } },
            }),
        )

        const user = userEvent.setup()
        renderHarness()

        await user.click(
            screen.getAllByRole('button', { name: /^Run case$/ })[0],
        )

        expect(
            await screen.findByText(/Error: nested boom \(code: 21610\)/),
        ).toBeInTheDocument()
    })

    it('falls back to code: unknown when no Twilio code is present', async () => {
        mutateAsync.mockRejectedValueOnce(new Error('plain error'))

        const user = userEvent.setup()
        renderHarness()

        await user.click(
            screen.getAllByRole('button', { name: /^Run case$/ })[0],
        )

        expect(
            await screen.findByText(/Error: plain error \(code: unknown\)/),
        ).toBeInTheDocument()
    })

    it('produces an "expected fail" verdict when a twilio_error case is queued', async () => {
        if (firstTwilioErrorCase.expected.kind !== 'twilio_error') {
            throw new Error('fixture mismatch')
        }
        const expectedCode = firstTwilioErrorCase.expected.code
        mutateAsync.mockResolvedValueOnce(okResponse())

        const user = userEvent.setup()
        renderHarness()

        const targetCase = within(
            screen.getByText(new RegExp(`${firstTwilioErrorCase.id}:`))
                .parentElement!.parentElement!,
        )
        await user.click(targetCase.getByRole('button', { name: /^Run case$/ }))

        expect(
            await screen.findByText(
                new RegExp(
                    `API queued — should fail at carrier with ${expectedCode}`,
                ),
            ),
        ).toBeInTheDocument()
    })

    it('produces a "backend rejected synchronously" verdict when a twilio_error case errors', async () => {
        if (firstTwilioErrorCase.expected.kind !== 'twilio_error') {
            throw new Error('fixture mismatch')
        }
        const expectedCode = firstTwilioErrorCase.expected.code
        mutateAsync.mockRejectedValueOnce(new Error('backend reject'))

        const user = userEvent.setup()
        renderHarness()

        const targetCase = within(
            screen.getByText(new RegExp(`${firstTwilioErrorCase.id}:`))
                .parentElement!.parentElement!,
        )
        await user.click(targetCase.getByRole('button', { name: /^Run case$/ }))

        expect(
            await screen.findByText(
                new RegExp(
                    `Backend rejected synchronously — verify error matches expected ${expectedCode}`,
                ),
            ),
        ).toBeInTheDocument()
    })

    it('renders the observe checklist for a render_check visual case', () => {
        if (firstVisualCase.expected.kind !== 'render_check') {
            throw new Error('fixture mismatch')
        }
        renderHarness()

        const joined = firstVisualCase.expected.observe.join('; ')
        expect(
            screen.getByText((content) =>
                content.includes(`Observe: ${joined}`),
            ),
        ).toBeInTheDocument()
    })

    it('shows the render_check verdict after a visual case sends OK', async () => {
        mutateAsync.mockResolvedValueOnce(okResponse())

        const user = userEvent.setup()
        renderHarness()

        await user.click(
            screen.getAllByRole('button', { name: /^Send case$/ })[0],
        )

        expect(
            await screen.findByText(/API queued — check device for rendering/),
        ).toBeInTheDocument()
    })

    it('shows the rejection verdict when a visual case errors synchronously', async () => {
        mutateAsync.mockRejectedValueOnce(new Error('visual failed'))

        const user = userEvent.setup()
        renderHarness()

        await user.click(
            screen.getAllByRole('button', { name: /^Send case$/ })[0],
        )

        expect(
            await screen.findByText(/send rejected by our backend/),
        ).toBeInTheDocument()
        expect(
            await screen.findByText(/Send failed: visual failed/),
        ).toBeInTheDocument()
    })

    it('records an observation when the user types in the textarea', async () => {
        const user = userEvent.setup()
        renderHarness()

        const textarea = screen.getByLabelText(
            `Observation for ${firstVisualCase.id}`,
        )
        await user.type(textarea, 'cards rendered fine')

        expect(textarea).toHaveValue('cards rendered fine')
    })

    it('falls back to "Unknown error" for non-Error rejection values', async () => {
        mutateAsync.mockRejectedValueOnce({ weird: 'shape' })

        const user = userEvent.setup()
        renderHarness()

        await user.click(
            screen.getAllByRole('button', { name: /^Send case$/ })[0],
        )

        expect(
            await screen.findByText(/Send failed: Unknown error/),
        ).toBeInTheDocument()
    })

    it('copies a markdown findings report to the clipboard', async () => {
        mutateAsync.mockResolvedValueOnce(okResponse())

        const user = userEvent.setup()
        const writeText = jest
            .spyOn(navigator.clipboard, 'writeText')
            .mockResolvedValue(undefined)
        renderHarness()

        await user.click(
            screen.getAllByRole('button', { name: /^Run case$/ })[0],
        )
        await screen.findByText(/Template: .* · SID: MMxyz/)

        const textarea = screen.getByLabelText(
            `Observation for ${firstVisualCase.id}`,
        )
        await user.type(textarea, 'looks right')

        await user.click(
            screen.getByRole('button', { name: /Copy findings as markdown/ }),
        )

        expect(writeText).toHaveBeenCalledTimes(1)
        const markdown = writeText.mock.calls[0][0] as string
        expect(markdown).toContain('# RCS boundary test findings')
        expect(markdown).toContain('## Batch A — API limits')
        expect(markdown).toContain('## Batch B — iOS 26 rendering')
        expect(markdown).toContain(
            `| ${firstApiCase.id} | ${firstApiCase.name} |`,
        )
        expect(markdown).toContain(
            `OK (template=journey_carousel_2_cards_1_button, sid=MMxyz)`,
        )
        expect(markdown).toContain(`### ${firstVisualCase.id}:`)
        expect(markdown).toContain('Observation: looks right')
        expect(markdown).toContain('not run')
    })

    it('emits a Twilio error code in the markdown report for failed API cases', async () => {
        mutateAsync.mockRejectedValueOnce({
            response: { data: { code: 21610 } },
        })

        const user = userEvent.setup()
        const writeText = jest
            .spyOn(navigator.clipboard, 'writeText')
            .mockResolvedValue(undefined)
        renderHarness()

        await user.click(
            screen.getAllByRole('button', { name: /^Run case$/ })[0],
        )
        await screen.findByText(/Error: Unknown error \(code: 21610\)/)

        await user.click(
            screen.getByRole('button', { name: /Copy findings as markdown/ }),
        )

        const markdown = writeText.mock.calls[0][0] as string
        expect(markdown).toContain(`| ${firstApiCase.id} `)
        expect(markdown).toContain('Twilio 21610')
    })

    it('emits a not-run row when no API case has been triggered', async () => {
        const user = userEvent.setup()
        const writeText = jest
            .spyOn(navigator.clipboard, 'writeText')
            .mockResolvedValue(undefined)
        renderHarness()

        await user.click(
            screen.getByRole('button', { name: /Copy findings as markdown/ }),
        )

        const markdown = writeText.mock.calls[0][0] as string
        expect((markdown.match(/\| not run \|/g) ?? []).length).toBe(
            apiCaseCount,
        )
        expect(markdown).toContain('Observation: (not recorded)')
        expect(markdown).toContain('Send: not run')
    })
})

describe('BOUNDARY_TESTS data', () => {
    it('has unique case ids', () => {
        const ids = BOUNDARY_TESTS.map((t) => t.id)
        expect(new Set(ids).size).toBe(ids.length)
    })

    it('separates API and visual batches', () => {
        expect(BOUNDARY_TESTS.some((t) => t.batch === 'api')).toBe(true)
        expect(BOUNDARY_TESTS.some((t) => t.batch === 'visual')).toBe(true)
    })
})
