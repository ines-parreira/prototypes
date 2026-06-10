import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { render } from '../../../../tests/render.utils'
import type { ActivityParticipant } from '../../helpers/activityParticipants'
import { ActivityOverflowList } from '../ActivityOverflowList'

const buildParticipant = (id: number, name: string): ActivityParticipant => ({
    id,
    name,
    meta: {
        profile_picture_url: `https://example.com/${id}.png`,
    },
})

describe('ActivityOverflowList', () => {
    it('renders every participant name with an avatar', () => {
        render(
            <ActivityOverflowList
                participants={[
                    buildParticipant(1, 'Alice'),
                    buildParticipant(2, 'Bob'),
                ]}
                renderTrailingContent={() => (
                    <span> are also viewing this ticket</span>
                )}
            />,
        )

        expect(screen.getByText('Alice')).toBeInTheDocument()
        expect(screen.getByText('Bob')).toBeInTheDocument()
        expect(screen.getByRole('img', { name: 'Alice' })).toBeInTheDocument()
        expect(
            screen.getAllByText('are also viewing this ticket').length,
        ).toBeGreaterThan(0)
    })

    it('passes the overflow state to the trailing content', () => {
        render(
            <ActivityOverflowList
                participants={[
                    buildParticipant(1, 'Alice'),
                    buildParticipant(2, 'Bob'),
                    buildParticipant(3, 'Carol'),
                    buildParticipant(4, 'Dave'),
                ]}
                renderTrailingContent={(params) =>
                    params?.allItemsFit === false ? (
                        <span>{`${params?.hiddenCount ?? 0} hidden`}</span>
                    ) : null
                }
            />,
        )

        expect(screen.getByText(/\d+ hidden/)).toBeInTheDocument()
    })

    it('renders the overflowed participant names inside the tooltip content', async () => {
        const { user } = render(
            <ActivityOverflowList
                participants={[
                    buildParticipant(1, 'Alice'),
                    buildParticipant(2, 'Bob'),
                    buildParticipant(3, 'Carol'),
                    buildParticipant(4, 'Dave'),
                ]}
                renderTrailingContent={() => <span>suffix</span>}
            />,
        )

        await user.tab()

        const tooltip = await screen.findByRole('tooltip')
        expect(within(tooltip).getByText('Bob')).toBeInTheDocument()
        expect(within(tooltip).getByText('Carol')).toBeInTheDocument()
        expect(within(tooltip).getByText('Dave')).toBeInTheDocument()
        expect(
            within(tooltip).getByRole('img', { name: 'Bob' }),
        ).toBeInTheDocument()
        expect(
            within(tooltip).getByRole('img', { name: 'Carol' }),
        ).toBeInTheDocument()
    })

    it('falls back to Unknown for an overflowed participant without a name', async () => {
        const { user } = render(
            <ActivityOverflowList
                participants={[
                    buildParticipant(1, 'Alice'),
                    {
                        id: 2,
                        name: null,
                        meta: null,
                    },
                ]}
                renderTrailingContent={() => <span>suffix</span>}
            />,
        )

        await user.tab()

        const tooltip = await screen.findByRole('tooltip')
        expect(within(tooltip).getByText('Unknown')).toBeInTheDocument()
    })

    it('unmounts without error after rendering the trailing content', () => {
        const { unmount } = render(
            <ActivityOverflowList
                participants={[
                    buildParticipant(1, 'Alice'),
                    buildParticipant(2, 'Bob'),
                ]}
                renderTrailingContent={() => <span>suffix</span>}
            />,
        )

        expect(screen.getAllByText('suffix').length).toBeGreaterThan(0)

        expect(() => unmount()).not.toThrow()
    })
})
