import { render, userEvent } from '@repo/testing'
import { screen, waitFor } from '@testing-library/react'
import { fromJS } from 'immutable'
import { toast } from '@gorgias/axiom'

import * as featureFlags from '@repo/feature-flags'
import { FeatureFlagKey } from '@repo/feature-flags'
import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'

import { getSingleHelpCenterResponseFixture } from '../../fixtures/getHelpCentersResponse.fixture'
import { getLocalesResponseFixture } from '../../fixtures/getLocalesResponse.fixtures'
import { useCurrentHelpCenter } from '../../hooks/useCurrentHelpCenter'
import { useSupportedLocales } from '../../providers/SupportedLocales'
import { useHasAccessToAILibrary } from '../AIArticlesLibraryView/hooks/useHasAccessToAILibrary'
import { HelpCenterCustomizationView } from '../HelpCenterCustomizationView'

const mockClient = {
    getExtraHTML: jest.fn().mockResolvedValue({
        data: {
            custom_header: '',
            custom_footer: '',
            extra_head: '',
            custom_footer_deactivated_datetime: '2023-01-01T00:00:00.000Z',
            custom_header_deactivated_datetime: '2023-01-01T00:00:00.000Z',
            extra_head_deactivated_datetime: '2023-01-01T00:00:00.000Z',
        },
    }),
    listNavigationLinks: jest.fn().mockResolvedValue({ data: { data: [] } }),
    updateExtraHTML: jest.fn().mockResolvedValue({
        data: {
            custom_header: '',
            custom_footer: '',
            extra_head: '',
            custom_footer_deactivated_datetime: '2023-01-01T00:00:00.000Z',
            custom_header_deactivated_datetime: '2023-01-01T00:00:00.000Z',
            extra_head_deactivated_datetime: '2023-01-01T00:00:00.000Z',
        },
    }),
    updateHelpCenterTranslation: jest
        .fn()
        .mockResolvedValue({ data: { locale: 'en-US' } }),
}

let mockUseHelpCenterApiValue: {
    isReady: boolean
    client: typeof mockClient | undefined
} = {
    isReady: false,
    client: undefined,
}

jest.mock('../../hooks/useHelpCenterApi', () => ({
    useHelpCenterApi: () => mockUseHelpCenterApiValue,
    useAbilityChecker: () => ({ isPassingRulesCheck: () => true }),
}))

jest.mock('hooks/aiAgent/useAiAgentAccess')
const mockUseAiAgentAccess = jest.mocked(useAiAgentAccess)
mockUseAiAgentAccess.mockReturnValue({ hasAccess: false, isLoading: false })
jest.mock('../AIArticlesLibraryView/hooks/useHasAccessToAILibrary')
;(useHasAccessToAILibrary as jest.Mock).mockReturnValue(true)
jest.mock('../../hooks/useCurrentHelpCenter')
;(useCurrentHelpCenter as jest.Mock).mockReturnValue(
    getSingleHelpCenterResponseFixture,
)
jest.mock('../../providers/SupportedLocales')
;(useSupportedLocales as jest.Mock).mockReturnValue(getLocalesResponseFixture)
jest.mock('../../hooks/useHelpCenterIdParam', () => {
    return {
        useHelpCenterIdParam: jest.fn().mockReturnValue(1),
    }
})
jest.mock('pages/settings/billing/automate/AutomateSubscriptionModal', () => ({
    __esModule: true,
    AutomateSubscriptionModal: () => null,
}))
const useFlagSpy = jest.spyOn(featureFlags, 'useFlag')

describe('<HelpCenterCustomizationView />', () => {
    beforeEach(() => {
        mockUseAiAgentAccess.mockReturnValue({
            hasAccess: true,
            isLoading: false,
        })
        useFlagSpy.mockReturnValue(false)
        mockUseHelpCenterApiValue = { isReady: false, client: undefined }
    })

    afterEach(() => {
        toast.dismiss()
    })

    const props = {}
    const renderComponent = () =>
        render(<HelpCenterCustomizationView {...props} />, {
            storeState: {
                integrations: fromJS({
                    integrations: [],
                }),
                ui: {
                    helpCenter: {
                        currentLanguage: 'en-US',
                        currentId: 1,
                    },
                },
            },
        })

    it('should render the component', () => {
        const { container } = renderComponent()
        expect(container).toMatchSnapshot()
    })

    it('shows a success toast when saving customizations', async () => {
        useFlagSpy.mockImplementation(
            (flag) => flag === FeatureFlagKey.HelpCenterLogoHyperlink,
        )
        mockUseHelpCenterApiValue = { isReady: true, client: mockClient }

        const user = userEvent.setup()
        renderComponent()

        const logoHyperlinkInput =
            await screen.findByLabelText('Logo hyperlink')

        await user.type(logoHyperlinkInput, 'https://example.com')

        const saveButton = screen.getByRole('button', {
            name: 'Save Changes',
        })
        await waitFor(() => expect(saveButton).toBeAriaEnabled())

        await user.click(saveButton)

        const toastEl = await screen.findByRole('status', {
            name: 'Customizations saved with success',
        })
        expect(toastEl).toHaveAttribute('data-intent', 'success')
    })

    it('shows error toasts when the logo hyperlink is invalid', async () => {
        useFlagSpy.mockImplementation(
            (flag) => flag === FeatureFlagKey.HelpCenterLogoHyperlink,
        )
        mockUseHelpCenterApiValue = { isReady: true, client: mockClient }

        const user = userEvent.setup()
        renderComponent()

        const logoHyperlinkInput =
            await screen.findByLabelText('Logo hyperlink')

        await user.type(logoHyperlinkInput, 'not a valid url')

        const saveButton = screen.getByRole('button', {
            name: 'Save Changes',
        })
        await waitFor(() => expect(saveButton).toBeAriaEnabled())

        await user.click(saveButton)

        const invalidUrlToast = await screen.findByRole('status', {
            name: 'URL is invalid',
        })
        expect(invalidUrlToast).toHaveAttribute('data-intent', 'destructive')

        const failureToast = await screen.findByRole('status', {
            name: 'Failed to save the customizations',
        })
        expect(failureToast).toHaveAttribute('data-intent', 'destructive')
    })
})
