import React, { ReactElement, useState } from 'react';

import { AppComponentProps } from '../models/AppComponentProps';

import { 
  Button, 
  Card,
  Checkbox,
  FormControl, 
  FormControlLabel, 
  FormGroup, 
  FormLabel, 
  Grid, 
  Stack, 
  TextField, 
} from '@mui/material';
import { WellknownFhircast } from '../models/FHIRcastWellknown';

import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark, atomOneLight } from 'react-syntax-highlighter/dist/esm/styles/hljs'
import { WebsocketSubscriptionResponse } from '../models/WebsocketSubscriptionResponse';


export interface HubConfigPaneProps extends AppComponentProps {
  connectWebsocket:(wsUrl:string) => void;
  supportedEvents:object;
  setSupportedEvents:(events:object) => void;
  hubUrl:string;
  setHubUrl:(url:string) => void;
  hubTopic:string;
  setHubTopic:(topic:string) => void;
  leaseSeconds:number;
  setLeaseSeconds:(seconds:number) => void;
  subscriberName:string;
  setSubscriberName:(name:string) => void;
  bearerToken:string;
  setBearerToken:(token:string) => void;
  connected:boolean;
  websocketUrl:string;
}

export default function HubConfigPane(props:HubConfigPaneProps) {
  const [wellKnownDisplay, setWellKnownDisplay] = useState<string>('');

  async function loadWellKnownConfig() {
    if (!props.hubUrl) {
      props.addMessage('Cannot load well-known without a hub url!');
      return;
    }

    try {
      let url:string = new URL(
        '.well-known/fhircast-configuration',
        (props.hubUrl.endsWith('/') ? props.hubUrl : (props.hubUrl + '/'))).toString();
  
      let response:Response = await fetch(url, {
        method: 'GET',
      });
  
      let body:string = await response.text();
      let typed:WellknownFhircast = JSON.parse(body);

      let updatedEvents:object = {};

      typed.eventsSupported.forEach((event:string) => {
        (updatedEvents as any)[event] = (props.supportedEvents as any)[event] ?? false;
      });

      props.setSupportedEvents(updatedEvents);
      setWellKnownDisplay(JSON.stringify(typed, null, 2));

    } catch (err) {
      console.log('Caught error', err);
      props.addMessage(`Failed to retrieve well-known configuration: ${err}`);
    }
  }

  function handleEventCheckChange(event: React.ChangeEvent<HTMLInputElement>) {
    let updatedEvents:object = {...props.supportedEvents};
    (updatedEvents as any)[event.target.name] = !(props.supportedEvents as any)[event.target.name];
    props.setSupportedEvents(updatedEvents);
  }

  function getEventControls():ReactElement[] {
    let controls:ReactElement[] = [];
    
    if (props.supportedEvents === {}) {
      return controls;
    }

    Object.entries(props.supportedEvents).forEach(([event, checked]) => {
      controls.push(
        <Grid item xs={2} key={`grid-${event}`} >
          <FormControlLabel
            key={`control-${event}`}
            control={<Checkbox checked={checked} onChange={handleEventCheckChange} name={event} />}
            label={event}
          />
        </Grid>
      );
    });
    
    return controls;
  }

  function getSelectedEventComponent():string {
    let selected:string = '';

    Object.entries(props.supportedEvents).forEach(([event, checked]) => {
      if (checked) {
        selected += (selected ? ',' : '') + event;
      }
    });

    if (selected === '') {
      return '';
    }

    return `&hub.events=${encodeURIComponent(selected)}`;
  }

  function toggleConnection() {
    if (props.connected) {
      requestUnsubscribe();
    } else {
      requestSubscribe();
    }
  }

  async function requestUnsubscribe() {
    try {
      let url:string = new URL(props.hubUrl).toString();
  
      let headers: Headers = new Headers();
      headers.append('Content-Type', 'application/x-www-form-urlencoded');
      headers.append('Accept', 'application/json');
      if ((props.bearerToken) && (props.bearerToken !== '')) {
        headers.append('Authorization', `Bearer ${props.bearerToken}`);
      }

      let requestBody:string = 'hub.channel.type=websocket&hub.mode=unsubscribe';
      requestBody += `&hub.topic=${encodeURIComponent(props.hubTopic)}`;
      
      if (props.websocketUrl) {
        requestBody += `&hub.channel.endpoint=${encodeURIComponent(props.websocketUrl)}`;
      }

      await fetch(url, {
        method: 'POST',
        headers: headers,
        body: requestBody,
      });
    } catch (err) {
      console.log('Caught error', err);
      props.addMessage(`Failed to request unsubscribe: ${err}`);
    }
  }

  async function requestSubscribe() {
    try {
      let url:string = new URL(props.hubUrl).toString();
  
      let headers: Headers = new Headers();
      headers.append('Content-Type', 'application/x-www-form-urlencoded');
      headers.append('Accept', 'application/json');
      if ((props.bearerToken) && (props.bearerToken !== '')) {
        headers.append('Authorization', `Bearer ${props.bearerToken}`);
      }

      let requestBody:string = 'hub.channel.type=websocket&hub.mode=subscribe';
      requestBody += `&hub.topic=${encodeURIComponent(props.hubTopic)}`;
      requestBody += getSelectedEventComponent();
      
      if (props.leaseSeconds > 0) {
        requestBody += '&hub.lease_seconds=' + props.leaseSeconds.toString();
      }

      if (props.subscriberName) {
        requestBody += `&subscriber.name=${encodeURIComponent(props.subscriberName)}`;
      }

      let response:Response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: requestBody,
      });
  
      let body:string = await response.text();
      let typed:WebsocketSubscriptionResponse = JSON.parse(body);

      console.log('Connection will be at', typed['hub.channel.endpoint']);

      props.connectWebsocket(typed['hub.channel.endpoint']);

    } catch (err) {
      console.log('Caught error', err);
      props.addMessage(`Failed to request subscribe: ${err}`);
    }
  }

  const handleHubUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    props.setHubUrl(event.target.value);
  };

  const handleHubTopicChange  = (event: React.ChangeEvent<HTMLInputElement>) => {
    props.setHubTopic(event.target.value);
  };

  const handleLeaseSecondsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    props.setLeaseSeconds(Number.parseInt(event.target.value));
  };

  const handleSubscriberNameChange  = (event: React.ChangeEvent<HTMLInputElement>) => {
    props.setSubscriberName(event.target.value);
  };

  const handleBearerTokenChange  = (event: React.ChangeEvent<HTMLInputElement>) => {
    props.setBearerToken(event.target.value);
  };

  return (
    <Card>
      <Stack direction='column' spacing={2}>
        <TextField 
          key='hub-url'
          value={props.hubUrl} 
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
            { getEventControls() }
            </Grid>
          </FormGroup>
        </FormControl>

        <TextField 
          key='hub-topic'
          value={props.hubTopic} 
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
          value={props.leaseSeconds.toString()} 
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
          value={props.subscriberName} 
          onChange={handleSubscriberNameChange} 
          fullWidth 
          variant='filled'
          label='Subscriber Name' 
          id='subscriber-name' 
          helperText='An optional description of the subscriber that will be used in syncerror notifications when an event is refused or cannot be delivered.'
          />

        <TextField 
          key='bearer-token'
          value={props.bearerToken} 
          onChange={handleBearerTokenChange} 
          fullWidth 
          variant='filled'
          label='Bearer Token' 
          id='bearer-token' 
          helperText='An optional Bearer Token to include with Subscription Requests.'
          />
        <Button
          key='connect-websocket'
          onClick={() => toggleConnection()}
          >
          {props.connected ? 'Disconnect' : 'Connect'}
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
