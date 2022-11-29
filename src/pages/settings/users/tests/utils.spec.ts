import {
    AvailabilityStatusChannel,
    AvailabilityStatusDetailCode,
    AvailabilityStatusTag,
    PhoneAvailabilityStatus,
} from 'config/types/user'
import {getAvailabilityStatus} from '../utils'
import {StatusIntent} from '../Status'

describe('getAvailabilityStatus', () => {
    it.each`
        status_detail_code                           | status                           | expectedLabel                          | expectedIntent
        ${null}                                      | ${AvailabilityStatusTag.Online}  | ${PhoneAvailabilityStatus.Available}   | ${StatusIntent.Success}
        ${AvailabilityStatusDetailCode.NotConnected} | ${AvailabilityStatusTag.Offline} | ${PhoneAvailabilityStatus.Unavailable} | ${StatusIntent.Neutral}
        ${AvailabilityStatusDetailCode.InPhoneCall}  | ${AvailabilityStatusTag.Busy}    | ${PhoneAvailabilityStatus.InPhoneCall} | ${StatusIntent.Warning}
        ${AvailabilityStatusDetailCode.PhoneRinging} | ${AvailabilityStatusTag.Busy}    | ${PhoneAvailabilityStatus.Ringing}     | ${StatusIntent.Warning}
        ${''}                                        | ${AvailabilityStatusTag.Busy}    | ${'Unknown'}                           | ${StatusIntent.Warning}
        ${undefined}                                 | ${undefined}                     | ${'Unknown'}                           | ${StatusIntent.Neutral}
    `(
        'returns the correct output after intersecting status & status_detail_code',
        ({status_detail_code, status, expectedLabel, expectedIntent}) => {
            expect(
                getAvailabilityStatus({
                    channel: AvailabilityStatusChannel.Phone,
                    status_detail_code,
                    status,
                })
            ).toEqual({
                label: expectedLabel,
                intent: expectedIntent,
            })
        }
    )
})
