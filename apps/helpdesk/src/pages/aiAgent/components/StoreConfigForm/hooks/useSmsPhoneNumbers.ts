import useAppSelector from 'hooks/useAppSelector'
import { getPhoneChannelsForSmsSource } from 'state/integrations/selectors'

import { SmsPhoneNumber } from '../types'

export function useSmsPhoneNumbers(): SmsPhoneNumber[] {
    return useAppSelector(
        getPhoneChannelsForSmsSource,
    ).toJS() as SmsPhoneNumber[]
}
