import { LegacyStatsFilters } from 'domains/reporting/models/stat/types'
import SelectFilter from 'domains/reporting/pages/common/SelectFilter'
import css from 'domains/reporting/pages/self-service/DEPRECATED_SelfServiceIntegrationsFilter.less'
import useStoreIntegrations from 'pages/automate/common/hooks/useStoreIntegrations'
import { Value } from 'pages/common/forms/SelectField/types'
import { getIconFromType } from 'state/integrations/helpers'

type Props = {
    value: LegacyStatsFilters['integrations']
    onChange: (value: Value[]) => void
}
/**
 * @deprecated
 * @date 2023-08-28
 * @type feature-component
 */
const DEPRECATED_SelfServiceIntegrationsFilter = ({
    value = [],
    onChange,
}: Props) => {
    const storeIntegrations = useStoreIntegrations()

    return (
        <SelectFilter
            plural="stores"
            singular="store"
            onChange={onChange}
            value={value}
        >
            {storeIntegrations.map((storeIntegration) => (
                <SelectFilter.Item
                    key={storeIntegration.id}
                    label={storeIntegration.name}
                    value={storeIntegration.id}
                    icon={
                        <img
                            src={getIconFromType(storeIntegration.type)}
                            alt="logo"
                            className={css.integrationIcon}
                        />
                    }
                />
            ))}
        </SelectFilter>
    )
}

export default DEPRECATED_SelfServiceIntegrationsFilter
