import React, { ReactFragment, useEffect, useRef, useState } from 'react';

import { AppComponentProps } from '../models/AppComponentProps';

import { 
  Button, 
  Card,
  CardContent,
  Checkbox,
  FormControl, 
  FormControlLabel, 
  FormGroup, 
  FormLabel, 
  Grid, 
  Stack, 
  TextField, 
  Typography 
} from '@mui/material';
import { WellknownFhircast } from '../models/FHIRcastWellknown';

import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark, atomOneLight } from 'react-syntax-highlighter/dist/esm/styles/hljs'
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
