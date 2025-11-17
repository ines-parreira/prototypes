import { useCallback, useMemo } from 'react'

import type {
    CallExpression as ESCallExpression,
    Expression,
    Identifier,
    LogicalExpression,
    LogicalOperator,
} from 'estree'
import type { List, Map, Seq } from 'immutable'
import { fromJS } from 'immutable'
import _get from 'lodash/get'
import _pickBy from 'lodash/pickBy'
import type { ConnectedProps } from 'react-redux'
import { connect } from 'react-redux'

import { LegacyBadge as Badge } from '@gorgias/axiom'
import type { StoreMapping } from '@gorgias/helpdesk-queries'
import { useGetStoreMappingsByAccountId } from '@gorgias/helpdesk-queries'

import { BASIC_OPERATORS, UNARY_OPERATORS } from 'config'
import { OBJECT_PATHS } from 'custom-fields/constants'
import type { RootState } from 'state/types'
import type { updateFieldFilter } from 'state/views/actions'
import * as viewsSelectors from 'state/views/selectors'
import { fieldPath, findProperty } from 'utils'

import useCustomFieldsFilters from './hooks/useCustomFieldsFilters'
import useQAScoreFilters from './hooks/useQAScoreFilters'
import Left from './Left'
import { Operator } from './Operator'
import { OperatorLabel } from './OperatorLabel'
import { RemoveCallExpression } from './RemoveCallExpression'
import Right from './Right'
import type { OperatorType } from './types'
import { getCustomFieldOperators, resolveObjectPath } from './utils'

import css from './CallExpression.less'

type OwnProps = {
    node: ESCallExpression
    view: Map<any, any>
    schemas: Map<any, any>
    index: number
    removeCondition: (index: number) => void
    updateOperator: (index: number, value: string) => void
    agents: List<any>
    teams: List<Map<any, any>> | Seq.Indexed<Map<any, any>>
    updateFieldFilter: typeof updateFieldFilter
    parentNode: LogicalExpression
}

type Props = OwnProps & ConnectedProps<typeof connector>

export const CallExpression = ({
    config,
    view,
    node,
    updateOperator,
    removeCondition,
    index,
    agents,
    teams,
    parentNode,
    schemas,
    updateFieldFilter,
}: Props) => {
    const getOperators = useCallback(
        (objectPath: string): Record<string, OperatorType> => {
            const property = findProperty(objectPath, schemas)

            if (property && property.meta) {
                let operators = {
                    ...(_get(property.meta, 'operators') as Record<
                        string,
                        unknown
                    >),
                    ...(_get(
                        property.meta,
                        'views.additional_operators',
                        {},
                    ) as Record<string, OperatorType>),
                }

                const excludedOperators = _get(
                    property.meta,
                    'views.excluded_operators',
                    {},
                ) as Record<string, OperatorType>

                if (excludedOperators) {
                    operators = _pickBy(
                        operators,
                        (_, key) =>
                            !Object.keys(excludedOperators).includes(key),
                    )
                }

                return operators as Record<string, OperatorType>
            }

            return BASIC_OPERATORS
        },
        [schemas],
    )

    const [left, right] = node.arguments as Expression[]

    const operator = node.callee as Identifier

    const objectPath = resolveObjectPath(left)

    const isCustomFieldPath = objectPath.includes('custom_fields')
    const isCustomerFieldPath =
        isCustomFieldPath && objectPath.includes(OBJECT_PATHS.CUSTOMER)
    const isQaScoreFieldPath = objectPath.includes('qa_score_dimensions')
    const fields: List<any> = config.get('fields', fromJS([]))
    const field = fields.find(
        (field: Map<any, any>) =>
            objectPath === `${config.get('singular')}.${fieldPath(field)}` ||
            (isCustomerFieldPath &&
                fieldPath(field) === OBJECT_PATHS.CUSTOMER) ||
            (isCustomFieldPath && fieldPath(field) === OBJECT_PATHS.TICKET) ||
            (isQaScoreFieldPath && fieldPath(field) === 'qa_score_dimensions'),
    )

    const { customField, onCustomFieldChange } = useCustomFieldsFilters({
        objectPath,
        index,
        schemas,
    })

    const { onQAScoreDimensionFieldChange } = useQAScoreFilters({
        index,
        objectPath,
    })

    const operators = useMemo(() => {
        if (isCustomFieldPath) {
            return getCustomFieldOperators(schemas, customField)
        }

        if (isQaScoreFieldPath) {
            return getOperators('ticket.qa_score_dimensions')
        }
        return getOperators(objectPath)
    }, [
        objectPath,
        schemas,
        customField,
        isCustomFieldPath,
        isQaScoreFieldPath,
        getOperators,
    ])

    // useGetStoreMappingsByAccountId seems to return the wrong type assuming stores.data is already StoreMapping[]
    const { data: stores } = useGetStoreMappingsByAccountId<{
        data: {
            data: StoreMapping[]
        }
    }>({
        query: {
            staleTime: 60_000, // 1 minute
        },
    })

    const storeMappings = useMemo(() => stores?.data?.data || [], [stores])

    return (
        <div className={css.component}>
            {index > 0 && (
                <OperatorLabel
                    operator={
                        parentNode.operator as Exclude<LogicalOperator, '??'>
                    }
                />
            )}
            <Left
                objectPath={objectPath}
                view={view}
                onCustomFieldChange={onCustomFieldChange}
                onQAScoreDimensionFieldChange={onQAScoreDimensionFieldChange}
            />
            <Operator
                operators={operators}
                selected={operator.name}
                index={index}
                onChange={updateOperator}
            />
            <Right
                operator={operator}
                node={right}
                objectPath={objectPath}
                agents={agents}
                teams={teams}
                updateFieldFilter={updateFieldFilter}
                index={index}
                config={config}
                field={field}
                empty={Object.keys(UNARY_OPERATORS).includes(operator.name)}
                storeMappings={storeMappings}
            />
            {!field && <Badge type={'error'}>System condition</Badge>}
            <RemoveCallExpression onClick={removeCondition} index={index} />
        </div>
    )
}

const connector = connect((state: RootState) => {
    return {
        config: viewsSelectors.getActiveViewConfig(state),
    }
})

export default connector(CallExpression)
