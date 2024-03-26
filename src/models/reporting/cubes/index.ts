import {AgentTimeTrackingCube} from 'models/reporting/cubes/agentxp/AgentTimeTrackingCube'
import {HandleTimeCubeWithJoins} from 'models/reporting/cubes/agentxp/HandleTimeCube'
import {AutomationBillingEventCubeWithJoins} from 'models/reporting/cubes/automate/AutomationBillingEventCube'
import {HelpdeskMessageCubeWithJoins} from 'models/reporting/cubes/HelpdeskMessageCube'
import {HelpCenterTrackingEventCube} from './HelpCenterTrackingEventCube'
import {VoiceCallCube} from './VoiceCallCube'
import {VoiceEventsByAgentCube} from './VoiceEventsByAgent'
import {AutomationDatasetCube} from './automate_v2/AutomationDatasetCube'
import {BillableTicketDatasetCube} from './automate_v2/BillableTicketDatasetCube'

export type Cubes =
    | AgentTimeTrackingCube
    | HandleTimeCubeWithJoins
    | HelpdeskMessageCubeWithJoins
    | AutomationBillingEventCubeWithJoins
    | HelpCenterTrackingEventCube
    | VoiceCallCube
    | VoiceEventsByAgentCube
    | AutomationDatasetCube
    | BillableTicketDatasetCube
