import { useTrackstarLink } from '@trackstar/react-trackstar-link'

import { LegacyButton as Button } from '@gorgias/axiom'

import {
    useCreateTrackstarLink,
    useCreateTrackstarToken,
} from 'models/workflows/queries'
import { useStoreTrackstarContext } from 'pages/aiAgent/actions/providers/StoreTrackstarContext'
import { Paths } from 'rest_api/workflows_api/client.generated'

import { App } from '../../../../actionsPlatform/types'

import styles from './ConnectTrackstarButton.less'

type Props = {
    app: App
    actionApp: Extract<
        Paths.AppControllerGet.Responses.$200,
        { auth_type: 'trackstar' }
    >
}

export default function TrackstarConnectButton({ app, actionApp }: Props) {
    const { storeName, storeType, connections, invalidate } =
        useStoreTrackstarContext()
    const { mutateAsync: createLink } = useCreateTrackstarLink()
    const { mutateAsync: createToken } = useCreateTrackstarToken()
    const connectionId =
        connections[actionApp.auth_settings.integration_name]?.connection_id

    const { open } = useTrackstarLink({
        integrationAllowList: connectionId
            ? undefined
            : [actionApp.auth_settings.integration_name],
        onSuccess: async (auth_code: string) => {
            await createToken([
                null,
                {
                    auth_code,
                    store_name: storeName,
                    store_type: storeType,
                },
            ])
            invalidate?.()
        },
        getLinkToken: async () => {
            const res = await createLink([
                {
                    connection_id: connectionId ?? '',
                },
            ])
            return res.data.link_token
        },
    })
    return (
        <>
            <div>
                {connectionId
                    ? `Your ${app.name} account is already connected. Click the button below to reconnect your account.`
                    : `This step requires an active ${app.name} account. Click the button below to authenticate your account. Once authenticated, any future Action with a ${app.name} step for this store will automatically be connected.`}
            </div>
            <Button
                className={styles.button}
                onClick={async () => open({})}
            >{`${connectionId ? 'Reconnect' : 'Connect'} ${app.name}`}</Button>
        </>
    )
}
