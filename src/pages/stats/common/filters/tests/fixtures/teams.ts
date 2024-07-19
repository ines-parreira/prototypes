import {Team} from 'models/team/types'
import {teams} from 'fixtures/teams'

const testTeamWithMembers: Team = {
    ...(teams.find((t) => t.id === 36) as Team),
    members: [
        {
            email: 'JamievanLeijden@jourrapide.com',
            id: 4,
            meta: null,
            name: 'Jamie van Leijden',
        },
        {
            email: 'yin-yang@gorgias.io',
            id: 5,
            meta: null,
            name: 'Yen Yang',
        },
    ],
}

export const extendedTeams: Team[] = [
    ...teams.filter((t) => t.id !== 36),
    testTeamWithMembers,
]
