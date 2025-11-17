import { FeatureFlagKey } from '@repo/feature-flags'

import type { ContextBanner } from 'AlertBanners'
import { AlertBannerTypes, BannerCategories, useBanners } from 'AlertBanners'
import { useFlag } from 'core/flags'
import useAppSelector from 'hooks/useAppSelector'
import { IntegrationType } from 'models/integration/constants'
import useStoresRequiringScriptTagMigration from 'pages/common/components/ScriptTagMigrationBanner/hooks/useStoresRequiringScriptTagMigration'
import { getCurrentUser } from 'state/currentUser/selectors'
import { makeGetRedirectUri } from 'state/integrations/selectors'
import { isAdmin } from 'utils'

export function useScriptTagMigrationBanner() {
    const { addBanner, removeBanner } = useBanners()

    const bannerList: Record<string, boolean> = useFlag(
        FeatureFlagKey.GlobalBannerRefactor,
        {
            scriptTagMigrationBanner: false,
        },
    )

    const migrationDueDate: string = useFlag(
        FeatureFlagKey.ChatScopeUpdateDueDate,
        '',
    )

    const showMigrationBanner: boolean = useFlag(
        FeatureFlagKey.ChatScopeUpdateBanner,
        false,
    )

    const reinstallsOnShopifyCallback: boolean = useFlag(
        FeatureFlagKey.ChatScopeReinstallOnShopifyCallback,
        false,
    )

    const getRedirectUri = useAppSelector(makeGetRedirectUri)
    const currentUser = useAppSelector(getCurrentUser)
    const storesRequiringScriptTagMigration =
        useStoresRequiringScriptTagMigration()

    if (
        !bannerList?.scriptTagMigrationBanner ||
        !storesRequiringScriptTagMigration ||
        !storesRequiringScriptTagMigration.length
    ) {
        return null
    }

    const storesRequiringPermissionUpdates =
        storesRequiringScriptTagMigration.filter(
            ({ storeRequiresPermissionUpdates }) =>
                storeRequiresPermissionUpdates,
        )

    const gorgiasChatsRequiringReinstall =
        storesRequiringScriptTagMigration.filter(
            ({ gorgiasChatRequiresReinstall }) => gorgiasChatRequiresReinstall,
        )

    const redirectUri = getRedirectUri(IntegrationType.Shopify)

    const shopName = storesRequiringPermissionUpdates.length
        ? storesRequiringPermissionUpdates[0].storeIntegration?.meta?.shop_name
        : ''

    const retriggerOAuthFlow = (ev: React.MouseEvent<HTMLElement>) => {
        ev.preventDefault()
        window.location.href = redirectUri.replace('{shop_name}', shopName)
    }

    const reInstallLink =
        gorgiasChatsRequiringReinstall.length > 1
            ? '/app/settings/channels/gorgias_chat'
            : `/app/settings/channels/gorgias_chat/${
                  gorgiasChatsRequiringReinstall[0]?.gorgiasChatIntegration?.get(
                      'id',
                  ) as string
              }/installation`

    const banner: ContextBanner = {
        category: BannerCategories.SCRIPT_TAG_MIGRATION,
        type: AlertBannerTypes.Critical,
        instanceId: 'alert-banner-script-tag-migration',
        message: `
        <b>Action required</b>:
        ${
            storesRequiringPermissionUpdates.length
                ? `
            ${
                storesRequiringPermissionUpdates.length > 1
                    ? `<a href="/app/settings/channels/gorgias_chat">Update your Shopify permissions</a>`
                    : `<a href="#" onclick="(${retriggerOAuthFlow.toString()})()">Update your Shopify permissions</a>`
            }
        `
                : ''
        }
        ${storesRequiringPermissionUpdates.length && gorgiasChatsRequiringReinstall.length ? ' and ' : ''}
        ${
            gorgiasChatsRequiringReinstall.length
                ? `
            <span class="${!storesRequiringPermissionUpdates.length ? 'text-capitalize' : ''}">
                re-install
            </span>
            your chat using the
            ${
                reinstallsOnShopifyCallback &&
                storesRequiringPermissionUpdates.length
                    ? '1-click install method'
                    : `<a href="${reInstallLink}">1-click install method</a>`
            }
        `
                : ''
        }
        to ensure better chat stability by <b>${migrationDueDate}</b>.
    `,
    }

    const shouldShowBanner =
        showMigrationBanner &&
        migrationDueDate &&
        isAdmin(currentUser) &&
        (storesRequiringPermissionUpdates.length > 0 ||
            gorgiasChatsRequiringReinstall.length > 0)

    shouldShowBanner
        ? addBanner(banner)
        : removeBanner(banner.category, banner.instanceId)
}
