import {useListSlaPolicies} from '@gorgias/api-queries'
import classnames from 'classnames'
import React, {useCallback, useRef, useState} from 'react'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import useAppSelector from 'hooks/useAppSelector'
import useAppDispatch from 'hooks/useAppDispatch'
import DropdownQuickSelect from 'pages/common/components/dropdown/DropdownQuickSelect'
import Button from 'pages/common/components/button/Button'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import Skeleton from 'pages/common/components/Skeleton/Skeleton'
import css from 'pages/stats/CustomFieldSelect.less'
import {mergeStatsFilters} from 'state/stats/actions'
import {getSLAPoliciesStatsFilter} from 'state/stats/selectors'
import {statFiltersClean, statFiltersDirty} from 'state/ui/stats/actions'

export const SELECT_FIELD_LABEL = 'Select Policies'

export const SLAPolicySelect = () => {
    const [isOpen, setIsOpen] = useState(false)
    const buttonRef = useRef(null)

    const {data, isLoading} = useListSlaPolicies()
    const policies = data?.data.data || []
    const policyIds = policies?.map((policy) => policy.uuid)

    const dispatch = useAppDispatch()
    const selectedPolicies = useAppSelector(getSLAPoliciesStatsFilter)

    const handleToggle = useCallback(() => {
        dispatch(statFiltersClean())
        setIsOpen(!isOpen)
    }, [dispatch, isOpen])

    const handleClick = useCallback(
        (policyId: string) => {
            dispatch(statFiltersDirty())
            if (selectedPolicies.includes(policyId)) {
                const policies = [...selectedPolicies]
                policies.splice(selectedPolicies.indexOf(policyId), 1)

                dispatch(
                    mergeStatsFilters({
                        slaPolicies: [...policies],
                    })
                )
            } else {
                dispatch(
                    mergeStatsFilters({
                        slaPolicies: [...selectedPolicies, policyId],
                    })
                )
            }
        },
        [dispatch, selectedPolicies]
    )

    const onSelectAll = useCallback(() => {
        dispatch(statFiltersDirty())
        dispatch(
            mergeStatsFilters({
                slaPolicies: [...policyIds],
            })
        )
    }, [dispatch, policyIds])

    const onRemoveAll = useCallback(() => {
        dispatch(statFiltersDirty())
        dispatch(
            mergeStatsFilters({
                slaPolicies: [],
            })
        )
    }, [dispatch])

    return isLoading ? (
        <Skeleton inline width={160} />
    ) : (
        <div className={css.wrapper}>
            <Button
                onClick={() => setIsOpen(!isOpen)}
                ref={buttonRef}
                intent={'secondary'}
                className={css.button}
            >
                <span className={css.buttonText}>{SELECT_FIELD_LABEL}</span>
                <i className={'material-icons'}>arrow_drop_down</i>
            </Button>

            <Dropdown
                isOpen={isOpen}
                onToggle={handleToggle}
                target={buttonRef}
                value={selectedPolicies}
                isMultiple={true}
            >
                <DropdownQuickSelect
                    onRemoveAll={onRemoveAll}
                    onSelectAll={onSelectAll}
                    values={policyIds}
                    count={policies.length}
                />
                <DropdownBody>
                    {policies?.map((policy) => (
                        <DropdownItem
                            key={policy.uuid}
                            className={classnames(css.dropdownItem)}
                            onClick={handleClick}
                            option={{value: policy.uuid, label: policy.name}}
                        >
                            <span className={css.dropdownItemContent}>
                                {policy.name}
                            </span>
                        </DropdownItem>
                    ))}
                </DropdownBody>
            </Dropdown>
        </div>
    )
}
