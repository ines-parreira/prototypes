import { useHistory } from 'react-router-dom'

import { Banner, Link, Text } from '@gorgias/axiom'

import { useAudienceLists } from 'AIJourney/queries/useAudienceLists/useAudienceLists'
import {
    AudienceListSource,
    useAudienceSegments,
} from 'AIJourney/queries/useAudienceSegments/useAudienceSegments'

type Props = {
    integrationId: number | undefined
    settingsUrl: string
}

type Feature = 'lists' | 'segments'

type Copy = { title: string; description: string }

const buildCopy = (
    errors: { feature: Feature; scope: string | null | undefined }[],
): Copy | null => {
    if (errors.length === 0) return null

    const both = errors.length === 2
    const scopes = errors
        .map((e) => e.scope)
        .filter((s): s is string => Boolean(s))

    const titleSubject = both
        ? 'audiences'
        : errors[0].feature === 'lists'
          ? 'lists'
          : 'segments'

    const featureText = both
        ? 'Klaviyo lists and segments'
        : errors[0].feature === 'lists'
          ? 'Klaviyo lists'
          : 'Klaviyo segments'

    const scopeWord = both ? 'scopes' : 'scope'
    const demonstrative = both ? 'these scopes' : 'this scope'

    let scopeClause: string
    if (scopes.length === 0) {
        scopeClause = `the required ${scopeWord}`
    } else if (scopes.length === 1) {
        scopeClause = `the ${scopes[0]} ${scopeWord}`
    } else {
        scopeClause = `the ${scopes.join(' and ')} ${scopeWord}`
    }

    return {
        title: `Klaviyo ${titleSubject} are unavailable`,
        description: `Your Klaviyo API key is missing ${scopeClause}. Reconnect Klaviyo with ${demonstrative} to use ${featureText} here.`,
    }
}

export const KlaviyoPermissionBanner = ({
    integrationId,
    settingsUrl,
}: Props) => {
    const history = useHistory()

    const { data: audienceLists } = useAudienceLists(integrationId)
    const { data: klaviyoSegments } = useAudienceSegments(
        integrationId,
        AudienceListSource.Klaviyo,
    )

    const errors: { feature: Feature; scope: string | null | undefined }[] = []
    if (audienceLists?.permission_error) {
        errors.push({
            feature: 'lists',
            scope: audienceLists.permission_error.scope,
        })
    }
    if (klaviyoSegments?.permission_error) {
        errors.push({
            feature: 'segments',
            scope: klaviyoSegments.permission_error.scope,
        })
    }

    const copy = buildCopy(errors)
    if (!copy) return null

    return (
        <Banner
            intent="warning"
            icon="warning-triangle"
            isClosable={false}
            title={copy.title}
            description={
                <Text size="sm" wrap="wrap">
                    {copy.description}
                </Text>
            }
            size="md"
        >
            <Link
                size="sm"
                trailingSlot="external-link"
                onClick={() => history.push(settingsUrl)}
            >
                Open Klaviyo settings
            </Link>
        </Banner>
    )
}
