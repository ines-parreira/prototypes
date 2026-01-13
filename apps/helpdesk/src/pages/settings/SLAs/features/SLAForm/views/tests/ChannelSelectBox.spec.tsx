import { Form } from '@repo/forms'
import { assumeMock } from '@repo/testing'
import { act, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {
    SLAPolicyMetricType,
    SLAPolicyMetricUnit,
} from '@gorgias/helpdesk-types'

import { TicketChannel } from 'business/types/ticket'
import type { Channel } from 'models/channel/types'
import { getChannels } from 'services/channels'
import { renderWithStoreAndQueryClientProvider } from 'tests/renderWithStoreAndQueryClientProvider'

import { ChannelSelectBox } from '../ChannelSelectBox'

/* the channels query doesn't seem to be available in the sdk */
jest.mock('services/channels')

const mockGetChannels = assumeMock(getChannels)
mockGetChannels.mockReturnValue([
    {
        id: '1',
        name: 'Channel 1',
        slug: 'channel-1',
    } as Channel,
    {
        id: '2',
        name: 'Voice',
        slug: TicketChannel.Phone,
    } as Channel,
    {
        id: '3',
        name: 'Email',
        slug: TicketChannel.Email,
    } as Channel,
])

describe('ChannelSelectBox', () => {
    it('should render the component with all channels', async () => {
        const user = userEvent.setup()
        renderWithStoreAndQueryClientProvider(
            <Form
                defaultValues={
                    {
                        target_channels: [],
                        metrics: [],
                    } as any
                }
                onValidSubmit={jest.fn()}
            >
                <ChannelSelectBox />
            </Form>,
        )

        expect(screen.getByText('Channels')).toBeInTheDocument()
        expect(
            screen.getByText(
                'Choose the channels this SLA should apply to. Voice cannot be combined with other channels.',
            ),
        ).toBeInTheDocument()

        await act(() =>
            user.click(
                screen.getByText(
                    'Choose the channels this SLA should apply to. Voice cannot be combined with other channels.',
                ),
            ),
        )

        await waitFor(() => {
            expect(screen.getByText('Channel 1')).toBeInTheDocument()
            expect(screen.getByText('Email')).toBeInTheDocument()
            expect(screen.getAllByText('Voice')[0]).toBeInTheDocument()
        })
    })

    it('should set voice metrics when voice channel is selected', async () => {
        const user = userEvent.setup()
        const handleSubmit = jest.fn()

        renderWithStoreAndQueryClientProvider(
            <Form
                defaultValues={
                    {
                        target_channels: [],
                        metrics: [
                            {
                                name: SLAPolicyMetricType.Frt,
                                threshold: 10,
                                unit: SLAPolicyMetricUnit.Hour,
                            },
                        ],
                    } as any
                }
                onValidSubmit={handleSubmit}
            >
                <ChannelSelectBox />
                <button type="submit">Submit</button>
            </Form>,
        )

        await act(() => user.click(screen.getByText('Select')))

        await waitFor(() => {
            expect(screen.getByRole('option', { name: 'Voice' })).toBeVisible()
        })

        const voiceOption = screen.getByRole('option', { name: 'Voice' })

        await act(() => user.click(voiceOption))

        await act(() => user.keyboard('{Escape}'))

        const submitButton = screen.getByRole('button', { name: /submit/i })
        await act(() => user.click(submitButton))

        expect(handleSubmit).toHaveBeenCalledWith(
            expect.objectContaining({
                target_channels: [TicketChannel.Phone],
                metrics: [
                    {
                        name: SLAPolicyMetricType.WaitTime,
                        threshold: 1,
                        unit: SLAPolicyMetricUnit.Minute,
                    },
                ],
            }),
            expect.anything(),
        )
    })

    it('should set non-voice metrics when voice channel is deselected', async () => {
        const user = userEvent.setup()
        const handleSubmit = jest.fn()

        renderWithStoreAndQueryClientProvider(
            <Form
                defaultValues={
                    {
                        target_channels: [TicketChannel.Phone],
                        target: 0.9,
                        metrics: [
                            {
                                name: SLAPolicyMetricType.WaitTime,
                                threshold: 20,
                                unit: SLAPolicyMetricUnit.Minute,
                            },
                        ],
                    } as any
                }
                onValidSubmit={handleSubmit}
            >
                <ChannelSelectBox />
                <button type="submit">Submit</button>
            </Form>,
        )

        await waitFor(() => {
            expect(
                screen.getByRole('button', { name: /voice/i }),
            ).toBeInTheDocument()
        })

        const button = screen.getByRole('button', { name: /voice/i })

        await act(() => user.click(button))

        await waitFor(() => {
            expect(screen.getByRole('option', { name: 'Voice' })).toBeVisible()
        })

        const voiceOption = screen.getByRole('option', { name: 'Voice' })
        await act(() => user.click(voiceOption))

        await waitFor(() => {
            expect(screen.getByRole('option', { name: 'Email' })).toBeVisible()
        })

        const emailOption = screen.getByRole('option', { name: 'Email' })
        await act(() => user.click(emailOption))

        await act(() => user.keyboard('{Escape}'))

        await waitFor(() => {
            expect(
                screen.getByRole('button', { name: /submit/i }),
            ).toBeInTheDocument()
        })

        const submitButton = screen.getByRole('button', { name: /submit/i })
        await act(() => user.click(submitButton))

        expect(handleSubmit).toHaveBeenCalledWith(
            expect.objectContaining({
                target_channels: [TicketChannel.Email],
                target: undefined,
                metrics: [
                    {
                        name: SLAPolicyMetricType.Frt,
                        threshold: undefined,
                        unit: SLAPolicyMetricUnit.Second,
                    },
                    {
                        name: SLAPolicyMetricType.Rt,
                        threshold: undefined,
                        unit: SLAPolicyMetricUnit.Second,
                    },
                ],
            }),
            expect.anything(),
        )
    })

    it('should allow selecting multiple non-voice channels', async () => {
        const user = userEvent.setup()
        const handleSubmit = jest.fn()

        renderWithStoreAndQueryClientProvider(
            <Form
                defaultValues={
                    {
                        target_channels: [],
                        metrics: [],
                    } as any
                }
                onValidSubmit={handleSubmit}
            >
                <ChannelSelectBox />
                <button type="submit">Submit</button>
            </Form>,
        )

        await act(() => user.click(screen.getByText('Select')))

        await waitFor(() => {
            expect(screen.getAllByText('Email').length).toBeGreaterThan(0)
        })

        const emailOption = screen.getByRole('option', { name: 'Email' })

        if (emailOption) {
            await act(() => user.click(emailOption))
        }

        await waitFor(() => {
            expect(screen.getAllByText('Channel 1').length).toBeGreaterThan(0)
        })

        const channel1Option = screen.getByRole('option', { name: 'Channel 1' })

        if (channel1Option) {
            await act(() => user.click(channel1Option))
        }

        await act(() => user.keyboard('{Escape}'))

        await waitFor(() => {
            expect(
                screen.getByRole('button', { name: /submit/i }),
            ).toBeInTheDocument()
        })

        const submitButton = screen.getByRole('button', { name: /submit/i })
        await act(() => user.click(submitButton))

        expect(handleSubmit).toHaveBeenCalledWith(
            expect.objectContaining({
                target_channels: expect.arrayContaining([
                    TicketChannel.Email,
                    'channel-1',
                ]),
            }),
            expect.anything(),
        )
    })

    it('should transform output to array of channel slugs', async () => {
        const user = userEvent.setup()
        const handleSubmit = jest.fn()

        renderWithStoreAndQueryClientProvider(
            <Form
                defaultValues={
                    {
                        target_channels: [],
                        metrics: [],
                    } as any
                }
                onValidSubmit={handleSubmit}
            >
                <ChannelSelectBox />
                <button type="submit">Submit</button>
            </Form>,
        )

        await act(() => user.click(screen.getByText('Select')))

        await waitFor(() => {
            expect(screen.getAllByText('Email').length).toBeGreaterThan(0)
        })

        const emailOption = screen.getByRole('option', { name: 'Email' })

        if (emailOption) {
            await act(() => user.click(emailOption))
        }

        await act(() => user.keyboard('{Escape}'))

        await waitFor(() => {
            expect(
                screen.getByRole('button', { name: /submit/i }),
            ).toBeInTheDocument()
        })

        const submitButton = screen.getByRole('button', { name: /submit/i })
        await act(() => user.click(submitButton))

        expect(handleSubmit).toHaveBeenCalledWith(
            expect.objectContaining({
                target_channels: [TicketChannel.Email],
            }),
            expect.anything(),
        )
    })
})
