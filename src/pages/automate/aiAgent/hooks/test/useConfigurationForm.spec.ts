import {renderHook, act} from '@testing-library/react-hooks'
import {ToneOfVoice} from '../../constants'
import {
    useConfigurationForm,
    validateConfigurationFormValues,
} from '../useConfigurationForm'
import {FormValues} from '../../types'

const INITIAL_FORM_VALUES: FormValues = {
    toneOfVoice: null,
    customToneOfVoiceGuidance: null,
    deactivatedDatetime: undefined,
    excludedTopics: null,
    helpCenterId: null,
    monitoredEmailIntegrations: null,
    publicURLs: null,
    signature: null,
    silentHandover: null,
    tags: null,
    ticketSampleRate: null,
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
                validateConfigurationFormValues({
                    ...INITIAL_FORM_VALUES,
                    signature: '',
                    monitoredEmailIntegrations: [],
                })
            ).toThrow('Signature can not be empty')
        })

        it('should throw error when no help center and public links', () => {
            expect(() =>
                validateConfigurationFormValues({
                    ...INITIAL_FORM_VALUES,
                    monitoredEmailIntegrations: [],
                    publicURLs: [],
                    helpCenterId: null,
                })
            ).toThrow('Select a Help Center or add at least one public URL')
        })
    })
})
