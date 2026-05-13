// cspell:ignore wistia
import type { ComponentProps } from 'react'

import { render } from '@repo/testing'
import { within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { VideoPreviewTooltip } from 'domains/reporting/pages/self-service/VideoPreviewTooltip'

const defaultProps = {
    videoSrc: 'https://fast.wistia.net/embed/iframe/abc123',
    videoPoster: 'https://example.com/poster.png',
    title: 'AI & Automation analytics',
    body: 'Track your AI Agent performance in one place.',
    learnMoreUrl: 'https://docs.example.com/analytics',
}

beforeEach(() => {
    jest.useFakeTimers()
})

afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
    jest.restoreAllMocks()
})

type Overrides = Partial<
    Omit<ComponentProps<typeof VideoPreviewTooltip>, 'children'>
>

const renderComponent = (overrides: Overrides = {}) =>
    render(
        <VideoPreviewTooltip {...defaultProps} {...overrides}>
            <a href="/overview">Overview</a>
        </VideoPreviewTooltip>,
    )

const openTooltip = async (
    user: ReturnType<typeof userEvent.setup>,
    getByRole: ReturnType<typeof render>['getByRole'],
    findByText: ReturnType<typeof render>['findByText'],
) => {
    await user.pointer({ target: document.body })
    await user.hover(getByRole('link', { name: 'Overview' }))
    await findByText(defaultProps.title)
}

describe('<VideoPreviewTooltip />', () => {
    it('renders children', () => {
        const { getByRole } = renderComponent()

        expect(getByRole('link', { name: 'Overview' })).toBeInTheDocument()
    })

    describe('tooltip', () => {
        it('shows title and body on hover after delay', async () => {
            const user = userEvent.setup({
                advanceTimers: jest.advanceTimersByTime,
            })
            const { getByRole, findByText, queryByText } = renderComponent()

            expect(queryByText(defaultProps.title)).not.toBeInTheDocument()

            await openTooltip(user, getByRole, findByText)

            expect(await findByText(defaultProps.title)).toBeInTheDocument()
            expect(await findByText(defaultProps.body)).toBeInTheDocument()
        })

        it('shows poster image in thumbnail when videoPoster is provided', async () => {
            const user = userEvent.setup({
                advanceTimers: jest.advanceTimersByTime,
            })
            const { getByRole, findByText, findByRole } = renderComponent()

            await openTooltip(user, getByRole, findByText)

            const poster = await findByRole('img', { name: 'Video thumbnail' })
            expect(poster).toHaveAttribute('src', defaultProps.videoPoster)
        })

        it('does not render poster image when videoPoster is not provided', async () => {
            const user = userEvent.setup({
                advanceTimers: jest.advanceTimersByTime,
            })
            const { getByRole, findByText, queryByRole } = renderComponent({
                videoPoster: undefined,
            })

            await openTooltip(user, getByRole, findByText)

            expect(
                queryByRole('img', { name: 'Video thumbnail' }),
            ).not.toBeInTheDocument()
        })

        it('shows video duration next to the title when provided', async () => {
            const user = userEvent.setup({
                advanceTimers: jest.advanceTimersByTime,
            })
            const { getByRole, findByText } = renderComponent({
                videoDuration: '2:34',
            })

            await openTooltip(user, getByRole, findByText)

            expect(await findByText('2:34')).toBeInTheDocument()
        })

        it('does not show duration when videoDuration is not provided', async () => {
            const user = userEvent.setup({
                advanceTimers: jest.advanceTimersByTime,
            })
            const { getByRole, findByText, queryByText } = renderComponent()

            await openTooltip(user, getByRole, findByText)

            expect(queryByText(/\d+:\d+/)).not.toBeInTheDocument()
        })

        it('has a Learn more link pointing to learnMoreUrl', async () => {
            const user = userEvent.setup({
                advanceTimers: jest.advanceTimersByTime,
            })
            const { getByRole, findByText, findByRole } = renderComponent()

            await openTooltip(user, getByRole, findByText)

            expect(
                await findByRole('link', { name: /learn more/i }),
            ).toHaveAttribute('href', defaultProps.learnMoreUrl)
        })
    })

    describe('modal', () => {
        const openModal = async () => {
            const user = userEvent.setup({
                advanceTimers: jest.advanceTimersByTime,
            })
            const utils = renderComponent()

            await openTooltip(user, utils.getByRole, utils.findByText)

            await user.click(
                await utils.findByRole('button', { name: /watch video/i }),
            )

            return { ...utils, user }
        }

        it('opens when clicking the Watch video button in the tooltip', async () => {
            const { findByRole } = await openModal()

            expect(await findByRole('dialog')).toBeInTheDocument()
        })

        it('shows title and body in the modal', async () => {
            const { findByRole } = await openModal()

            const dialog = await findByRole('dialog')

            expect(
                within(dialog).getByText(defaultProps.title),
            ).toBeInTheDocument()
            expect(
                within(dialog).getByText(defaultProps.body),
            ).toBeInTheDocument()
        })

        it('renders the video iframe with autoplay and muted params for Wistia URLs', async () => {
            const { findByTitle } = await openModal()

            const iframe = await findByTitle(defaultProps.title)
            expect(iframe.tagName).toBe('IFRAME')
            const src = new URL(iframe.getAttribute('src')!)
            expect(src.searchParams.get('autoPlay')).toBe('true')
            expect(src.searchParams.get('muted')).toBe('true')
        })

        it('uses the original src for non-Wistia URLs', async () => {
            const user = userEvent.setup({
                advanceTimers: jest.advanceTimersByTime,
            })
            const nonWistiaProps = {
                ...defaultProps,
                videoSrc: 'https://example.com/video.mp4',
            }
            const utils = render(
                <VideoPreviewTooltip {...nonWistiaProps}>
                    <a href="/overview">Overview</a>
                </VideoPreviewTooltip>,
            )

            await openTooltip(user, utils.getByRole, utils.findByText)
            await user.click(
                await utils.findByRole('button', { name: /watch video/i }),
            )

            const iframe = await utils.findByTitle(nonWistiaProps.title)
            expect(iframe).toHaveAttribute('src', nonWistiaProps.videoSrc)
        })

        it('closes when clicking Cancel', async () => {
            const { user, findByRole, queryByRole } = await openModal()

            await user.click(await findByRole('button', { name: /cancel/i }))

            expect(queryByRole('dialog')).not.toBeInTheDocument()
        })

        it('closes when clicking the X button', async () => {
            const { user, findByRole, queryByRole } = await openModal()

            await user.click(await findByRole('button', { name: /close/i }))

            expect(queryByRole('dialog')).not.toBeInTheDocument()
        })

        it('opens learnMoreUrl in a new tab when clicking Learn more', async () => {
            const windowOpenSpy = jest
                .spyOn(window, 'open')
                .mockImplementation(() => null)

            const { user, findByRole } = await openModal()

            await user.click(
                await findByRole('button', { name: /learn more/i }),
            )

            expect(windowOpenSpy).toHaveBeenCalledWith(
                defaultProps.learnMoreUrl,
                '_blank',
                'noopener,noreferrer',
            )
        })
    })
})
