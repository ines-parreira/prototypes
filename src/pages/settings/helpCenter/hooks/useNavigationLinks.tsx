import React from 'react'
import {chain, uniqueId, defaults} from 'lodash'
import produce, {Draft} from 'immer'

import {
    NavigationLink,
    NavigationTranslation,
} from '../../../../models/helpCenter/types'
import {isUrl} from '../../../../utils'

type LinksState = Partial<NavigationTranslation>[]

type Options = {
    allowEmpty: boolean
}

const DEFAULT_OPTIONS = {
    allowEmpty: false,
}

function readLinksFromResponse(
    section: string,
    links: NavigationLink[]
): LinksState {
    return chain(links)
        .filter((link) => link.group === section)
        .orderBy(['position'])
        .map((link) => {
            if (link.translation) {
                return {
                    id: link.translation.navigation_link_id,
                    label: link.translation.label,
                    value: link.translation.value,
                }
            }
            return {}
        })
        .value()
}

export const useNavigationLinks = (
    section: string,
    response: NavigationLink[],
    options?: Options
) => {
    const [links, setLinks] = React.useState<LinksState>(
        readLinksFromResponse(section, response)
    )

    React.useEffect(() => {
        if (response.length > 0) {
            setLinks(readLinksFromResponse(section, response))
        }
    }, [response, section])

    const innerOptions = React.useMemo(
        () => defaults(options, DEFAULT_OPTIONS),
        [options]
    )

    const add = () => {
        setLinks(
            produce((draft: Draft<LinksState>) => {
                draft.push({
                    id: uniqueId('new-'),
                    label: '',
                    value: '',
                })
            })
        )
    }

    const remove = (id: number) => {
        setLinks(
            produce((draft: Draft<LinksState>) => {
                const index = links.findIndex((link) => link.id === id)
                draft.splice(index, 1)
            })
        )
    }

    const update = (value: string, id: number, key: string) => {
        setLinks(
            produce((draft: Draft<LinksState>) => {
                const index = links.findIndex((link) => link.id === id)
                draft[index] = {
                    ...draft[index],
                    [key]: value,
                }
            })
        )
    }

    const isListValid = () => {
        return links.every((link) => {
            if (innerOptions.allowEmpty) {
                return link.value ? isUrl(link.value) : true
            }

            // If we have a Title with no URL, list is not valid
            if (link.label && link.value === '') {
                return false
            }
            // If we have an URL with no Title, list is not valid
            if (link.label === '' && link.value) {
                return false
            }

            return link.value ? isUrl(link.value) : true
        })
    }

    const resetFields = () => {
        setLinks(readLinksFromResponse(section, response))
    }

    return {
        links,
        add,
        remove,
        update,
        isListValid,
        resetFields,
    }
}
