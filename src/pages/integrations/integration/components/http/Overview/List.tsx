import React, {useState} from 'react'
import {Link} from 'react-router-dom'

import useAppSelector from 'hooks/useAppSelector'
import useAppDispatch from 'hooks/useAppDispatch'
import {
    getIntegrationsByType,
    getIntegrationsLoading,
} from 'state/integrations/selectors'
import {
    activateIntegration,
    deactivateIntegration,
} from 'state/integrations/actions'
import {getIntegrationConfig} from 'state/integrations/helpers'
import Button from 'pages/common/components/button/Button'
import Loader from 'pages/common/components/Loader/Loader'
import ConnectLink from 'pages/integrations/components/ConnectLink'
import ToggleInput from 'pages/common/forms/ToggleInput'
import {HttpIntegration} from 'models/integration/types'
import {IntegrationType} from 'models/integration/constants'

import NoIntegration from '../../NoIntegration'
import {BASE_PATH, NEW_INTEGRATION_PATH} from '../constants'
import css from './List.less'

const httpConfig = getIntegrationConfig(IntegrationType.Http)

function List() {
    const loading = useAppSelector(getIntegrationsLoading)
    const integrations = useAppSelector(
        getIntegrationsByType<HttpIntegration>(IntegrationType.Http)
    )
    const [shouldDisplayFullLoader, setFullLoaderDisplay] = useState(
        !loading || loading.integrations
    )

    const dispatch = useAppDispatch()

    if ((!loading || loading.integrations) && shouldDisplayFullLoader) {
        return <Loader />
    }

    return (
        <>
            {integrations.length > 0 ? (
                <ul className={css.list}>
                    {integrations
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((integration) => {
                            const editLink = `${BASE_PATH}/${integration.id}`
                            const isDisabled = integration.deactivated_datetime

                            const isLoading =
                                loading.updateIntegration === integration.id

                            const handleToggle = () => {
                                setFullLoaderDisplay(false)
                                return isDisabled
                                    ? dispatch(
                                          activateIntegration(integration.id)
                                      )
                                    : dispatch(
                                          deactivateIntegration(integration.id)
                                      )
                            }

                            return (
                                <li
                                    className={css.listItem}
                                    key={integration.id}
                                >
                                    <ToggleInput
                                        className={css.toggle}
                                        isToggled={!isDisabled}
                                        isLoading={isLoading}
                                        onClick={handleToggle}
                                    />
                                    <Link to={editLink} className={css.link}>
                                        <span>{integration.name}</span>
                                        <i className="material-icons md-3">
                                            keyboard_arrow_right
                                        </i>
                                    </Link>
                                </li>
                            )
                        })}
                </ul>
            ) : (
                <div className={css.wrapper}>
                    <NoIntegration />
                </div>
            )}
            <div className={css.wrapper}>
                <ConnectLink
                    connectUrl={`${BASE_PATH}/${NEW_INTEGRATION_PATH}`}
                    integrationTitle={IntegrationType.Http}
                >
                    <Button>Add {httpConfig?.title}</Button>
                </ConnectLink>
            </div>
        </>
    )
}

export default List
