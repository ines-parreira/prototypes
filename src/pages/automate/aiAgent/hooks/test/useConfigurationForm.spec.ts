import {renderHook, act} from '@testing-library/react-hooks'
import {ToneOfVoice} from '../../constants'
import {
    useConfigurationForm,
    validateConfigurationFormValues,
} from '../useConfigurationForm'
import {FormValues} from '../../types'

const MOCK_EMAIL_ADDRESS = 'test@mail.com'

const INITIAL_FORM_VALUES: FormValues = {
    toneOfVoice: null,
    customToneOfVoiceGuidance: null,
    deactivatedDatetime: undefined,
    trialModeActivatedDatetime: null,
    excludedTopics: null,
    helpCenterId: null,
    monitoredEmailIntegrations: null,
    signature: null,
    silentHandover: null,
    tags: null,
    ticketSampleRate: null,
    monitoredChatIntegrations: null,
}

describe('useConfigurationForm', () => {
    it('should return default values', () => {
        // Arrange
        const defaultValues = {
            toneOfVoice: ToneOfVoice.Friendly,
            signature: 'test signature',
        }
        const expectedValues = {
            ...INITIAL_FORM_VALUES,
            ...defaultValues,
        }
        // Act
        const {result} = renderHook(() => useConfigurationForm(defaultValues))
        // Assert
        expect(result.current.formValues).toEqual(expectedValues)
    })

    it('should mark form is dirty when values changed', () => {
        // Act
        const {result} = renderHook(() => useConfigurationForm())

        act(() => {
            result.current.updateValue('signature', 'new signature')
        })

        // Assert
        expect(result.current.isFormDirty).toBe(true)
        expect(result.current.isFieldDirty('signature')).toBe(true)
    })

    describe('validateConfigurationFormValues', () => {
        it('should throw error when signature is empty', () => {
            expect(() =>
                validateConfigurationFormValues(
                    {
                        ...INITIAL_FORM_VALUES,
                        signature: '',
                        monitoredEmailIntegrations: [],
                        monitoredChatIntegrations: [],
                    },
                    []
                )
            ).toThrow('Signature can not be empty')
        })

        it('should throw error when no help center and public links', () => {
            expect(() =>
                validateConfigurationFormValues(
                    {
                        ...INITIAL_FORM_VALUES,
                        monitoredEmailIntegrations: [],
                        monitoredChatIntegrations: [],
                        signature: 'signature',
                        helpCenterId: null,
                    },
                    []
                )
            ).toThrow('Select a Help Center or add at least one public URL')
        })
        it('should return empty array if monitoredChatIntegrations is null', () => {
            const result = validateConfigurationFormValues(
                {
                    ...INITIAL_FORM_VALUES,
                    signature: 'This response was created by AI',
                    helpCenterId: 1,
                    monitoredEmailIntegrations: [
                        {id: 1, email: MOCK_EMAIL_ADDRESS},
                    ],
                },
                []
            )

            expect(result.monitoredChatIntegrations).toEqual([])
        })

        it('should throw error when monitoredEmailIntegrations is empty', () => {
            expect(() =>
                validateConfigurationFormValues(
                    {
                        ...INITIAL_FORM_VALUES,
                        signature: 'This response was created by AI',
                        helpCenterId: 1,
                        deactivatedDatetime: null,
                        monitoredEmailIntegrations: [],
                    },
                    []
                )
            ).toThrow(
                'Please select at least 1 email address for AI Agent to use or disable AI Agent to proceed.'
            )
        })

        it('should throw error when monitoredEmailIntegrations is empty and chat support is enabled', () => {
            expect(() =>
                validateConfigurationFormValues(
                    {
                        ...INITIAL_FORM_VALUES,
                        signature: 'This response was created by AI',
                        helpCenterId: 1,
                        monitoredEmailIntegrations: [],
                        monitoredChatIntegrations: [],
                        deactivatedDatetime: null,
                    },
                    [],
                    true
                )
            ).toThrow(
                'Please select at least 1 email address or chat integrations for AI Agent to use or disable AI Agent to proceed.'
            )
        })
    })
})
