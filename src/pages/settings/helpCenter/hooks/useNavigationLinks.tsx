import {useEffect, useMemo, useState} from 'react'
import produce, {Draft} from 'immer'
import {chain as _chain} from 'lodash'
import _defaults from 'lodash/defaults'
import isUrl from 'validator/lib/isURL'

import {
    LocaleCode,
    LocalNavigationLink,
    LocalSocialNavigationLink,
    NavigationLinkDto,
    NavigationLinkGroup,
} from '../../../../models/helpCenter/types'
import {isURLOptions} from '../utils/navigationLinks'

type Options = {
    allowEmpty: boolean
}

const DEFAULT_OPTIONS = {
    allowEmpty: false,
}

function decorateLocaleLinks(
    group: NavigationLinkGroup,
    links: NavigationLinkDto[]
): LocalNavigationLink[] {
    return _chain(links)
        .filter((link) => link.group === group)
        .orderBy(['position'])
        .map<LocalNavigationLink>((link) => {
            return {
                id: link.id,
                label: link.label,
                value: link.value,
                locale: link.locale,
                group: link.group,
                created_datetime: link.created_datetime,
                updated_datetime: link.updated_datetime,
                key: `${link.id}-${link.label}-${link.locale}`,
            }
        })
        .value()
}

function draftRemoveLink<
    T extends LocalNavigationLink | LocalSocialNavigationLink
>(state: T[], id: number) {
    return produce(state, (draft: Draft<T[]>) => {
        const index = state.findIndex((link) => link.id === id)
        draft.splice(index, 1)
    })
}

function draftUpdateLink<
    T extends LocalNavigationLink | LocalSocialNavigationLink
>(links: T[], value: string, id: number, key: 'label' | 'value') {
    return produce(links, (draft) => {
        const index = links.findIndex((link) => link.id === id)

        draft[index][key] = value
        draft[index].updated_datetime = 'now'
    })
}

function isListValid<T extends LocalNavigationLink | LocalSocialNavigationLink>(
    links: T[],
    options: Options
): boolean {
    return links.every((link) => {
        if (options.allowEmpty) {
            return link.value ? isUrl(link.value, isURLOptions) : true
        }

        // If we have a Title with no URL, list is not valid
        if (link.label && link.value === '') {
            return false
        }
        // If we have an URL with no Title, list is not valid
        if (link.label === '' && link.value) {
            return false
        }

        return link.value ? isUrl(link.value, isURLOptions) : true
    })
}

export const useNavigationLinks = (
    group: NavigationLinkGroup,
    response: NavigationLinkDto[],
    options?: Options
): {
    links: LocalNavigationLink[]
    add: (locale: LocaleCode) => void
    remove: (id: number) => void
    update: (value: string, id: number, key: 'label' | 'value') => void
    isListValid: () => boolean
    resetFields: () => void
} => {
    const [links, setLinks] = useState<LocalNavigationLink[]>(
        decorateLocaleLinks(group, response)
    )

    useEffect(() => {
        setLinks(decorateLocaleLinks(group, response))
    }, [response, group])

    const innerOptions = useMemo(() => _defaults(options, DEFAULT_OPTIONS), [
        options,
    ])

    const add = (locale: LocaleCode) => {
        setLinks(
            produce((draft: Draft<LocalNavigationLink[]>) => {
                const id = links.reduce((sum, link) => link.id + sum, 1)

                draft.push({
                    id,
                    label: '',
                    value: '',
                    locale,
                    group,
                    created_datetime: 'now',
                    updated_datetime: '',
                    key: `${id}-new-${locale}`,
                })
            })
        )
    }

    const remove = (id: number) => {
        setLinks(draftRemoveLink<LocalNavigationLink>(links, id))
    }

    const update = (value: string, id: number, key: 'label' | 'value') => {
        setLinks(draftUpdateLink(links, value, id, key))
    }

    const resetFields = () => {
        setLinks(decorateLocaleLinks(group, response))
    }

    return {
        links,
        add,
        remove,
        update,
        isListValid: () => isListValid(links, innerOptions),
        resetFields,
    }
}

export const useSocialNavigationLinks = (
    response: LocalSocialNavigationLink[],
    options?: Options
): {
    links: LocalSocialNavigationLink[]
    remove: (id: number) => void
    update: (value: string, id: number, key: 'label' | 'value') => void
    isListValid: () => boolean
    resetFields: () => void
} => {
    const [links, setLinks] = useState<LocalSocialNavigationLink[]>(response)

    useEffect(() => {
        if (response.length > 0) {
            setLinks(response)
        }
    }, [response])

    const innerOptions = useMemo(() => _defaults(options, DEFAULT_OPTIONS), [
        options,
    ])

    const remove = (id: number) => {
        setLinks(draftRemoveLink<LocalSocialNavigationLink>(links, id))
    }

    const update = (value: string, id: number, key: 'label' | 'value') => {
        setLinks(draftUpdateLink(links, value, id, key))
    }

    const resetFields = () => {
        setLinks(response)
    }

    return {
        links,
        remove,
        update,
        isListValid: () => isListValid(links, innerOptions),
        resetFields,
    }
}
