import React, {useMemo} from 'react'

import TableHead from 'pages/common/components/table/TableHead'
import HeaderCellProperty from 'pages/common/components/table/cells/HeaderCellProperty'
import TableBody from 'pages/common/components/table/TableBody'
import TableWrapper from 'pages/common/components/table/TableWrapper'
import useOrderBy from 'hooks/useOrderBy'

import {GetAppFromTemplate} from '../hooks/useGetAppFromTemplate'
import {ActionTemplate} from '../types'
import ActionsPlatformTemplatesTableRow from './ActionsPlatformTemplatesTableRow'

type Props = {
    templates: Pick<
        ActionTemplate,
        'id' | 'apps' | 'name' | 'updated_datetime'
    >[]
    getAppFromTemplate: GetAppFromTemplate
}

const ActionsPlatformTemplatesTable = ({
    templates,
    getAppFromTemplate,
}: Props) => {
    const {orderDirection, orderBy, orderParam, toggleOrderBy} =
        useOrderBy<'updated_datetime'>('updated_datetime')

    const orderedTemplates = useMemo(() => {
        return [...templates].sort((a, b) => {
            const aUpdatedDatetime = new Date(a.updated_datetime)
            const bUpdatedDatetime = new Date(b.updated_datetime)

            switch (orderParam) {
                case 'updated_datetime:asc':
                    return aUpdatedDatetime > bUpdatedDatetime ? -1 : 1
                case null:
                case 'updated_datetime:desc':
                    return aUpdatedDatetime < bUpdatedDatetime ? -1 : 1
            }
        })
    }, [templates, orderParam])

    return (
        <TableWrapper>
            <TableHead>
                <HeaderCellProperty title="NAME" />
                <HeaderCellProperty
                    justifyContent="right"
                    title="LAST UPDATED"
                    direction={orderDirection}
                    isOrderedBy={orderBy === 'updated_datetime'}
                    onClick={() => {
                        toggleOrderBy('updated_datetime')
                    }}
                />
            </TableHead>
            <TableBody>
                {orderedTemplates.map((template) => (
                    <ActionsPlatformTemplatesTableRow
                        key={template.id}
                        template={template}
                        getAppFromTemplate={getAppFromTemplate}
                    />
                ))}
            </TableBody>
        </TableWrapper>
    )
}

export default ActionsPlatformTemplatesTable
