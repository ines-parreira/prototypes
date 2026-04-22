import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import useResolveConditions from 'pages/settings/SLAs/features/SLAForm/controllers/useResolveConditions'
import { makeConditionItem } from 'pages/settings/SLAs/features/SLAForm/views/ConditionsSelect/types'
import { UISLAPolicy1 } from 'pages/settings/SLAs/fixtures/fixtures'
import { renderWithRouter } from 'utils/testing'

import ConditionsCell from '../ConditionsCell'

jest.mock(
    'pages/settings/SLAs/features/SLAForm/controllers/useResolveConditions',
)

const mockUseResolveConditions = useResolveConditions as jest.Mock

const fourConditions = [
    makeConditionItem('tags', 1, 'urgent', 'urgent'),
    makeConditionItem('tags', 2, 'vip', 'vip'),
    makeConditionItem('tags', 3, 'premium', 'premium'),
    makeConditionItem('tags', 4, 'enterprise', 'enterprise'),
]

describe('ConditionsCell', () => {
    it('renders no tags when there are no conditions', () => {
        mockUseResolveConditions.mockReturnValue({
            conditions: [],
            isLoading: false,
        })

        renderWithRouter(
            <table>
                <tbody>
                    <tr>
                        <ConditionsCell policy={UISLAPolicy1} />
                    </tr>
                </tbody>
            </table>,
        )

        expect(screen.queryByText('urgent')).not.toBeInTheDocument()
    })

    it('renders all tags when conditions <= 2', () => {
        mockUseResolveConditions.mockReturnValue({
            conditions: [
                makeConditionItem('tags', 1, 'urgent', 'urgent'),
                makeConditionItem('tags', 2, 'vip', 'vip'),
            ],
            isLoading: false,
        })

        renderWithRouter(
            <table>
                <tbody>
                    <tr>
                        <ConditionsCell policy={UISLAPolicy1} />
                    </tr>
                </tbody>
            </table>,
        )

        expect(screen.getByText('urgent')).toBeInTheDocument()
        expect(screen.getByText('vip')).toBeInTheDocument()
        expect(
            screen.queryByRole('button', { name: /more conditions/i }),
        ).not.toBeInTheDocument()
    })

    it('renders 2 tags plus expand button when conditions > 2', () => {
        mockUseResolveConditions.mockReturnValue({
            conditions: fourConditions,
            isLoading: false,
        })

        renderWithRouter(
            <table>
                <tbody>
                    <tr>
                        <ConditionsCell policy={UISLAPolicy1} />
                    </tr>
                </tbody>
            </table>,
        )

        expect(screen.getByText('urgent')).toBeInTheDocument()
        expect(screen.getByText('vip')).toBeInTheDocument()
        expect(screen.queryByText('premium')).not.toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: /show 2 more conditions/i }),
        ).toBeInTheDocument()
    })

    it('expands to show all conditions inline when the expand button is clicked', async () => {
        const user = userEvent.setup()
        mockUseResolveConditions.mockReturnValue({
            conditions: fourConditions,
            isLoading: false,
        })

        renderWithRouter(
            <table>
                <tbody>
                    <tr>
                        <ConditionsCell policy={UISLAPolicy1} />
                    </tr>
                </tbody>
            </table>,
        )

        expect(screen.queryByText('premium')).not.toBeInTheDocument()
        expect(screen.queryByText('enterprise')).not.toBeInTheDocument()

        await user.click(
            screen.getByRole('button', { name: /show 2 more conditions/i }),
        )

        expect(screen.getByText('premium')).toBeInTheDocument()
        expect(screen.getByText('enterprise')).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: /collapse conditions/i }),
        ).toBeInTheDocument()
    })

    it('collapses hidden conditions when the button is clicked again', async () => {
        const user = userEvent.setup()
        mockUseResolveConditions.mockReturnValue({
            conditions: fourConditions,
            isLoading: false,
        })

        renderWithRouter(
            <table>
                <tbody>
                    <tr>
                        <ConditionsCell policy={UISLAPolicy1} />
                    </tr>
                </tbody>
            </table>,
        )

        await user.click(
            screen.getByRole('button', { name: /show 2 more conditions/i }),
        )
        await user.click(
            screen.getByRole('button', { name: /collapse conditions/i }),
        )

        expect(screen.queryByText('premium')).not.toBeInTheDocument()
        expect(screen.queryByText('enterprise')).not.toBeInTheDocument()
    })

    it('shows short label for ticket_fields conditions', () => {
        mockUseResolveConditions.mockReturnValue({
            conditions: [
                makeConditionItem(
                    'ticket_fields',
                    10,
                    'L1::optA',
                    'Priority / L1 > optA',
                ),
            ],
            isLoading: false,
        })

        renderWithRouter(
            <table>
                <tbody>
                    <tr>
                        <ConditionsCell policy={UISLAPolicy1} />
                    </tr>
                </tbody>
            </table>,
        )

        expect(screen.getByText('optA')).toBeInTheDocument()
    })
})
