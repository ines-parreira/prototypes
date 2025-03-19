import cn from 'classnames'

import {
    TicketQAScoreDimension,
    TicketQAScoreDimensionName,
} from '@gorgias/api-queries'

import type { DimensionConfig } from './types'

import css from './config.less'

export const dimensionOrderOfManualDimensions: SupportedTicketQADimensionName[] =
    [
        TicketQAScoreDimensionName.ResolutionCompleteness,
        TicketQAScoreDimensionName.Accuracy,
        TicketQAScoreDimensionName.InternalCompliance,
        TicketQAScoreDimensionName.Efficiency,
        TicketQAScoreDimensionName.CommunicationSkills,
        TicketQAScoreDimensionName.LanguageProficiency,
        TicketQAScoreDimensionName.BrandVoice,
    ]

export type SupportedTicketQADimensionName =
    | typeof TicketQAScoreDimensionName.ResolutionCompleteness
    | typeof TicketQAScoreDimensionName.Accuracy
    | typeof TicketQAScoreDimensionName.InternalCompliance
    | typeof TicketQAScoreDimensionName.Efficiency
    | typeof TicketQAScoreDimensionName.CommunicationSkills
    | typeof TicketQAScoreDimensionName.LanguageProficiency
    | typeof TicketQAScoreDimensionName.BrandVoice

export type SupportedTicketQAScoreDimension = Exclude<
    TicketQAScoreDimension,
    'name'
> & {
    name: SupportedTicketQADimensionName
}

export const dimensionConfig: Record<
    SupportedTicketQADimensionName,
    DimensionConfig
> = {
    [TicketQAScoreDimensionName.ResolutionCompleteness]: {
        autoExpandThreshold: 0,
        label: 'Resolution',
        options: [
            { label: 'Incomplete', value: 0 },
            { label: 'Complete', value: 1 },
        ],
        tooltip: 'Did the agent address ALL issues brought up by the customer?',
        placeholder: 'Did the agent answer and resolve all issues?',
        scorePlaceholder: '-',
    },
    [TicketQAScoreDimensionName.Accuracy]: {
        autoExpandThreshold: 4,
        label: 'Accuracy',
        options: [1, 2, 3, 4, 5].map((i) => ({ label: `${i}/5`, value: i })),
        prefix: <i className={cn('material-icons-round', css.icon)}>star</i>,
        tooltip:
            'On a scale from 1 to 5, did the agent use the correct resolution flow to solve the customer’s inquiry and provide accurate information?',
        placeholder: 'Did the agent provide accurate information?',
        scorePlaceholder: '-/5',
    },
    [TicketQAScoreDimensionName.InternalCompliance]: {
        autoExpandThreshold: 4,
        label: 'Internal Compliance',
        options: [1, 2, 3, 4, 5].map((i) => ({ label: `${i}/5`, value: i })),
        prefix: <i className={cn('material-icons-round', css.icon)}>star</i>,
        tooltip:
            'On a scale from 1 to 5, did the agent follow internal company guidelines and processes: applied the relevant tags and macros, followed the proper escalation and merging procedures?',
        placeholder: 'Did the agent follow internal company processes?',
        scorePlaceholder: '-/5',
    },
    [TicketQAScoreDimensionName.Efficiency]: {
        autoExpandThreshold: 4,
        label: 'Efficiency',
        options: [1, 2, 3, 4, 5].map((i) => ({ label: `${i}/5`, value: i })),
        prefix: <i className={cn('material-icons-round', css.icon)}>star</i>,
        tooltip:
            'On a scale from 1 to 5, did the agent handle the ticket quickly and minimize the number of touches?',
        placeholder: 'Did the agent handle the ticket quickly and efficiently?',
        scorePlaceholder: '-/5',
    },
    [TicketQAScoreDimensionName.CommunicationSkills]: {
        autoExpandThreshold: 4,
        label: 'Communication',
        options: [1, 2, 3, 4, 5].map((i) => ({ label: `${i}/5`, value: i })),
        prefix: <i className={cn('material-icons-round', css.icon)}>star</i>,
        tooltip:
            'On a scale of 1 to 5, did the agent demonstrate empathy, clarity of messaging, patience, positivity, and adaptability?',
        placeholder:
            'Did the agent show empathy, active listening, clear messaging?',
        scorePlaceholder: '-/5',
    },
    [TicketQAScoreDimensionName.LanguageProficiency]: {
        autoExpandThreshold: 4,
        label: 'Language',
        options: [1, 2, 3, 4, 5].map((i) => ({ label: `${i}/5`, value: i })),
        prefix: <i className={cn('material-icons-round', css.icon)}>star</i>,
        tooltip:
            'On a scale of 1 to 5, did the agent display high proficiency in the language of the conversation: flawless spelling, grammar, syntax?',
        placeholder:
            'Did the agent show proficiency in the conversation language?',
        scorePlaceholder: '-/5',
    },
    [TicketQAScoreDimensionName.BrandVoice]: {
        autoExpandThreshold: 4,
        label: 'Brand Voice',
        options: [1, 2, 3, 4, 5].map((i) => ({ label: `${i}/5`, value: i })),
        prefix: <i className={cn('material-icons-round', css.icon)}>star</i>,
        tooltip:
            'On a scale from 1 to 5, did the agent use the brand vocabulary, greetings, sign-offs and tone of voice (casual/formal, etc…)?',
        placeholder:
            'Did the agent use the brand vocabulary and tone of voice?',
        scorePlaceholder: '-/5',
    },
}
