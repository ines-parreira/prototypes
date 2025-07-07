import { noop } from 'lodash'

import { CheckBoxField, Skeleton } from '@gorgias/merchant-ui-kit'

import { FormField } from 'core/forms'
import Navigation from 'pages/common/components/Navigation/Navigation'
import SectionHeader from 'pages/common/components/SectionHeader/SectionHeader'
import BodyCell from 'pages/common/components/table/cells/BodyCell'
import HeaderCell from 'pages/common/components/table/cells/HeaderCell'
import TableBody from 'pages/common/components/table/TableBody'
import TableBodyRow from 'pages/common/components/table/TableBodyRow'
import TableHead from 'pages/common/components/table/TableHead'
import TableWrapper from 'pages/common/components/table/TableWrapper'

import IntegrationRowsField from './IntegrationRowsField'

import css from './CustomBusinessHoursIntegrationsTable.less'

type Props = {
    isLoading?: boolean
}

export default function CustomBusinessHoursIntegrationsTable({
    isLoading = false,
}: Props) {
    return (
        <div>
            <SectionHeader
                title="Integrations"
                description="Assign one or multiple integrations for your custom business hours."
            />
            <TableWrapper className={css.table}>
                <TableHead>
                    <HeaderCell size="smallest">
                        <FormField
                            name="assigned_integrations.assign_all"
                            field={CheckBoxField}
                            aria-label="Select all integrations"
                            isDisabled={isLoading}
                        />
                    </HeaderCell>
                    <HeaderCell size="smallest"></HeaderCell>
                    <HeaderCell
                        size="normal"
                        className={css.integrationNameColumn}
                    >
                        Integration
                    </HeaderCell>
                    <HeaderCell size="normal" className={css.storeNameColumn}>
                        Store
                    </HeaderCell>
                    <HeaderCell
                        size="normal"
                        className={css.businessHoursColumn}
                    >
                        Business hours
                    </HeaderCell>
                </TableHead>
                <TableBody>
                    {isLoading ? (
                        <RowSkeleton />
                    ) : (
                        <FormField
                            name="assigned_integrations.assign_integrations"
                            field={IntegrationRowsField}
                            onItemClick={noop}
                            numItems={5}
                        />
                    )}
                </TableBody>
                {!isLoading && (
                    <Navigation
                        className={css.pagination}
                        hasNextItems={true}
                        hasPrevItems={false}
                        fetchNextItems={noop}
                        fetchPrevItems={noop}
                    />
                )}
            </TableWrapper>
        </div>
    )
}

const RowSkeleton = () => {
    return (
        <TableBodyRow>
            <BodyCell>
                <CheckBoxField isDisabled value={false} />
            </BodyCell>
            <BodyCell />
            <BodyCell className={css.integrationNameColumn}>
                <Skeleton width={208} />
            </BodyCell>
            <BodyCell className={css.storeNameColumn}>
                <Skeleton width={208} />
            </BodyCell>
            <BodyCell className={css.businessHoursColumn}>
                <Skeleton width={288} />
            </BodyCell>
        </TableBodyRow>
    )
}
