import React, {
    ReactNode,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react'

import * as LDClient from 'launchdarkly-js-client-sdk'

import {getLDClient} from 'utils/launchDarkly'

import FeatureFlagsContext, {FlagKey} from './context'

type Props = {
    children: ReactNode
}

const Provider = ({children}: Props): JSX.Element => {
    const [client] = useState<LDClient.LDClient>(getLDClient())
    const [flags, setFlags] = useState<Partial<Record<FlagKey, boolean>>>({})

    useEffect(() => {
        void client.waitUntilReady().then(() => {
            setFlags(client.allFlags())
        })
    }, [client])

    const handleGetFlag = useCallback<
        (key: FlagKey, defaultValue?: boolean) => boolean
    >((key, defaultValue = false) => flags[key] ?? defaultValue, [flags])

    const memoValue = useMemo(
        () => ({
            flags,
            getFlag: handleGetFlag,
        }),
        [flags, handleGetFlag]
    )

    return (
        <FeatureFlagsContext.Provider value={memoValue}>
            <>{children}</>
        </FeatureFlagsContext.Provider>
    )
}

export default Provider
