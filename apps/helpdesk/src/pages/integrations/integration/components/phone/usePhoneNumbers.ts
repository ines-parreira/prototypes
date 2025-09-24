import useAppSelector from 'hooks/useAppSelector'
import { getCountryFromPhoneNumber } from 'pages/phoneNumbers/utils'
import { getNewPhoneNumbers } from 'state/entities/phoneNumbers/selectors'

export default function usePhoneNumbers() {
    const phoneNumbers = useAppSelector(getNewPhoneNumbers)

    const getPhoneNumberById = (id: number) => {
        return phoneNumbers[id]
    }

    const getCountryFromPhoneNumberId = (id: number) =>
        getCountryFromPhoneNumber(getPhoneNumberById(id).phone_number)

    return {
        phoneNumbers,
        getPhoneNumberById,
        getCountryFromPhoneNumberId,
    }
}
