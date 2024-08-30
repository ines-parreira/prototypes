import {ToneOfVoice} from '../../constants'
import {ValidFormValues} from '../../types'
import {filterNonNull} from '../../util'

import {getStoreConfigurationFromFormValues} from './StoreConfigForm.utils'

jest.mock('../../util', () => ({
    filterNonNull: jest.fn(),
}))

describe('getStoreConfigurationFromFormValues', () => {
    const storeName = 'MyStore'
    const toneOfVoice = ToneOfVoice.Custom

    const formValuesPartial = {
        helpCenterId: 123,
        deactivatedDatetime: '2024-01-01',
        trialModeActivatedDatetime: '2024-02-01',
        monitoredEmailIntegrations: [
            {id: 1, email: 'email1@example.com'},
            {id: 2, email: 'email2@example.com'},
        ],
        monitoredChatIntegrations: [1, 2],

        customToneOfVoiceGuidance: 'Be friendly',
        signature: 'Best regards, Store',
        silentHandover: true,
        tags: [
            {name: 'tag1', description: 'description1'},
            {name: 'tag2', description: 'description2'},
        ],
        excludedTopics: ['topic1', 'topic2'],
        ticketSampleRate: 0.5,
    }

    const formValues: ValidFormValues = {
        ...formValuesPartial,
        toneOfVoice,
    }

    const filterNonNullResult = {
        silentHandover: true,
        tags: [
            {name: 'tag1', description: 'description1'},
            {name: 'tag2', description: 'description2'},
        ],
        excludedTopics: ['topic1', 'topic2'],
        ticketSampleRate: 0.5,
    }

    beforeEach(() => {
        ;(filterNonNull as jest.Mock).mockReturnValue(filterNonNullResult)
    })

    afterEach(() => {
        ;(filterNonNull as jest.Mock).mockReset()
    })
    it('should return correct values', () => {
        const result = getStoreConfigurationFromFormValues(storeName, {
            ...formValues,
            toneOfVoice: ToneOfVoice.Professional,
        })

        expect(filterNonNull).toHaveBeenCalled()

        expect(result).toEqual({
            ...formValuesPartial,
            storeName,
            customToneOfVoiceGuidance: null,
        })
    })
})
