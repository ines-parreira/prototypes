import { Form, FormSubmitButton } from '@repo/forms'
import { render, userEvent } from '@repo/testing'
import { screen, waitFor } from '@testing-library/react'

import { VoiceQueueTargetScope } from '@gorgias/helpdesk-types'

import { useListTeams } from 'models/team/queries'

import { NO_TEAM_SELECTED_LABEL } from '../VoiceIntegrationPreferencesTeamSelect'
import { VoiceQueueSettingsFormCallFlowSection } from '../VoiceQueueSettingsFormCallFlowSection'
import { DEFAULT_QUEUE_VALUES } from './../constants'

jest.mock('models/team/queries', () => ({
    useListTeams: jest.fn(),
}))

const getNumberInputByName = (name: string): HTMLElement => {
    const input = screen
        .getAllByRole('spinbutton')
        .find((el) => el.getAttribute('name') === name)

    if (!input) {
        throw new Error(`No number input found with name "${name}"`)
    }

    return input
}

const mockTeams = [
    { id: 1, name: 'Team 1', members: [] },
    { id: 2, name: 'Team 2', members: [{}, {}] },
]

describe('<VoiceQueueSettingsFormCallFlowSection />', () => {
    const renderComponent = ({
        defaultValues = {},
        onValidSubmit = jest.fn(),
    }: {
        defaultValues?: Record<string, unknown>
        onValidSubmit?: jest.Mock
    } = {}) => {
        const user = userEvent.setup()

        render(
            <Form
                defaultValues={{
                    ...DEFAULT_QUEUE_VALUES,
                    name: 'My Queue',
                    ...defaultValues,
                }}
                onValidSubmit={onValidSubmit}
            >
                <VoiceQueueSettingsFormCallFlowSection />
                <FormSubmitButton>Submit</FormSubmitButton>
            </Form>,
        )

        return { user, onValidSubmit }
    }

    beforeEach(() => {
        ;(useListTeams as jest.Mock).mockReturnValue({
            data: { data: { data: mockTeams } },
            isLoading: false,
            error: null,
        })
    })

    it('should display all fields', () => {
        renderComponent({ defaultValues: { is_wrap_up_time_enabled: true } })

        expect(screen.getByText('Distribution mode')).toBeInTheDocument()
        expect(screen.getByText('Ring time per agent')).toBeInTheDocument()
        expect(
            screen.getByText('Customize how calls are routed'),
        ).toBeInTheDocument()
        expect(screen.getByText('Round-robin ringing')).toBeInTheDocument()
        expect(screen.getByText('Broadcast ringing')).toBeInTheDocument()
        expect(screen.getByText('Enable wrap-up time')).toBeInTheDocument()
        expect(screen.getByText('Wrap-up time')).toBeInTheDocument()
        expect(screen.getByText('Wait time')).toBeInTheDocument()
        expect(screen.getByText('Wait and hold music')).toBeInTheDocument()
    })

    it.each`
        linked_targets                     | expectedTargetScope
        ${[]}                              | ${VoiceQueueTargetScope.AllAgents}
        ${[{ team_id: 1, user_id: null }]} | ${VoiceQueueTargetScope.Specific}
    `(
        'should submit target_scope of $expectedTargetScope when linked_targets is $linked_targets',
        async ({ linked_targets, expectedTargetScope }) => {
            const { user, onValidSubmit } = renderComponent({
                defaultValues: { linked_targets },
            })

            await user.clear(getNumberInputByName('wait_time'))
            await user.type(getNumberInputByName('wait_time'), '200')
            await user.click(screen.getByRole('button', { name: 'Submit' }))

            await waitFor(() => {
                expect(onValidSubmit).toHaveBeenCalledWith(
                    expect.objectContaining({
                        target_scope: expectedTargetScope,
                    }),
                    expect.anything(),
                )
            })
        },
    )

    it.each`
        ring_time | wait_time | expectedAgents
        ${5}      | ${12}     | ${'3 agents'}
        ${3}      | ${9}      | ${'3 agents'}
        ${4}      | ${19}     | ${'5 agents'}
    `(
        'should display maximum number of agents as $expectedAgents when ring_time is $ring_time and wait_time is $wait_time',
        ({ ring_time, wait_time, expectedAgents }) => {
            renderComponent({ defaultValues: { ring_time, wait_time } })

            expect(screen.getByText(expectedAgents)).toBeInTheDocument()
        },
    )

    it('should display caller experience section', () => {
        renderComponent()

        expect(screen.getByText('Caller experience')).toBeInTheDocument()
        expect(
            screen.getByText("Customize your callers' waiting experience"),
        ).toBeInTheDocument()
    })

    describe('Linked targets field', () => {
        it('should render the team select with no team selected by default', () => {
            renderComponent({ defaultValues: { linked_targets: [] } })

            expect(screen.getByText(NO_TEAM_SELECTED_LABEL)).toBeInTheDocument()
        })

        it('should render the selected team when linked_targets has a team', () => {
            renderComponent({
                defaultValues: {
                    linked_targets: [{ team_id: 2, user_id: null }],
                },
            })

            expect(screen.getByText('Team 2')).toBeInTheDocument()
        })

        it('should submit linked_targets with the selected team', async () => {
            const { user, onValidSubmit } = renderComponent({
                defaultValues: { linked_targets: [] },
            })

            await user.click(screen.getByText(NO_TEAM_SELECTED_LABEL))
            await user.click(screen.getByText('Team 1'))
            await user.click(screen.getByRole('button', { name: 'Submit' }))

            await waitFor(() => {
                expect(onValidSubmit).toHaveBeenCalledWith(
                    expect.objectContaining({
                        linked_targets: [{ team_id: 1, user_id: null }],
                    }),
                    expect.anything(),
                )
            })
        })
    })

    describe('Ring time field', () => {
        it('should submit a numeric ring_time when a value is entered', async () => {
            const { user, onValidSubmit } = renderComponent()

            await user.clear(getNumberInputByName('ring_time'))
            await user.type(getNumberInputByName('ring_time'), '42')
            await user.click(screen.getByRole('button', { name: 'Submit' }))

            await waitFor(() => {
                expect(onValidSubmit).toHaveBeenCalledWith(
                    expect.objectContaining({ ring_time: 42 }),
                    expect.anything(),
                )
            })
        })
    })

    describe('Wait time field', () => {
        it('should submit a numeric wait_time when a value is entered', async () => {
            const { user, onValidSubmit } = renderComponent()

            await user.clear(getNumberInputByName('wait_time'))
            await user.type(getNumberInputByName('wait_time'), '300')
            await user.click(screen.getByRole('button', { name: 'Submit' }))

            await waitFor(() => {
                expect(onValidSubmit).toHaveBeenCalledWith(
                    expect.objectContaining({ wait_time: 300 }),
                    expect.anything(),
                )
            })
        })
    })

    describe('Wrap up time feature', () => {
        it('should not display the wrap-up time field when is_wrap_up_time_enabled is false', () => {
            renderComponent({
                defaultValues: { is_wrap_up_time_enabled: false },
            })

            expect(screen.queryByText('Wrap-up time')).not.toBeInTheDocument()
        })

        it('should display the wrap-up time field when is_wrap_up_time_enabled is true', () => {
            renderComponent({
                defaultValues: { is_wrap_up_time_enabled: true },
            })

            expect(screen.getByText('Wrap-up time')).toBeInTheDocument()
            expect(getNumberInputByName('wrap_up_time')).toBeInTheDocument()
        })

        it('should reveal the wrap-up time field when the toggle is enabled', async () => {
            const { user } = renderComponent({
                defaultValues: { is_wrap_up_time_enabled: false },
            })

            expect(screen.queryByText('Wrap-up time')).not.toBeInTheDocument()

            await user.click(
                screen.getByRole('switch', { name: /Enable wrap-up time/i }),
            )

            expect(await screen.findByText('Wrap-up time')).toBeInTheDocument()
        })

        it('should submit a numeric wrap_up_time when a value is entered', async () => {
            const { user, onValidSubmit } = renderComponent({
                defaultValues: { is_wrap_up_time_enabled: true },
            })

            await user.clear(screen.getByLabelText('Wrap-up time'))
            await user.type(screen.getByLabelText('Wrap-up time'), '45')
            await user.click(screen.getByRole('button', { name: 'Submit' }))

            await waitFor(() => {
                expect(onValidSubmit).toHaveBeenCalledWith(
                    expect.objectContaining({ wrap_up_time: 45 }),
                    expect.anything(),
                )
            })
        })
    })
})
