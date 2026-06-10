import React, { useCallback, useEffect, useState } from 'react'
import { Duration } from '@gorgias/toolkit'

import { logEvent, SegmentEvent } from '@repo/logging'
import classnames from 'classnames'
import { useHistory } from 'react-router-dom'
import { useDebouncedCallback } from '@gorgias/toolkit-react'

import useAppSelector from 'hooks/useAppSelector'
import { useSearch } from 'hooks/useSearch'
import IconInput from 'pages/common/forms/input/IconInput'
import TextInput from 'pages/common/forms/input/TextInput'
import { getCurrentAccountState } from 'state/currentAccount/selectors'

import { SEARCH_URL_PARAM } from './constants'

import css from './Search.less'

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
        Duration.millis(200),
    )
    const debouncedTrackSearch = useDebouncedCallback(
        trackSearch,
        Duration.millis(800),
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
