import React from 'react'
import {chain as _chain} from 'lodash'
import _defaults from 'lodash/defaults'
import produce, {Draft} from 'immer'
import isUrl from 'validator/lib/isURL'

import {
    // LinkTranslation,
    LocalNavigationLink,
    LocalSocialNavigationLink,
    NavigationLinkSections,
    LocaleCode,
    NavigationLinkDto,
} from '../../../../models/helpCenter/types'

type Options = {
    allowEmpty: boolean
}

const DEFAULT_OPTIONS = {
    allowEmpty: false,
}

function decorateLocaleLinks(
    section: NavigationLinkSections,
    links: NavigationLinkDto[]
): LocalNavigationLink[] {
    return _chain(links)
        .filter((link) => link.group === section)
        .orderBy(['position'])
        .map((link, index) => {
            if (link.translation) {
                return {
                    id: link.id,
                    group: link.group,
                    position: index,
                    key: `${link.id}-${link.translation.label}-${link.translation.locale}`,
                    translation: {
                        locale: link.translation.locale,
                        value: link.translation.value,
                        label: link.translation.label,
                        updated_datetime: link.translation.updated_datetime,
                        created_datetime: link.translation.created_datetime,
                        navigation_link_id: link.translation.navigation_link_id,
                    },
                }
            }
            throw Error('Missing translation')
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
        const translation = draft[index].translation

        translation[key] = value
        translation.updated_datetime = 'now'

        draft[index] = {
            ...draft[index],
            translation,
        }
    })
}

function isListValid<T extends LocalNavigationLink | LocalSocialNavigationLink>(
    links: T[],
    options: Options
): boolean {
    return links.every((link) => {
        if (options.allowEmpty) {
            return link.translation.value ? isUrl(link.translation.value) : true
        }

        // If we have a Title with no URL, list is not valid
        if (link.translation.label && link.translation.value === '') {
            return false
        }
        // If we have an URL with no Title, list is not valid
        if (link.translation.label === '' && link.translation.value) {
            return false
        }

        return link.translation.value ? isUrl(link.translation.value) : true
    })
}

export const useNavigationLinks = (
    section: NavigationLinkSections,
    response: NavigationLinkDto[],
    options?: Options
) => {
    const [links, setLinks] = React.useState<LocalNavigationLink[]>(
        decorateLocaleLinks(section, response)
    )

    React.useEffect(() => {
        setLinks(decorateLocaleLinks(section, response))
    }, [response, section])

    const innerOptions = React.useMemo(
        () => _defaults(options, DEFAULT_OPTIONS),
        [options]
    )

    const add = (locale: LocaleCode) => {
        setLinks(
            produce((draft: Draft<LocalNavigationLink[]>) => {
                const id = links.reduce((sum, link) => link.id + sum, 1)
                draft.push({
                    id,
                    group: section,
                    position: links.length,
                    key: `${id}-new-${locale}`,
                    translation: {
                        navigation_link_id: links.reduce(
                            (sum, link) => link.id + sum,
                            1
                        ),
                        created_datetime: 'now',
                        updated_datetime: '',
                        locale,
                        label: '',
                        value: '',
                    },
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
        setLinks(decorateLocaleLinks(section, response))
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
    section: NavigationLinkSections,
    response: LocalSocialNavigationLink[],
    options?: Options
) => {
    const [links, setLinks] = React.useState<LocalSocialNavigationLink[]>(
        response
    )

    React.useEffect(() => {
        if (response.length > 0) {
            setLinks(response)
        }
    }, [response, section])

    const innerOptions = React.useMemo(
        () => _defaults(options, DEFAULT_OPTIONS),
        [options]
    )

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
