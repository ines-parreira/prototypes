import React, {useState} from 'react'
import {Link} from 'react-router-dom'

import {logEvent, SegmentEvent} from 'common/segment'
import useInjectStyleToCandu from 'hooks/candu/useInjectStyleToCandu'
import useCallbackRef from 'hooks/useCallbackRef'
import useDebouncedValue from 'hooks/useDebouncedValue'
import useTitle from 'hooks/useTitle'
// import Alert, {AlertType} from 'pages/common/components/Alert/Alert'
import Button from 'pages/common/components/button/Button'
// import Loader from 'pages/common/components/Loader/Loader'
import PageHeader from 'pages/common/components/PageHeader'
import Search from 'pages/common/components/Search'

import {CUSTOM_FIELD_CONDITIONS_ROUTE} from 'routes/constants'

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

    // const isLoading = false
    const conditions: unknown[] = []

    const displayList = conditions.length || debouncedSearch

    const createConditionButton = (
        // conditions.length >= MAX_CONDITIONS ? (
        //     <Button isDisabled>Create Field</Button>
        // ) : (
        <Link
            to={`/app/settings/${CUSTOM_FIELD_CONDITIONS_ROUTE}/add`}
            onClick={() => {
                logEvent(SegmentEvent.CustomFieldCreateConditionClicked)
            }}
        >
            <Button>Create Condition</Button>
        </Link>
    )
    // )

    return (
        <div className={`full-width overflow-auto ${css.pageContainer}`}>
            <div className={css.pageHeaderContainer}>
                <PageHeader title="Field Conditions">
                    {displayList && (
                        <div className={css.headerContainer}>
                            <Search
                                id="custom-fields-search"
                                name="custom-fields-search"
                                value={search}
                                onChange={setSearch}
                                placeholder={`Search condition...`}
                                className="mr-2"
                            />
                            {createConditionButton}
                        </div>
                    )}
                </PageHeader>
                {displayList && (
                    <>
                        <div
                            ref={setListingNode}
                            data-candu-id="conditional-fields-listing-educational-material"
                        />
                    </>
                )}
            </div>

            {/* {isLoading ? (
                <Loader minHeight="60px" />
            ) : ( */}
            <>
                {!displayList ? (
                    <div className={css.emptyViewContainer}>
                        <h2 className={css.emptyViewContainerHeader}>
                            Get started with Conditional Fields
                        </h2>
                        <p className={css.emptyViewContainerText}>
                            Create condition to display ticket fields.
                        </p>
                        <div
                            ref={setLandingNode}
                            data-candu-id="conditional-fields-landing-educational-material"
                        />
                        {createConditionButton}
                    </div>
                ) : (
                    <div className="p-0">
                        {/* replace `conditions` with matched conditions */}
                        {debouncedSearch && !conditions.length ? (
                            <div className={css.emptyListTextWrapper}>
                                No results found.
                            </div>
                        ) : (
                            <>
                                {/* {conditions.length >= MAX_CONDITIONS && (
                                        <Alert
                                            type={AlertType.Info}
                                            icon
                                            className="m-4"
                                        >
                                            {`You can only have ${MAX_CONDITIONS}
                                                conditions at a time.`}
                                        </Alert>
                                    )} */}
                                {/* Display conditions list here */}
                            </>
                        )}
                    </div>
                )}
            </>
            {/* )} */}
        </div>
    )
}
