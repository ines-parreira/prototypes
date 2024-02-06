import {AgentTimeTrackingCube} from 'models/reporting/cubes/agentxp/AgentTimeTrackingCube'
import {AutomationBillingEventCubeWithJoins} from 'models/reporting/cubes/AutomationBillingEventCube'
import {HelpdeskMessageCubeWithJoins} from 'models/reporting/cubes/HelpdeskMessageCube'
import {HelpCenterTrackingEventCube} from './HelpCenterTrackingEventCube'
import {VoiceCallCube} from './VoiceCallCube'
import {VoiceEventsByAgentCube} from './VoiceEventsByAgent'

export type Cubes =
    | AgentTimeTrackingCube
    | HelpdeskMessageCubeWithJoins
    | AutomationBillingEventCubeWithJoins
    | HelpCenterTrackingEventCube
    | VoiceCallCube
    | VoiceEventsByAgentCube
