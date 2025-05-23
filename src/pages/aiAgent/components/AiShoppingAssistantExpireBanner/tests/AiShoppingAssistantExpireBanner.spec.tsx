import { render, screen } from '@testing-library/react'
import moment from 'moment'

import { useFlag } from 'core/flags'
import useAppSelector from 'hooks/useAppSelector'
import { getAiShoppingAssistantTrialExtensionEnabledFlag } from 'pages/aiAgent/Activation/utils'
import { getCurrentAutomatePlan } from 'state/billing/selectors'
import { assumeMock } from 'utils/testing'

import AiShoppingAssistantExpireBanner from '../AiShoppingAssistantExpireBanner'

jest.mock('pages/aiAgent/Activation/hooks/useActivation', () => ({
    useActivation: jest.fn(() => ({
        earlyAccessModal: null,
        showEarlyAccessModal: jest.fn(),
    })),
}))

jest.mock('pages/aiAgent/Activation/utils')
const getAiShoppingAssistantTrialExtensionEnabledFlagMock = assumeMock(
    getAiShoppingAssistantTrialExtensionEnabledFlag,
)

// Mock dependencies
jest.mock('hooks/useAppSelector', () => jest.fn())
jest.mock('core/flags', () => ({
    useFlag: jest.fn(),
}))

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
        useFlagMock.mockReturnValue(false)
    })

    it('should render correctly', () => {
        jest.spyOn(moment, 'now').mockReturnValue(
            new Date('2025-05-10T00:00:00Z').getTime(),
        )

        render(
            <AiShoppingAssistantExpireBanner deactiveDatetime="2025-05-15T00:00:00Z" />,
        )

        expect(
            screen.getByText(
                /Your trial for Shopping Assistant expires in 5 days/i,
            ),
        ).toBeInTheDocument()
    })

    it('should render correctly when the trial expires today', () => {
        jest.spyOn(moment, 'now').mockReturnValue(
            new Date('2025-05-15T00:00:00Z').getTime(),
        )

        render(
            <AiShoppingAssistantExpireBanner deactiveDatetime="2025-05-15T00:00:00Z" />,
        )

        expect(
            screen.getByText(
                /Your trial for Shopping Assistant expires today/i,
            ),
        ).toBeInTheDocument()
    })

    it('should render correctly when the trial extended for 3 days', () => {
        getAiShoppingAssistantTrialExtensionEnabledFlagMock.mockReturnValue(3)

        render(
            <AiShoppingAssistantExpireBanner deactiveDatetime="2025-05-15T00:00:00Z" />,
        )

        expect(
            screen.getByText(
                /Your trial for Shopping Assistant expires in 3 days/i,
            ),
        ).toBeInTheDocument()
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
