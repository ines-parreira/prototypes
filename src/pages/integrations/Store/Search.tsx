import React, {useCallback, useEffect, useState} from 'react'
import classnames from 'classnames'
import debounce from 'lodash/debounce'

import history from 'pages/history'
import useSearch from 'hooks/useSearch'
import useAppSelector from 'hooks/useAppSelector'
import {logEvent, SegmentEvent} from 'store/middlewares/segmentTracker'
import {getCurrentAccountState} from 'state/currentAccount/selectors'
import TextInput from 'pages/common/forms/input/TextInput'
import IconInput from 'pages/common/forms/input/IconInput'

import {SEARCH_URL_PARAM} from './constants'
import css from './Search.less'

const DEBOUNCE_DURATION = 200 //ms
const DEBOUNCE_TRACKING_DURATION = 800 //ms

function setSearch(searchValue: string) {
    if (searchValue === '') {
        history.replace('?')
    } else {
        history.replace(
            `?${SEARCH_URL_PARAM}=${encodeURIComponent(
                searchValue.toLocaleLowerCase().trim()
            )}`
        )
    }
}
const debouncedSetSearch = debounce(setSearch, DEBOUNCE_DURATION)

function trackSearch(searchValue: string, domain: string) {
    logEvent(SegmentEvent.IntegrationSearched, {
        search: searchValue,
        account_domain: domain,
    })
}
const debouncedTrackSearch = debounce(trackSearch, DEBOUNCE_TRACKING_DURATION)

export default function Search() {
    const domain = useAppSelector(getCurrentAccountState).get('domain')
    const search = useSearch<{[SEARCH_URL_PARAM]: string}>()
    const searchParam = search[SEARCH_URL_PARAM]
    const [inputValue, setInputValue] = useState(searchParam || '')

    useEffect(() => {
        if (!searchParam) setInputValue('')
    }, [searchParam])

    const handleChange = useCallback(
        (newValue) => {
            setInputValue(newValue)
            debouncedSetSearch(newValue)
            debouncedTrackSearch(newValue, domain)
        },
        [domain]
    )

    return (
        <TextInput
            value={inputValue}
            placeholder="Search for an app"
            onChange={handleChange}
            prefix={<IconInput icon="search" />}
            className={css.search}
            suffix={
                <IconInput
                    icon="cancel"
                    className={classnames(
                        'material-icons-outlined',
                        css.clear,
                        {
                            [css.hidden]: !inputValue,
                        }
                    )}
                    onClick={() => setSearch('')}
                />
            }
        />
    )
}
