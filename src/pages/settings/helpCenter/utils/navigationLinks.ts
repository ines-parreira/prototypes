import {HelpCenterClient} from '../../../../../../../rest_api/help_center_api'

import {
    LocaleCode,
    NavigationLinkDto,
    LocalNavigationLink,
    LocalSocialNavigationLink,
    NavigationLinkMeta,
} from '../../../../models/helpCenter/types'

export async function saveSocialLinks(
    client: HelpCenterClient,
    localLinks: LocalSocialNavigationLink[],
    context: {
        helpCenterId: number
        locale: LocaleCode
    }
): Promise<void> {
    const promises = localLinks.map((socialLink) => {
        if (socialLink.value === '' && socialLink.id >= 0) {
            return client.deleteNavigationLink({
                help_center_id: context.helpCenterId,
                id: socialLink.id,
            })
        }

        if (socialLink.updated_datetime === 'now') {
            const group = 'footer'
            const meta: NavigationLinkMeta = {
                network: socialLink.meta?.network,
            }

            if (socialLink.id >= 0) {
                return client.updateNavigationLink(
                    {
                        help_center_id: context.helpCenterId,
                        id: socialLink.id,
                    },
                    {
                        label: socialLink.label,
                        value: socialLink.value,
                    }
                )
            }

            return client.createNavigationLink(
                {
                    help_center_id: context.helpCenterId,
                },
                {
                    label: socialLink.label,
                    value: socialLink.value,
                    locale: context.locale,
                    group,
                    meta,
                }
            )
        }
        return null
    })

    await Promise.all(promises)
}

export async function saveNavigationLinks(
    client: HelpCenterClient,
    remoteLinks: NavigationLinkDto[],
    localLinks: LocalNavigationLink[],
    context: {
        group: 'header' | 'footer'
        helpCenterId: number
        locale: LocaleCode
    }
): Promise<void> {
    const localLinksIds = localLinks.map((link) => link.id)
    const remoteLinksIds = remoteLinks
        .filter((link) => link.group === context.group)
        .map((link) => link.id)

    const linkIdsToDelete = remoteLinksIds.filter(
        (linkId) => !localLinksIds.includes(linkId)
    )

    const linksToCreate = localLinks.filter(
        (link) =>
            link.created_datetime === 'now' && !remoteLinksIds.includes(link.id)
    )

    const linksToUpdate = localLinks.filter(
        (link) =>
            link.updated_datetime === 'now' && link.created_datetime !== 'now'
    )

    const promises: Promise<any>[] = []

    if (linkIdsToDelete.length > 0) {
        linkIdsToDelete.forEach((linkId) => {
            promises.push(
                client.deleteNavigationLink({
                    help_center_id: context.helpCenterId,
                    id: linkId,
                })
            )
        })
    }

    if (linksToCreate.length > 0) {
        linksToCreate.forEach((link) => {
            promises.push(
                client.createNavigationLink(
                    {
                        help_center_id: context.helpCenterId,
                    },
                    {
                        label: link.label,
                        value: link.value,
                        locale: context.locale,
                        group: context.group,
                    }
                )
            )
        })
    }

    if (linksToUpdate.length > 0) {
        linksToUpdate.forEach((link) => {
            promises.push(
                client.updateNavigationLink(
                    {
                        help_center_id: context.helpCenterId,
                        id: link.id,
                    },
                    {
                        label: link.label,
                        value: link.value,
                    }
                )
            )
        })
    }

    await Promise.all(promises)
}
