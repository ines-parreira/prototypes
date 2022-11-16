import {
    AvailabilityStatus,
    AvailabilityStatusChannel,
    AvailabilityStatusDetailCode,
    AvailabilityStatusTag,
    PhoneAvailabilityStatus,
} from 'config/types/user'
import {StatusIntent} from './Status/Status'

type StatusLabel = PhoneAvailabilityStatus | 'Unknown'

type StatusProperties = {
    label: StatusLabel
    intent: StatusIntent
}

export const getAvailabilityStatus = (
    availability: Maybe<AvailabilityStatus<AvailabilityStatusChannel.Phone>>
): StatusProperties => {
    switch (availability?.status) {
        case AvailabilityStatusTag.Online:
            return {
                label: PhoneAvailabilityStatus.Available,
                intent: StatusIntent.Success,
            }
        case AvailabilityStatusTag.Offline:
            return {
                label: PhoneAvailabilityStatus.Unavailable,
                intent: StatusIntent.Neutral,
            }
        case AvailabilityStatusTag.Busy: {
            let label: StatusLabel

            switch (availability.status_detail_code) {
                case AvailabilityStatusDetailCode.PhoneRinging:
                    label = PhoneAvailabilityStatus.Ringing
                    break
                case AvailabilityStatusDetailCode.InPhoneCall:
                    label = PhoneAvailabilityStatus.InPhoneCall
                    break
                default:
                    label = 'Unknown'
            }

            return {
                label,
                intent: StatusIntent.Warning,
            }
        }
    }

    return {
        label: 'Unknown',
        intent: StatusIntent.Neutral,
    }
}
