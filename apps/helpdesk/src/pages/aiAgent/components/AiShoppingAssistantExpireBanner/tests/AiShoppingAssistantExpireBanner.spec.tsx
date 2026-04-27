import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { assumeMock, render } from '@repo/testing'
import { screen, waitFor } from '@testing-library/react'
import moment from 'moment'

import useAppSelector from 'hooks/useAppSelector'
import { useSalesTrialRevampMilestone } from 'pages/aiAgent/trial/hooks/useSalesTrialRevampMilestone'
import { getCurrentAutomatePlan } from 'state/billing/selectors'

import AiShoppingAssistantExpireBanner from '../AiShoppingAssistantExpireBanner'

jest.mock('pages/aiAgent/Activation/hooks/useActivation', () => ({
    useActivation: jest.fn(() => ({
        earlyAccessModal: null,
        showEarlyAccessModal: jest.fn(),
    })),
}))

// Mock dependencies
jest.mock('hooks/useAppSelector', () => jest.fn())
jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlag: jest.fn(),
}))

jest.mock('pages/aiAgent/trial/hooks/useSalesTrialRevampMilestone')
const useSalesTrialRevampMilestoneMock = assumeMock(
    useSalesTrialRevampMilestone,
)

const useAppSelectorMock = assumeMock(useAppSelector)
const useFlagMock = assumeMock(useFlag)

describe('AiShoppingAssistantExpireBanner', () => {
    beforeEach(() => {
        useAppSelectorMock.mockImplementation((selector) => {
            if (selector === getCurrentAutomatePlan) {
                return { generation: 5 }
            }
            return null
        })
        useFlagMock.mockImplementation((flag, defaultValue) => {
            if (flag === FeatureFlagKey.AiShoppingAssistantTrialExtension) {
                return 0
            }

            return defaultValue ?? false
        })

        // Mock trial revamp to be disabled so the banner can show
        useSalesTrialRevampMilestoneMock.mockReturnValue('off')
    })

    it('should render correctly', async () => {
        jest.spyOn(moment, 'now').mockReturnValue(
            new Date('2025-05-10T00:00:00Z').getTime(),
        )

        render(
            <AiShoppingAssistantExpireBanner deactiveDatetime="2025-05-15T00:00:00Z" />,
        )

        await waitFor(() => {
            expect(
                screen.getByText(
                    /Your trial for Shopping Assistant expires in 5 days/i,
                ),
            ).toBeInTheDocument()
        })
    })

    it('should render correctly when the trial expires today', async () => {
        jest.spyOn(moment, 'now').mockReturnValue(
            new Date('2025-05-15T00:00:00Z').getTime(),
        )

        render(
            <AiShoppingAssistantExpireBanner deactiveDatetime="2025-05-15T00:00:00Z" />,
        )

        await waitFor(() => {
            expect(
                screen.getByText(
                    /Your trial for Shopping Assistant expires today/i,
                ),
            ).toBeInTheDocument()
        })
    })

    it('should render correctly when the trial extended for 3 days', async () => {
        useFlagMock.mockImplementation((flag, defaultValue) => {
            if (flag === FeatureFlagKey.AiShoppingAssistantTrialExtension) {
                return 3
            }

            return defaultValue ?? false
        })

        render(
            <AiShoppingAssistantExpireBanner deactiveDatetime="2025-05-15T00:00:00Z" />,
        )

        await waitFor(() => {
            expect(
                screen.getByText(
                    /Your trial for Shopping Assistant expires in 3 days/i,
                ),
            ).toBeInTheDocument()
        })
    })

    it('should not render when plan is upgraded', () => {
        useAppSelectorMock.mockImplementation((selector) => {
            if (selector === getCurrentAutomatePlan) {
                return { generation: 6 }
            }
            return null
        })

        const { container } = render(
            <AiShoppingAssistantExpireBanner deactiveDatetime="2025-05-15T00:00:00Z" />,
        )

        expect(container.firstChild).toBeNull()
    })
})
