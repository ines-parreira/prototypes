import {HelpCenterClient} from '../../../../../../../rest_api/help_center_api'

import {
    LocaleCode,
    NavigationLinkDto,
    LocalNavigationLink,
    LocalSocialNavigationLink,
    NavigationLinkMeta,
    CreateNavigationLinkDto,
} from '../../../../models/helpCenter/types'

export function saveSocialLinks(
    client: HelpCenterClient,
    localLinks: LocalSocialNavigationLink[],
    context: {
        helpcenterId: number
        locale: LocaleCode
    }
): Promise<any> {
    const promises = localLinks.map((socialLink) => {
        if (socialLink.translation.value === '' && socialLink.id >= 0) {
            return client?.deleteNavigationLink({
                help_center_id: context.helpcenterId,
                id: socialLink.id,
            })
        }

        if (socialLink.translation.updated_datetime === 'now') {
            const group = 'footer'
            const meta: NavigationLinkMeta = {
                network: socialLink.meta.network,
            }

            if (socialLink.id >= 0) {
                return client.updateNavigationLinkTranslation(
                    {
                        help_center_id: context.helpcenterId,
                        navigation_link_id: socialLink.id,
                        locale: context.locale,
                    },
                    {
                        label: socialLink.translation.label,
                        value: socialLink.translation.value,
                    }
                )
            }

            return client.createNavigationLink(
                {
                    help_center_id: context.helpcenterId,
                },
                {
                    group,
                    meta,
                    translation: {
                        locale: context.locale,
                        label: socialLink.translation.label,
                        value: socialLink.translation.value,
                    },
                }
            )
        }
        return null
    })

    return Promise.all(promises)
}

export function saveNavigationLinks(
    client: HelpCenterClient,
    remoteLinks: NavigationLinkDto[],
    localLinks: LocalNavigationLink[],
    context: {
        group: 'header' | 'footer'
        helpcenterId: number
        locale: LocaleCode
    }
): Promise<any> {
    const localLinksId = localLinks.map((link) => link.id)
    const remoteLinksId = remoteLinks
        .filter((link) => link.group === context.group)
        .map((link) => link.id)

    const idLinksToDelete = remoteLinksId.filter(
        (linkId) => !localLinksId.includes(linkId)
    )

    const linksToCreate = localLinks.filter(
        (link) =>
            link.translation.created_datetime === 'now' &&
            !remoteLinksId.includes(link.id)
    )

    const linksToUpdate = localLinks.filter(
        (link) =>
            link.translation.updated_datetime === 'now' &&
            link.translation.created_datetime !== 'now'
    )

    const promises: Promise<any>[] = []

    if (idLinksToDelete.length > 0) {
        idLinksToDelete.forEach((linkId) => {
            promises.push(
                client?.deleteNavigationLink({
                    help_center_id: context.helpcenterId,
                    id: linkId,
                })
            )
        })
    }

    if (linksToCreate.length > 0) {
        linksToCreate.forEach((link) => {
            const payload: CreateNavigationLinkDto = {
                group: context.group,
                translation: {
                    locale: context.locale,
                    label: link.translation.label,
                    value: link.translation.value,
                },
            }

            promises.push(
                client?.createNavigationLink(
                    {
                        help_center_id: context.helpcenterId,
                    },
                    payload
                )
            )
        })
    }

    if (linksToUpdate.length > 0) {
        linksToUpdate.forEach((link) => {
            promises.push(
                client.updateNavigationLinkTranslation(
                    {
                        help_center_id: context.helpcenterId,
                        navigation_link_id: link.id,
                        locale: context.locale,
                    },
                    {
                        label: link.translation.label,
                        value: link.translation.value,
                    }
                )
            )
        })
    }

    return Promise.all(promises)
}
