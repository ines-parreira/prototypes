import React, { useCallback, useEffect, useState } from 'react'

import { useDebouncedCallback } from '@repo/hooks'
import { logEvent, SegmentEvent } from '@repo/logging'
import classnames from 'classnames'
import { useHistory } from 'react-router-dom'

import useAppSelector from 'hooks/useAppSelector'
import { useSearch } from 'hooks/useSearch'
import IconInput from 'pages/common/forms/input/IconInput'
import TextInput from 'pages/common/forms/input/TextInput'
import { getCurrentAccountState } from 'state/currentAccount/selectors'

import { SEARCH_URL_PARAM } from './constants'

import css from './Search.less'

const DEBOUNCE_DURATION = 200 //ms
const DEBOUNCE_TRACKING_DURATION = 800 //ms

function getSearchUrl(searchValue: string) {
    return searchValue === ''
        ? '?'
        : `?${SEARCH_URL_PARAM}=${encodeURIComponent(
              searchValue.toLocaleLowerCase().trim(),
          )}`
}

function trackSearch(searchValue: string, domain: string) {
    logEvent(SegmentEvent.IntegrationSearched, {
        search: searchValue,
        account_domain: domain,
    })
}

export default function Search() {
    const history = useHistory()
    const domain = useAppSelector(getCurrentAccountState).get('domain')
    const search = useSearch<{ [SEARCH_URL_PARAM]: string }>()
    const searchParam = search[SEARCH_URL_PARAM]
    const [inputValue, setInputValue] = useState(searchParam || '')

    const replaceSearch = useCallback(
        (searchValue: string) => history.replace(getSearchUrl(searchValue)),
        [history],
    )
    const debouncedSetSearch = useDebouncedCallback(
        replaceSearch,
        DEBOUNCE_DURATION,
    )
    const debouncedTrackSearch = useDebouncedCallback(
        trackSearch,
        DEBOUNCE_TRACKING_DURATION,
    )

    useEffect(() => {
        if (!searchParam) setInputValue('')
    }, [searchParam])

    const handleChange = useCallback(
        (newValue: string) => {
            setInputValue(newValue)
            debouncedSetSearch(newValue)
            debouncedTrackSearch(newValue, domain)
        },
        [debouncedSetSearch, debouncedTrackSearch, domain],
    )

    const handleClear = useCallback(() => {
        setInputValue('')
        history.replace(getSearchUrl(''))
    }, [history])

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
                        },
                    )}
                    onClick={handleClear}
                />
            }
        />
    )
}
