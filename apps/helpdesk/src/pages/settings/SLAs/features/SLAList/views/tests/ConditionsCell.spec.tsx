import { screen } from '@testing-library/react'

import useResolveConditions from 'pages/settings/SLAs/features/SLAForm/controllers/useResolveConditions'
import { makeConditionItem } from 'pages/settings/SLAs/features/SLAForm/views/ConditionsSelect/types'
import { UISLAPolicy1 } from 'pages/settings/SLAs/fixtures/fixtures'
import { renderWithRouter } from 'utils/testing'

import ConditionsCell from '../ConditionsCell'

jest.mock(
    'pages/settings/SLAs/features/SLAForm/controllers/useResolveConditions',
)

const mockUseResolveConditions = useResolveConditions as jest.Mock

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
        expect(screen.queryByText(/^\+/)).not.toBeInTheDocument()
    })

    it('renders 2 tags plus surplus indicator when conditions > 2', () => {
        mockUseResolveConditions.mockReturnValue({
            conditions: [
                makeConditionItem('tags', 1, 'urgent', 'urgent'),
                makeConditionItem('tags', 2, 'vip', 'vip'),
                makeConditionItem('tags', 3, 'premium', 'premium'),
                makeConditionItem('tags', 4, 'enterprise', 'enterprise'),
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
        expect(screen.queryByText('premium')).not.toBeInTheDocument()
        expect(screen.getByText('+2')).toBeInTheDocument()
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
