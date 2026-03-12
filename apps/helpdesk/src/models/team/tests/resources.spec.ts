import MockAdapter from 'axios-mock-adapter'
import { Set } from 'immutable'
import _pick from 'lodash/pick'

import { teams as teamsFixtures } from 'fixtures/teams'
import client from 'models/api/resources'
import { OrderDirection } from 'models/api/types'
import { Cancel, CancelToken } from 'tests/axiosRuntime'

import {
    addTeamMember,
    createTeam,
    deleteTeam,
    deleteTeamMember,
    deleteTeamMembers,
    fetchTeam,
    fetchTeamMembers,
    fetchTeams,
    updateTeam,
} from '../resources'
import { TeamSortableProperties } from '../types'

const mockedServer = new MockAdapter(client)

const meta = {
    next_cursor: null,
    prev_cursor: null,
}

describe('team resources', () => {
    beforeEach(() => {
        mockedServer.reset()
    })

    describe('fetchTeams', () => {
        it('should resolve with a Team list on success', async () => {
            mockedServer.onGet('/api/teams/').reply(200, {
                data: teamsFixtures,
                meta,
            })
            const res = await fetchTeams()
            expect(res).toMatchSnapshot()
        })

        it('should reject an error on fail', () => {
            mockedServer.onGet('/api/teams/').reply(503, { message: 'error' })
            return expect(fetchTeams()).rejects.toEqual(
                new Error('Request failed with status code 503'),
            )
        })

        it('should reject when cancelled', async () => {
            mockedServer.onGet('/api/teams/').reply(200, {
                data: teamsFixtures,
                meta,
            })
            const source = CancelToken.source()
            source.cancel()

            await expect(
                fetchTeams(
                    {
                        orderBy: `${TeamSortableProperties.CreatedDatetime}:${OrderDirection.Asc}`,
                    },
                    { cancelToken: source.token },
                ),
            ).rejects.toEqual(new Cancel())
        })

        it.each([OrderDirection.Asc, OrderDirection.Desc])(
            'should concat second sorting attribute when sorting by usage',
            async (direction) => {
                mockedServer.onGet('/api/teams/').reply(200, {
                    data: teamsFixtures,
                    meta,
                })
                await fetchTeams({
                    orderBy: `${TeamSortableProperties.Name}:${direction}`,
                })
                expect(mockedServer.history.get[0].params).toMatchSnapshot()
            },
        )
    })

    describe('fetchTeam', () => {
        it('should resolve with a Team on success', async () => {
            mockedServer
                .onGet(/\/api\/teams\/\d+\//)
                .reply(200, teamsFixtures[0])
            const res = await fetchTeam(1)
            expect(res).toMatchSnapshot()
        })

        it('should reject an error on fail', () => {
            mockedServer
                .onGet(/\/api\/teams\/\d+\//)
                .reply(503, { message: 'error' })
            return expect(fetchTeam(1)).rejects.toEqual(
                new Error('Request failed with status code 503'),
            )
        })
    })

    describe('createTeam', () => {
        const teamDraftMock = _pick(teamsFixtures[0], ['name', 'members'])

        it('should resolve with a new Team on success', async () => {
            mockedServer.onPost('/api/teams/').reply(200, teamsFixtures[0])
            const res = await createTeam(teamDraftMock)

            expect(res).toMatchSnapshot()
            expect(mockedServer.history).toMatchSnapshot()
        })

        it('should reject an error on fail', () => {
            mockedServer.onPost('/api/teams/').reply(503, { message: 'error' })
            return expect(createTeam(teamDraftMock)).rejects.toEqual(
                new Error('Request failed with status code 503'),
            )
        })
    })

    describe('deleteTeam', () => {
        it('should resolve on success', async () => {
            mockedServer.onDelete(/\/api\/teams\/\d+\//).reply(200)
            const res = await deleteTeam(1)
            expect(res).toMatchSnapshot()
        })

        it('should reject an error on fail', () => {
            mockedServer
                .onDelete(/\/api\/teams\/\d+\//)
                .reply(503, { message: 'error' })
            return expect(deleteTeam(1)).rejects.toEqual(
                new Error('Request failed with status code 503'),
            )
        })
    })

    describe('updateTeam', () => {
        it('should resolve with the updated team on success', async () => {
            mockedServer
                .onPut(/\/api\/teams\/\d+\//)
                .reply(200, teamsFixtures[0])
            const res = await updateTeam(teamsFixtures[0])
            expect(res).toMatchSnapshot()
            expect(mockedServer.history).toMatchSnapshot()
        })

        it('should reject an error on fail', () => {
            mockedServer
                .onPut(/\/api\/teams\/\d+\//)
                .reply(503, { message: 'error' })
            return expect(updateTeam(teamsFixtures[0])).rejects.toEqual(
                new Error('Request failed with status code 503'),
            )
        })
    })

    describe('fetchTeamMembers', () => {
        it('should resolve with the team members on success', async () => {
            mockedServer
                .onGet(/\/api\/teams\/\d+\/members/)
                .reply(200, teamsFixtures[0].members)
            const res = await fetchTeamMembers({ id: 35 })
            expect(res).toMatchSnapshot()
        })

        it('should reject an error on fail', () => {
            mockedServer
                .onGet(/\/api\/teams\/\d+\/members/)
                .reply(503, { message: 'error' })
            return expect(fetchTeamMembers({ id: 35 })).rejects.toEqual(
                new Error('Request failed with status code 503'),
            )
        })
    })

    describe('addTeamMember', () => {
        it('should resolve with the team member creation success', async () => {
            const resp = {
                id: 1,
                name: 'team',
                timezone: 'UTC',
                created_datetime: teamsFixtures[0].created_datetime,
                updated_datetime: teamsFixtures[0].created_datetime,
            }

            mockedServer.onPost(/\/api\/teams\/\d+\/members/).reply(200, resp)
            const res = await addTeamMember(33, 2)
            expect(res).toMatchSnapshot()
        })

        it('should reject an error on fail', () => {
            mockedServer
                .onPost(/\/api\/teams\/\d+\/members/)
                .reply(503, { message: 'error' })
            return expect(addTeamMember(33, 2)).rejects.toEqual(
                new Error('Request failed with status code 503'),
            )
        })
    })

    describe('deleteTeamMember', () => {
        it('should resolve with the team member deletion success', async () => {
            mockedServer.onDelete(/\/api\/teams\/\d+\/members/).reply(204)
            const res = await deleteTeamMember(
                teamsFixtures[0].id,
                teamsFixtures[0].members[0].id,
            )
            expect(res).toBeUndefined()
        })

        it('should reject an error on fail', () => {
            mockedServer
                .onDelete(/\/api\/teams\/\d+\/members/)
                .reply(503, { message: 'error' })
            return expect(
                deleteTeamMember(
                    teamsFixtures[0].id,
                    teamsFixtures[0].members[0].id,
                ),
            ).rejects.toEqual(new Error('Request failed with status code 503'))
        })
    })

    describe('deleteTeamMembers', () => {
        it('should resolve with the team members deletion success', async () => {
            mockedServer.onDelete(/\/api\/teams\/\d+\/members/).reply(204)
            const res = await deleteTeamMembers(
                teamsFixtures[0].id,
                Set([teamsFixtures[0].members[0].id]),
            )
            expect(res).toBeUndefined()
        })

        it('should reject an error on fail', () => {
            mockedServer
                .onDelete(/\/api\/teams\/\d+\/members/)
                .reply(503, { message: 'error' })
            return expect(
                deleteTeamMembers(
                    teamsFixtures[0].id,
                    Set([teamsFixtures[0].members[0].id]),
                ),
            ).rejects.toEqual(new Error('Request failed with status code 503'))
        })
    })
})
