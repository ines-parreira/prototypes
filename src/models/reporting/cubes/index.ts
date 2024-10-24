import {AgentTimeTrackingCube} from 'models/reporting/cubes/agentxp/AgentTimeTrackingCube'
import {HandleTimeCubeWithJoins} from 'models/reporting/cubes/agentxp/HandleTimeCube'
import {TicketQAScoreCubeWithJoins} from 'models/reporting/cubes/auto-qa/TicketQAScoreCube'
import {AutomationBillingEventCubeWithJoins} from 'models/reporting/cubes/automate/AutomationBillingEventCube'
import {AutomationDatasetCube} from 'models/reporting/cubes/automate_v2/AutomationDatasetCube'
import {BillableTicketDatasetCube} from 'models/reporting/cubes/automate_v2/BillableTicketDatasetCube'
import {WorkflowDatasetCube} from 'models/reporting/cubes/automate_v2/WorkflowDatasetCube'
import {ConvertOrderConversionCube} from 'models/reporting/cubes/ConvertOrderConversionCube'
import {ConvertOrderEventsCube} from 'models/reporting/cubes/ConvertOrderEventsCube'
import {HelpCenterTrackingEventCube} from 'models/reporting/cubes/HelpCenterTrackingEventCube'
import {HelpdeskMessageCubeWithJoins} from 'models/reporting/cubes/HelpdeskMessageCube'
import {TicketSLACubeWithJoins} from 'models/reporting/cubes/sla/TicketSLACube'
import {TicketTagsEnrichedCube} from 'models/reporting/cubes/TicketTagsEnrichedCube'
import {VoiceCallCube} from 'models/reporting/cubes/VoiceCallCube'
import {VoiceEventsByAgentCube} from 'models/reporting/cubes/VoiceEventsByAgent'

export type Cubes =
    | AgentTimeTrackingCube
    | AutomationBillingEventCubeWithJoins
    | AutomationDatasetCube
    | BillableTicketDatasetCube
    | ConvertOrderEventsCube
    | ConvertOrderConversionCube
    | HandleTimeCubeWithJoins
    | HelpCenterTrackingEventCube
    | HelpdeskMessageCubeWithJoins
    | TicketQAScoreCubeWithJoins
    | TicketSLACubeWithJoins
    | VoiceCallCube
    | VoiceEventsByAgentCube
    | WorkflowDatasetCube
    | TicketTagsEnrichedCube
