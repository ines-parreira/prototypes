import { isValidPhoneNumber as validatePhoneNumber } from 'libphonenumber-js'

import { JourneyCampaignStateEnum } from '@gorgias/convert-client'

export function splitStringUsingRegex(inputString: string): string[] {
    const characters: string[] = []
    const regex = /[\s\S]/gu

    let match
    while ((match = regex.exec(inputString)) !== null) {
        characters.push(match[0])
    }

    return characters
}

export const isValidPhoneNumber = (value?: string): boolean => {
    if (!value) {
        return false
    }

    try {
        return validatePhoneNumber(value)
    } catch {
        return false
    }
}

export const calculateRatiusToPercentage = ({
    numerator,
    denominator,
}: {
    numerator: number | undefined | null
    denominator: number | undefined | null
}): number => {
    if (numerator && denominator) {
        return (numerator / denominator) * 100
    }
    return 0
}

export const calculateRate = ({
    numerator,
    denominator,
}: {
    numerator: number | undefined | null
    denominator: number | undefined | null
}): number => {
    if (numerator && denominator) {
        return numerator / denominator
    }
    return 0
}

export const getCampaignStateLabelAndColor = (
    state?: JourneyCampaignStateEnum,
): { label: string; color: string } => {
    let color: string
    let label: string
    switch (state) {
        case JourneyCampaignStateEnum.Draft:
            color = 'yellow'
            label = 'Draft'
            break
        case JourneyCampaignStateEnum.Scheduled:
            color = 'yellow'
            label = 'Scheduled'
            break
        case JourneyCampaignStateEnum.Paused:
            color = 'yellow'
            label = 'Paused'
            break
        case JourneyCampaignStateEnum.Active:
            color = 'blue'
            label = 'Sending'
            break
        case JourneyCampaignStateEnum.Canceled:
            color = 'red'
            label = 'Canceled'
            break
        case JourneyCampaignStateEnum.Sent:
            color = 'green'
            label = 'Delivered'
            break
        default:
            color = 'grey'
            label = 'Unknown'
    }

    return { color, label }
}
