import { AppComponentProps } from '../models/AppComponentProps';

import { 
  Card,
  Stack, 
} from '@mui/material';

import { FHIRcastEventTemplate } from '../models/FHIRcastEventTemplate';
import { FHIRcastWsConnectMessage } from '../models/FHIRcastWsConnectMessage';
import ConnectCard from './ConnectCard';
import EventCard from './EventCard';


export interface EventPaneProps extends AppComponentProps {
  receivedConnects:FHIRcastWsConnectMessage[];
  receivedEvents:FHIRcastEventTemplate[];
}

export default function EventPane(props:EventPaneProps) {

  return (
    <Card>
      <Stack direction='column' spacing={2}>
        { props.receivedConnects.map((cm) => (
          <ConnectCard
            key={`connect-${cm['hub.mode']}`}
            useDarkMode={props.useDarkMode}
            addMessage={props.addMessage}
            connectMessage={cm}
            />
        ))
        }
        { props.receivedEvents.map((et) => (
          <EventCard
            key={`event-${et.id}`}
            useDarkMode={props.useDarkMode}
            addMessage={props.addMessage}
            event={et}
            />
        ))}
      </Stack>
    </Card>
  )
}
