import { AppComponentProps } from '../models/AppComponentProps';

import { 
  Card,
  CardContent,
  Typography 
} from '@mui/material';

import { FHIRcastWsConnectMessage } from '../models/FHIRcastWsConnectMessage';


export interface ConnectCardProps extends AppComponentProps {
  connectMessage:FHIRcastWsConnectMessage;
}

export default function ConnectCard(props:ConnectCardProps) {

  return (
    <Card>
      <CardContent>
        <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
            Subscribe
        </Typography>
        <Typography variant="h5" component="div">
          {props.connectMessage['hub.topic']}
        </Typography>
        <Typography variant="body2">
          {props.connectMessage['hub.events']}
          <br />
          {props.connectMessage['hub.lease_seconds']} second lease
        </Typography>
      </CardContent>
    </Card>
  )
}
