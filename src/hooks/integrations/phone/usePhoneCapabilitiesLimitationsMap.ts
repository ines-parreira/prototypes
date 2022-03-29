import {useEffect} from 'react'
import {createGlobalState} from 'react-use'
import {isEmpty} from 'lodash'

import {fetchPhoneCapabilities} from 'models/phoneNumber/resources'
import {PhoneCapabilitiesLimitationsMap} from 'models/phoneNumber/types'

const useCapabilitiesSettingsValue =
    createGlobalState<PhoneCapabilitiesLimitationsMap>({})

export function usePhoneCapabilitiesLimitationsMap(): PhoneCapabilitiesLimitationsMap {
    const [capabilities, setCapabilities] = useCapabilitiesSettingsValue()

    useEffect(() => {
        async function fetchAndStoreCapabilities() {
            const capabilities = await fetchPhoneCapabilities()
            setCapabilities(capabilities)
        }

        if (isEmpty(capabilities)) {
            void fetchAndStoreCapabilities()
        }
    }, [capabilities, setCapabilities])

    return capabilities
}
