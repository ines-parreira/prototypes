import { useState } from 'react'

import { Link } from 'react-router-dom'

import { LegacyToggleField as ToggleField } from '@gorgias/axiom'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { IntegrationType } from 'models/integration/constants'
import type { HttpIntegration } from 'models/integration/types'
import Loader from 'pages/common/components/Loader/Loader'
import {
    activateIntegration,
    deactivateIntegration,
} from 'state/integrations/actions'
import {
    getIntegrationsByType,
    getIntegrationsLoading,
} from 'state/integrations/selectors'

import NoIntegration from '../../NoIntegration'
import { BASE_PATH } from '../constants'

import css from './List.less'

function List() {
    const loading = useAppSelector(getIntegrationsLoading)
    const integrations = useAppSelector(
        getIntegrationsByType<HttpIntegration>(IntegrationType.Http),
    )
    const [shouldDisplayFullLoader, setFullLoaderDisplay] = useState(
        !loading || loading.integrations,
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
                        .filter((integration) => !integration.managed)
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
                                          activateIntegration(integration.id),
                                      )
                                    : dispatch(
                                          deactivateIntegration(integration.id),
                                      )
                            }

                            return (
                                <li
                                    className={css.listItem}
                                    key={integration.id}
                                >
                                    <ToggleField
                                        className={css.toggle}
                                        value={!isDisabled}
                                        isLoading={isLoading}
                                        onChange={handleToggle}
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
        </>
    )
}

export default List
