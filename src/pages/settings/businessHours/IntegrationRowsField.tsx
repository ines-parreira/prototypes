import { CheckBoxField } from '@gorgias/merchant-ui-kit'

import { Icon } from 'AlertBanners/components/Icon'
import { AlertBannerTypes } from 'AlertBanners/types'
import { IntegrationType } from 'models/integration/constants'
import StoreDisplayName from 'pages/common/components/StoreDisplayName'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'

import BusinessHoursDisplay from './BusinessHoursDisplay'
import CustomBusinessHoursIntegrationCell from './CustomBusinessHoursIntegrationCell'

import css from './CustomBusinessHoursIntegrationsTable.less'

type Props = {
    onChange: (value: number[]) => void
    value: number[]
    onItemClick: () => void
    numItems: number
}

export default function IntegrationRowsField({
    onChange,
    value,
    onItemClick,
    numItems,
}: Props) {
    const handleClick = (itemIndex: number) => {
        onChange(
            value.includes(itemIndex)
                ? value.filter((v) => v !== itemIndex)
                : [...value, itemIndex],
        )
        onItemClick?.()
    }

    return (
        <>
            {Array.from({ length: numItems }).map((_, index) => (
                // TODO replace index with integration id
                <TableBodyRow key={index} onClick={() => handleClick(index)}>
                    <BodyCell>
                        <CheckBoxField value={value.includes(index)} />
                    </BodyCell>
                    <BodyCell>
                        <Icon type={AlertBannerTypes.Warning} />
                    </BodyCell>
                    <BodyCell className={css.integrationNameColumn}>
                        <CustomBusinessHoursIntegrationCell
                            name="Customer service"
                            address="+1 000-306-8834"
                            type={IntegrationType.Phone}
                        />
                    </BodyCell>
                    <BodyCell className={css.storeNameColumn}>
                        <StoreDisplayName
                            name="Store Name"
                            type={IntegrationType.Shopify}
                        />
                    </BodyCell>
                    <BodyCell className={css.businessHoursColumn}>
                        <BusinessHoursDisplay />
                    </BodyCell>
                </TableBodyRow>
            ))}
        </>
    )
}
