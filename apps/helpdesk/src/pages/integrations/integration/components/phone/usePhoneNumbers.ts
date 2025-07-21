import useAppSelector from 'hooks/useAppSelector'
import { getNewPhoneNumbers } from 'state/entities/phoneNumbers/selectors'

export default function usePhoneNumbers() {
    const phoneNumbers = useAppSelector(getNewPhoneNumbers)

    const getPhoneNumberById = (id: number) => {
        return phoneNumbers[id]
    }

    return {
        phoneNumbers,
        getPhoneNumberById,
    }
}
