import { calculateMetricPerHour } from 'hooks/reporting/useMessagesSentPerHour'
import { ReportingMetricItem } from 'hooks/reporting/useMetricPerDimension'
import {
    AgentTimeTrackingCube,
    AgentTimeTrackingDimension,
    AgentTimeTrackingMeasure,
} from 'models/reporting/cubes/agentxp/AgentTimeTrackingCube'
import { HelpdeskMessageCubeWithJoins } from 'models/reporting/cubes/HelpdeskMessageCube'

export const calculateTotalCapacity = (
    allAgentsMetricData:
        | ReportingMetricItem<HelpdeskMessageCubeWithJoins>[]
        | undefined,
    onlineTimeDataPerAllAgents:
        | ReportingMetricItem<AgentTimeTrackingCube>[]
        | undefined,
    agentIdDimension: string,
    measure: string,
) => {
    const onlineTimeMeasure = AgentTimeTrackingMeasure.OnlineTime
    const onlineTimeAgentID = AgentTimeTrackingDimension.UserId

    if (
        allAgentsMetricData === undefined ||
        onlineTimeDataPerAllAgents === undefined
    ) {
        return {
            value: null,
        }
    }

    const totalMetricsPerAgentsPerHour = onlineTimeDataPerAllAgents.reduce(
        (total, onlineTime) => {
            const onlineTimePerAgent = onlineTime[onlineTimeMeasure]
            const agentId = onlineTime[onlineTimeAgentID]
            const metricDataPerAgentRow = allAgentsMetricData.find(
                (item) => item[agentIdDimension] === agentId,
            )
            const metricDataPerAgent = metricDataPerAgentRow?.[measure] || 0

            return (
                total +
                calculateMetricPerHour(
                    Number(metricDataPerAgent),
                    Number(onlineTimePerAgent),
                )
            )
        },
        0,
    )

    return { value: totalMetricsPerAgentsPerHour }
}
