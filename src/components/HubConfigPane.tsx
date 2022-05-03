import React, { ReactFragment, useEffect, useRef, useState } from 'react';

import { AppComponentProps } from '../models/AppComponentProps';
import { fhir, valueSetEnums as fhirEnums } from 'fhir-typescript-sdk-dev';

import { 
  Accordion,
  Box,
  Button, 
  Card,
  Checkbox,
  FormControl, 
  FormControlLabel, 
  FormGroup, 
  FormLabel, 
  Grid, 
  IconButton, 
  InputLabel, 
  List, 
  ListItemButton, 
  ListItemText, 
  ListSubheader, 
  MenuItem, 
  Select, 
  SelectChangeEvent, 
  Stack, 
  TextField, 
  Tooltip, 
  Typography 
} from '@mui/material';
import { 
  DriveFolderUpload as DriveFolderUploadIcon,
} from '@mui/icons-material';
import { WellknownFhircast } from '../models/FHIRcastWellknown';

import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark, atomOneLight } from 'react-syntax-highlighter/dist/esm/styles/hljs'
import { WebsocketSubscriptionResponse } from '../models/WebsocketSubscriptionResponse';



export interface HubConfigPaneProps extends AppComponentProps {
  connectWebsocket:(wsUrl:string) => void;
}

export default function HubConfigPane(props:HubConfigPaneProps) {
  const [scopes, setScopes] = useState<object>({});
  const [hubUrl, setHubUrl] = useState<string>('http://212.187.24.92:9412/api/sync/fhircast/');
  const [wellKnownDisplay, setWellKnownDisplay] = useState<string>('');

  const [hubTopic, setHubTopic] = useState<string>('Topic1');
  const [leaseSeconds, setLeaseSeconds] = useState<number>(30 * 60);
  const [subscriberName, setSubscriberName] = useState<string>('FHIRcast Test Client');

  const [bearerToken, setBearerToken] = useState<string>('');

  async function loadWellKnownConfig() {
    if (!hubUrl) {
      props.addMessage('Cannot load well-known without a hub url!');
      return;
    }

    try {
      let url:string = new URL(
        '.well-known/fhircast-configuration',
        hubUrl).toString();
  
      let response:Response = await fetch(url, {
        method: 'GET',
      });
  
      let body:string = await response.text();
      let typed:WellknownFhircast = JSON.parse(body);

      let updatedScopes:object = {...scopes};

      typed.eventsSupported.forEach((event:string) => {
        (updatedScopes as any)[event] = false;
      });

      setScopes(updatedScopes);
      setWellKnownDisplay(JSON.stringify(typed, null, 2));

    } catch (err) {
      console.log('Caught error', err);
      props.addMessage(`Failed to retrieve well-known configuration: ${err}`);
    }
  }

  function handleScopeCheckChange(event: React.ChangeEvent<HTMLInputElement>) {
    let updatedScopes:object = {...scopes};
    (updatedScopes as any)[event.target.name] = !(scopes as any)[event.target.name];
    setScopes(updatedScopes);
  }

  function getScopeControls():ReactFragment[] {
    let controls:ReactFragment[] = [];
    
    if (scopes === {}) {
      return controls;
    }

    Object.entries(scopes).forEach(([event, checked]) => {
      controls.push(
        <Grid item xs={2} key={`grid-${event}`} >
          <FormControlLabel
            key={`control-${event}`}
            control={<Checkbox checked={checked} onChange={handleScopeCheckChange} name={event} />}
            label={event}
          />
        </Grid>
      );
    });
    
    return controls;
  }

  function getSelectedEventComponent():string {
    let events:string = '';

    Object.entries(scopes).forEach(([event, checked]) => {
      if (checked) {
        events += (events ? ',' : '') + event;
      }
    });

    if (events === '') {
      return '';
    }

    return `&hub.events=${encodeURIComponent(events)}`;
  }

  async function subscriptionRequest() {
    try {
      let url:string = new URL(hubUrl).toString();
  
      let headers: Headers = new Headers();
      headers.append('Content-Type', 'application/x-www-form-urlencoded');
      headers.append('Accept', 'application/json');
      if ((bearerToken) && (bearerToken !== '')) {
        headers.append('Authorization', `Bearer ${bearerToken}`);
      }

      let requestBody:string = 'hub.channel.type=websocket&hub.mode=subscribe';
      requestBody += `&hub.topic=${encodeURIComponent(hubTopic)}`;
      requestBody += getSelectedEventComponent();
      
      if (leaseSeconds > 0) {
        requestBody += '&hub.lease_seconds=' + leaseSeconds.toString();
      }

      if (subscriberName) {
        requestBody += `&subscriber.name=${encodeURIComponent(subscriberName)}`;
      }

      let response:Response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: requestBody,
      });
  
      let body:string = await response.text();
      let typed:WebsocketSubscriptionResponse = JSON.parse(body);

      console.log('Connection will be at', typed['hub.channel.endpoint']);

    } catch (err) {
      console.log('Caught error', err);
      props.addMessage(`Failed to request subscription: ${err}`);
    }
  }

  const handleHubUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setHubUrl(event.target.value);
  };

  const handleHubTopicChange  = (event: React.ChangeEvent<HTMLInputElement>) => {
    setHubTopic(event.target.value);
  };

  const handleLeaseSecondsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLeaseSeconds(Number.parseInt(event.target.value));
  };

  const handleSubscriberNameChange  = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSubscriberName(event.target.value);
  };

  const handleBearerTokenChange  = (event: React.ChangeEvent<HTMLInputElement>) => {
    setBearerToken(event.target.value);
  };

  return (
    <Card>
      <Stack direction='column' spacing={2}>
        <TextField 
          key='hub-url'
          value={hubUrl} 
          onChange={handleHubUrlChange} 
          required 
          fullWidth 
          variant='filled'
          label='Hub URL' 
          id='hub-url' 
          helperText='Root URL of the FHIRcast hub.'
          />
        <Button
          key='load-well-known-config'
          onClick={() => loadWellKnownConfig()}
          >
          Load Well-Known Config
        </Button>
        <FormControl sx={{m: 3}} component='fieldset' variant='standard' key='event-control-group'>
          <FormLabel component='legend'>Events</FormLabel>
            <FormGroup>
            <Grid container spacing={2}>
            { getScopeControls() }
            </Grid>
          </FormGroup>
        </FormControl>

        <TextField 
          key='hub-topic'
          value={hubTopic} 
          onChange={handleHubTopicChange} 
          required 
          fullWidth 
          variant='filled'
          label='Hub Topic' 
          id='hub-topic' 
          helperText='The identifier of the session that the subscriber wishes to subscribe to.'
          />
          
        <TextField 
          key='lease-seconds'
          value={leaseSeconds.toString()} 
          onChange={handleLeaseSecondsChange} 
          required 
          fullWidth 
          variant='filled'
          label='Lease Seconds' 
          id='lease-seconds' 
          helperText='	Number of seconds for which the subscriber would like to have the subscription active.'
          />

        <TextField 
          key='subscriber-name'
          value={subscriberName} 
          onChange={handleSubscriberNameChange} 
          fullWidth 
          variant='filled'
          label='Subscriber Name' 
          id='subscriber-name' 
          helperText='An optional description of the subscriber that will be used in syncerror notifications when an event is refused or cannot be delivered.'
          />

        <TextField 
          key='bearer-token'
          value={bearerToken} 
          onChange={handleBearerTokenChange} 
          fullWidth 
          variant='filled'
          label='Bearer Token' 
          id='bearer-token' 
          helperText='An optional Bearer Token to include with Subscription Requests.'
          />

        <Button
          key='connect-websocket'
          onClick={() => subscriptionRequest()}
          >
          Connect
        </Button>

        <SyntaxHighlighter
          id='display-wellknown'
          language='json'
          style={props.useDarkMode ? atomOneDark : atomOneLight}
          >
          {wellKnownDisplay}
        </SyntaxHighlighter>
      </Stack>
    </Card>
  )
}
