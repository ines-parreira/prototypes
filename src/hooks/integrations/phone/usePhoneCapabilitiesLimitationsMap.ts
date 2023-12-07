import {useEffect} from 'react'
// [PLTOF-48] Please avoid importing more hooks from 'react-use', prefer using your own implementation of the hook rather than depending on external library
// eslint-disable-next-line no-restricted-imports
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
