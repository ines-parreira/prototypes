import { act } from '@testing-library/react-hooks'
import { fromJS } from 'immutable'

import { account } from 'fixtures/account'
import { axiosSuccessResponse } from 'fixtures/axiosResponse'
import { generateToneOfVoice } from 'models/aiAgent/resources/tone-of-voice'
import { renderHookWithStoreAndQueryClientProvider } from 'tests/renderHookWithStoreAndQueryClientProvider'
import { assumeMock } from 'utils/testing'

import { useGenerateToneOfVoice } from '../useGenerateToneOfVoice'

jest.mock('models/aiAgent/resources/tone-of-voice')
const generateToneOfVoiceMock = assumeMock(generateToneOfVoice)

describe('useGenerateToneOfVoice', () => {
    beforeEach(() => {
        generateToneOfVoiceMock.mockResolvedValue(
            axiosSuccessResponse({
                tone_of_voice: 'test',
            }),
        )
    })

    it('should call generateToneOfVoice with correct params', async () => {
        const { result } = renderHookWithStoreAndQueryClientProvider(
            () => useGenerateToneOfVoice(),
            {
                currentAccount: fromJS(account),
            },
        )

        await act(async () => {
            await result.current.generateToneOfVoice('test-store.myshopify.com')
        })

        expect(generateToneOfVoiceMock).toHaveBeenCalledWith(
            'acme',
            'test-store.myshopify.com',
        )
    })
})
