import {AgentTimeTrackingCube} from 'models/reporting/cubes/agentxp/AgentTimeTrackingCube'
import {HandleTimeCubeWithJoins} from 'models/reporting/cubes/agentxp/HandleTimeCube'
import {AutomationBillingEventCubeWithJoins} from 'models/reporting/cubes/automate/AutomationBillingEventCube'
import {HelpdeskMessageCubeWithJoins} from 'models/reporting/cubes/HelpdeskMessageCube'
import {TicketSLACubeWithJoins} from 'models/reporting/cubes/sla/TicketSLACube'
import {HelpCenterTrackingEventCube} from 'models/reporting/cubes/HelpCenterTrackingEventCube'
import {VoiceEventsByAgentCube} from 'models/reporting/cubes/VoiceEventsByAgent'
import {AutomationDatasetCube} from 'models/reporting/cubes/automate_v2/AutomationDatasetCube'
import {BillableTicketDatasetCube} from 'models/reporting/cubes/automate_v2/BillableTicketDatasetCube'
import {VoiceCallCube} from 'models/reporting/cubes/VoiceCallCube'
import {WorkflowDatasetCube} from 'models/reporting/cubes/automate_v2/WorkflowDatasetCube'
import {ConvertOrderConversionCube} from 'models/reporting/cubes/ConvertOrderConversionCube'

export type Cubes =
    | AgentTimeTrackingCube
    | AutomationBillingEventCubeWithJoins
    | AutomationDatasetCube
    | BillableTicketDatasetCube
    | ConvertOrderConversionCube
    | HandleTimeCubeWithJoins
    | HelpCenterTrackingEventCube
    | HelpdeskMessageCubeWithJoins
    | TicketSLACubeWithJoins
    | VoiceCallCube
    | VoiceEventsByAgentCube
    | WorkflowDatasetCube
