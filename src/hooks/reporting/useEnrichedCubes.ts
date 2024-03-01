import {useFlags} from 'launchdarkly-react-client-sdk'
import {FeatureFlagKey} from 'config/featureFlags'
import {AgentTimeTrackingMember} from 'models/reporting/cubes/agentxp/AgentTimeTrackingCube'
import {HandleTimeMeasure} from 'models/reporting/cubes/agentxp/HandleTimeCube'
import {HelpdeskMessageMember} from 'models/reporting/cubes/HelpdeskMessageCube'
import {TicketMember} from 'models/reporting/cubes/TicketCube'
import {TicketMessagesMember} from 'models/reporting/cubes/TicketMessagesCube'
import {ReportingQuery} from 'models/reporting/types'
import {renameCubeStringified, renameMember} from 'utils/reporting'

const CUBE_NAMES: [string, string][] = [
    ['Ticket', 'TicketEnriched'],
    ['TicketMessages', 'TicketMessagesEnriched'],
    ['HelpdeskMessage', 'HelpdeskMessageEnriched'],
    ['TicketSatisfactionSurvey', 'TicketSatisfactionSurveyEnriched'],
    ['TagsOnTicket', 'TagsOnTicketEnriched'],
    ['TicketCustomFields', 'TicketCustomFieldsEnriched'],
]

interface QueryRenameFn {
    <T extends ReportingQuery>(arg: T): T
}

const applyRename = <T>(
    names: [string, string][],
    renamingFunction: (subject: T, from: string, to: string) => T
) => {
    return (arg: T) => {
        return names.reduce(
            (acc, name) => renamingFunction(acc, name[0], name[1]),
            arg
        )
    }
}

export const renameCubesEnriched: QueryRenameFn = applyRename(
    CUBE_NAMES,
    renameCubeStringified
)
export const renameMemberEnriched = applyRename(CUBE_NAMES, renameMember)

const agentIdFields = [
    TicketMember.AssigneeUserId,
    TicketMessagesMember.FirstHelpdeskMessageUserId,
    HelpdeskMessageMember.SenderId,
    AgentTimeTrackingMember.UserId,
]

const enrichedAgentIdFields = agentIdFields.map((field) =>
    renameMemberEnriched(field)
)

export const combinedAgentIdFields = [
    ...agentIdFields,
    ...enrichedAgentIdFields,
]

const isHandleTimeQuery = (query: ReportingQuery) =>
    query.measures.includes(HandleTimeMeasure.HandleTime) ||
    query.measures.includes(HandleTimeMeasure.AverageHandleTime)

export const useEnrichedCubes = <T extends ReportingQuery>(
    originalQuery: T
): T => {
    const isAnalyticsNewCubes: boolean | undefined =
        useFlags()[FeatureFlagKey.AnalyticsNewCubes]

    return isAnalyticsNewCubes && !isHandleTimeQuery(originalQuery)
        ? renameCubesEnriched(originalQuery)
        : originalQuery
}
