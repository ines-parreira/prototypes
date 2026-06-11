import type { ComponentProps } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { render } from '@repo/testing'
import { fireEvent, screen } from '@testing-library/react'
import { fromJS } from 'immutable'

import { useAiAgentAccess } from 'hooks/aiAgent/useAiAgentAccess'
import { getSingleHelpCenterResponseFixture } from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import { getLocalesResponseFixture } from 'pages/settings/helpCenter/fixtures/getLocalesResponse.fixtures'
import { useCurrentHelpCenter } from 'pages/settings/helpCenter/hooks/useCurrentHelpCenter'
import { useSupportedLocales } from 'pages/settings/helpCenter/providers/SupportedLocales'
import {
    getAbsoluteUrl,
    getHelpCenterDomain,
} from 'pages/settings/helpCenter/utils/helpCenter.utils'

import { useHasAccessToAILibrary } from '../../AIArticlesLibraryView/hooks/useHasAccessToAILibrary'
import { HelpCenterPageWrapper } from '../HelpCenterPageWrapper'

jest.mock('hooks/aiAgent/useAiAgentAccess')
jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlag: jest.fn(),
}))
const mockUseFlag = jest.mocked(useFlag)
const mockUseAiAgentAccess = jest.mocked(useAiAgentAccess)
mockUseAiAgentAccess.mockReturnValue({ hasAccess: false, isLoading: false })
jest.mock('../../AIArticlesLibraryView/hooks/useHasAccessToAILibrary')
;(useHasAccessToAILibrary as jest.Mock).mockReturnValue(true)
jest.mock('pages/settings/helpCenter/hooks/useCurrentHelpCenter')
;(useCurrentHelpCenter as jest.Mock).mockReturnValue(
    getSingleHelpCenterResponseFixture,
)
jest.mock('pages/settings/helpCenter/utils/localeSelectOptions', () => {
    const dep: Record<string, unknown> = jest.requireActual(
        'pages/settings/helpCenter/utils/localeSelectOptions',
    )
    return {
        ...dep,
        getLocaleSelectOptions: () => [
            {
                label: 'English',
                value: 'en-US',
            },
            {
                label: 'Spanish',
                value: 'es-ES',
            },
        ],
    }
})
jest.mock('pages/settings/helpCenter/hooks/useHelpCenterApi', () => {
    const dep: Record<string, unknown> = jest.requireActual(
        'pages/settings/helpCenter/hooks/useHelpCenterApi',
    )
    return {
        ...dep,
        useAbilityChecker: () => ({ isPassingRulesCheck: () => true }),
    }
})
jest.mock('pages/settings/billing/automate/AutomateSubscriptionModal', () => ({
    __esModule: true,
    AutomateSubscriptionModal: () => null,
}))
const windowOpenMock = jest.fn().mockReturnValue({
    focus: jest.fn(),
})
global.open = windowOpenMock
const viewLanguage = 'en-US'
jest.mock('pages/settings/helpCenter/providers/SupportedLocales')
;(useSupportedLocales as jest.Mock).mockReturnValue(getLocalesResponseFixture)
describe('<HelpCenterPageWrapper />', () => {
    beforeEach(() => {
        mockUseAiAgentAccess.mockReturnValue({
            hasAccess: false,
            isLoading: false,
        })
    })
    const props: ComponentProps<typeof HelpCenterPageWrapper> = {
        helpCenter: getSingleHelpCenterResponseFixture,
    }
    const defaultStoreState = {
        integrations: fromJS({
            integrations: [],
        }),
        ui: {
            helpCenter: {
                currentLanguage: viewLanguage,
                currentId: getSingleHelpCenterResponseFixture.id,
            },
        },
    }
    const renderComponent = (
        componentProps: ComponentProps<typeof HelpCenterPageWrapper>,
    ) =>
        render(<HelpCenterPageWrapper {...componentProps} />, {
            storeState: defaultStoreState,
        })

    it('should render the component', () => {
        const { container } = renderComponent(props)
        expect(container).toMatchSnapshot()
    })
    it('should display a preview button', () => {
        const { getByRole } = renderComponent(props)
        const previewBtn = getByRole('button', { name: /help center preview/i })
        fireEvent.click(previewBtn)
        const domain = getHelpCenterDomain(getSingleHelpCenterResponseFixture)
        const helpCenterUrl = getAbsoluteUrl({ domain, locale: viewLanguage })
        expect(windowOpenMock).toHaveBeenCalledWith(helpCenterUrl, '_blank')
    })
    it('should display a language selector', () => {
        const { getByRole } = renderComponent({
            ...props,
            showLanguageSelector: true,
        })
        getByRole('textbox')
    })
    it('should display the close modal', () => {
        const onSaveChanges = jest.fn(() => Promise.resolve())
        renderComponent({
            ...props,
            isDirty: true,
            showLanguageSelector: true,
            onSaveChanges,
        })
        const englishBtn = screen.getByText(/english/i)
        fireEvent.click(englishBtn)
        const spanishBtn = screen.getByText(/spanish/i)
        fireEvent.click(spanishBtn)
        screen.getByText(/discard changes/i)
    })
    it('should trigger the onSave callback', () => {
        const onSave = jest.fn(() => Promise.resolve())
        renderComponent({
            ...props,
            onSaveChanges: onSave,
            showLanguageSelector: true,
            isDirty: true,
        })
        const englishBtn = screen.getByText(/english/i)
        fireEvent.click(englishBtn)
        const spanishBtn = screen.getByText(/spanish/i)
        fireEvent.click(spanishBtn)
        const saveBtn = screen.getByRole('button', { name: /save/i })
        fireEvent.click(saveBtn)
        expect(onSave).toHaveBeenCalled()
    })
    it('renders the connect store warning button when shop is not connected', () => {
        mockUseAiAgentAccess.mockReturnValue({
            hasAccess: true,
            isLoading: false,
        })
        mockUseFlag.mockImplementation((key, defaultValue) => {
            if (key === FeatureFlagKey.ChangeAutomateSettingButtomPosition)
                return false
            return defaultValue
        })
        const helpCenter = {
            ...getSingleHelpCenterResponseFixture,
            shop_name: null,
        }
        renderComponent({ helpCenter })
        expect(
            screen.getByRole('button', {
                name: /Connect store to enable AI Agent/i,
            }),
        ).toBeInTheDocument()
    })
})
