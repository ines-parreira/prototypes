import {renderHook, act} from '@testing-library/react-hooks'

import {CONTACT_FORM_DEFAULT_AUTOMATION_SETTINGS} from 'pages/settings/contactForm/constants'

import useContactFormAutomationSettings from '../useContactFormAutomationSettings'
import useContactFormsAutomationSettings from '../useContactFormsAutomationSettings'

jest.mock('../useContactFormsAutomationSettings')

const mockUseContactFormsAutomationSettings =
    useContactFormsAutomationSettings as jest.Mock

describe('useContactFormAutomationSettings()', () => {
    const contactFormId = 123
    const automationSettings = {
        workflows: [{id: '123', enabled: true}],
        order_management: {enabled: false},
    }

    it('should return Automate settings', () => {
        mockUseContactFormsAutomationSettings.mockReturnValue({
            contactFormsAutomationSettings: {
                [contactFormId]: automationSettings,
            },
            handleContactFormAutomationSettingsUpdate: jest.fn(),
        })

        const {result} = renderHook(() =>
            useContactFormAutomationSettings(contactFormId)
        )

        expect(result.current.automationSettings).toBe(automationSettings)
    })

    it('should return default Automate settings', () => {
        mockUseContactFormsAutomationSettings.mockReturnValue({
            contactFormsAutomationSettings: {},
            handleContactFormAutomationSettingsUpdate: jest.fn(),
        })

        const {result} = renderHook(() =>
            useContactFormAutomationSettings(contactFormId)
        )

        expect(result.current.automationSettings).toBe(
            CONTACT_FORM_DEFAULT_AUTOMATION_SETTINGS
        )
    })

    it('should allow to update Automate settings', () => {
        const mockHandleContactFormAutomationSettingsUpdate = jest.fn()

        mockUseContactFormsAutomationSettings.mockReturnValue({
            contactFormsAutomationSettings: {},
            handleContactFormAutomationSettingsUpdate:
                mockHandleContactFormAutomationSettingsUpdate,
        })

        const {result} = renderHook(() =>
            useContactFormAutomationSettings(contactFormId)
        )

        act(() => {
            void result.current.handleContactFormAutomationSettingsUpdate(
                automationSettings
            )
        })

        expect(mockHandleContactFormAutomationSettingsUpdate).toBeCalledWith(
            contactFormId,
            automationSettings
        )
    })

    it('should allow to update Automate settings with notification message', () => {
        const mockHandleContactFormAutomationSettingsUpdate = jest.fn()

        mockUseContactFormsAutomationSettings.mockReturnValue({
            contactFormsAutomationSettings: {},
            handleContactFormAutomationSettingsUpdate:
                mockHandleContactFormAutomationSettingsUpdate,
        })

        const {result} = renderHook(() =>
            useContactFormAutomationSettings(contactFormId)
        )

        act(() => {
            void result.current.handleContactFormAutomationSettingsUpdate(
                automationSettings,
                'wow'
            )
        })

        expect(mockHandleContactFormAutomationSettingsUpdate).toBeCalledWith(
            contactFormId,
            automationSettings,
            'wow'
        )
    })
})
