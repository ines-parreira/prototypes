import {CustomFieldCondition} from '@gorgias/api-queries'
import classNames from 'classnames'
import React, {useMemo, useState} from 'react'
import {Link} from 'react-router-dom'
import {Container} from 'reactstrap'

import {logEvent, SegmentEvent} from 'common/segment'
import {OBJECT_TYPES} from 'custom-fields/constants'
import {useCustomFieldConditions} from 'custom-fields/hooks/queries/useCustomFieldConditions'
import useInjectStyleToCandu from 'hooks/candu/useInjectStyleToCandu'
import useCallbackRef from 'hooks/useCallbackRef'
import useDebouncedValue from 'hooks/useDebouncedValue'
import useTitle from 'hooks/useTitle'
import Alert, {AlertType} from 'pages/common/components/Alert/Alert'
import Button from 'pages/common/components/button/Button'
import Loader from 'pages/common/components/Loader/Loader'
import PageHeader from 'pages/common/components/PageHeader'
import Search from 'pages/common/components/Search'
import HeaderCell from 'pages/common/components/table/cells/HeaderCell'
import TableBody from 'pages/common/components/table/TableBody'
import TableHead from 'pages/common/components/table/TableHead'
import TableWrapper from 'pages/common/components/table/TableWrapper'
import Video from 'pages/common/components/Video/Video'
import settingsCss from 'pages/settings/settings.less'

import {CUSTOM_FIELD_CONDITIONS_ROUTE} from 'routes/constants'

import ConditionalFieldRow from './components/ConditionalFieldRow'
import css from './ConditionalFields.less'

export const MAX_CONDITIONS = 70

export default function ConditionalFields() {
    useTitle('Conditional fields')
    const [listingNode, setListingNode] = useCallbackRef()
    const [landingNode, setLandingNode] = useCallbackRef()

    useInjectStyleToCandu(listingNode)
    useInjectStyleToCandu(landingNode)

    const [search, setSearch] = useState('')
    const debouncedSearch = useDebouncedValue(search, 300)

    const {
        customFieldConditions: conditions,
        isLoading,
        isError,
    } = useCustomFieldConditions({
        objectType: OBJECT_TYPES.TICKET,
        includeDeactivated: true,
        invalidate: false,
    })
    const isLimitReached = conditions.length >= MAX_CONDITIONS
    const isConditionsListEmpty = conditions.length === 0

    const filteredConditions = useMemo(() => {
        return conditions.filter((condition: CustomFieldCondition) =>
            condition.name.includes(debouncedSearch)
        )
    }, [conditions, debouncedSearch])
    const isConditionsListMatchingSearchEmpty =
        !isConditionsListEmpty &&
        !!debouncedSearch &&
        filteredConditions.length === 0

    return (
        <div className={`full-width overflow-auto ${css.pageContainer}`}>
            <div className={css.pageHeaderContainer}>
                <PageHeader title="Field Conditions">
                    {!isConditionsListEmpty && (
                        <div className={css.headerContainer}>
                            <Search
                                id="custom-fields-search"
                                name="custom-fields-search"
                                value={search}
                                onChange={setSearch}
                                placeholder="Search condition..."
                                className="mr-2"
                            />
                            <CreateCustomFieldConditionButton
                                isDisabled={isLimitReached}
                            />
                        </div>
                    )}
                </PageHeader>
                {!isConditionsListEmpty && (
                    <Container
                        fluid
                        className={classNames(
                            css.info,
                            settingsCss.pageContainer
                        )}
                    >
                        <div
                            ref={setListingNode}
                            data-candu-id="conditional-fields-listing-educational-material"
                            className="pr-4"
                        >
                            <p className="mb-3">
                                Set Field Conditions to control visibility and
                                requirements for Ticket Fields based on specific
                                factors like other field values or channels.
                            </p>
                            <a
                                className="d-block"
                                href="https://link.gorgias.com/ticket-fields-playbook-conditional"
                                rel="noopener noreferrer"
                                target="_blank"
                            >
                                <i className="material-icons">menu_book</i>{' '}
                                <span>Field Conditions playbook</span>
                            </a>
                        </div>
                        <div className="d-flex">
                            <Video
                                youtubeId="HFylY2x3T_Y"
                                legend="How to set up conditions?"
                            />
                        </div>
                    </Container>
                )}
            </div>
            {isLoading ? (
                <Loader minHeight="60px" data-testid="loader" />
            ) : isError ? (
                <div className="p-0">
                    <div className={css.emptyListTextWrapper}>
                        Unexpected error happened when trying to load existing
                        conditions. <br /> Please try again later.
                    </div>
                </div>
            ) : isConditionsListMatchingSearchEmpty ? (
                <div className="p-0">
                    <div className={css.emptyListTextWrapper}>
                        No results found.
                    </div>
                </div>
            ) : isConditionsListEmpty ? (
                <NoExistingConditions canduCallbackRef={setLandingNode} />
            ) : (
                <ExistingConditions
                    conditions={filteredConditions}
                    isLimitReached={isLimitReached}
                />
            )}
        </div>
    )
}

const NoExistingConditions = ({
    canduCallbackRef,
}: {
    canduCallbackRef: (element: HTMLElement | null) => void
}) => {
    return (
        <div className={css.emptyViewContainer}>
            <h2 className={css.emptyViewContainerHeader}>
                Get started with Conditional Fields
            </h2>
            <p className={css.emptyViewContainerText}>
                Create condition to display ticket fields.
            </p>
            <div
                ref={canduCallbackRef}
                data-candu-id="conditional-fields-landing-educational-material"
            />
            <CreateCustomFieldConditionButton />
        </div>
    )
}

const CreateCustomFieldConditionButton = ({
    isDisabled = false,
}: {
    isDisabled?: boolean
}) => {
    if (isDisabled) {
        return <Button isDisabled>Create Field</Button>
    }
    return (
        <Link
            to={`/app/settings/${CUSTOM_FIELD_CONDITIONS_ROUTE}/add`}
            onClick={() => {
                logEvent(SegmentEvent.CustomFieldCreateConditionClicked)
            }}
        >
            <Button>Create Condition</Button>
        </Link>
    )
}

const ExistingConditions = ({
    conditions,
    isLimitReached = false,
}: {
    conditions: CustomFieldCondition[]
    isLimitReached?: boolean
}) => {
    return (
        <div className="p-0">
            {isLimitReached && (
                <Alert type={AlertType.Info} icon className="m-4">
                    {`You can only have ${MAX_CONDITIONS}
                                    conditions at a time.`}
                </Alert>
            )}

            <TableWrapper>
                <TableHead>
                    <HeaderCell size="smallest" />
                    <HeaderCell className={css.headerCell}>
                        Condition Name
                    </HeaderCell>
                    <HeaderCell size="smallest" className={css.headerCell}>
                        Last Updated
                    </HeaderCell>
                    <HeaderCell size="smallest" />
                </TableHead>
                <TableBody>
                    {conditions.map((condition) => (
                        <ConditionalFieldRow
                            key={condition.id}
                            condition={condition}
                            canDuplicate={!isLimitReached}
                        />
                    ))}
                </TableBody>
            </TableWrapper>
        </div>
    )
}
