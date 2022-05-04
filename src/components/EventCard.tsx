import { AppComponentProps } from '../models/AppComponentProps';

import { 
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Card,
  CardContent,
  Typography 
} from '@mui/material';

import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark, atomOneLight } from 'react-syntax-highlighter/dist/esm/styles/hljs'
import { FHIRcastEventTemplate } from '../models/FHIRcastEventTemplate';
import {
  ExpandMore as ExpandMoreIcon
 } from '@mui/icons-material';


export interface EventCardProps extends AppComponentProps {
  event:FHIRcastEventTemplate;
}

export default function EventCard(props:EventCardProps) {

  return (
    <Card>
      <CardContent>
        <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
            ID: {props.event.id}, received at: {props.event.timestamp}
        </Typography>
        <Typography variant="h5" component="div">
          {props.event.event['hub.event']}
        </Typography>
        <div>
        { (props.event.event.context) && props.event.event.context.map((ctx, ctxIndex) => (
          <Accordion key={`ctx-${ctxIndex}`}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls={`context-${ctxIndex}-content`}
              id={`context-${ctxIndex}-header`}
              >
              {ctx.resource?.resourceType}/{ctx.resource?.id}
              </AccordionSummary>
              <AccordionDetails>
                <SyntaxHighlighter
                  language='json'
                  style={props.useDarkMode ? atomOneDark : atomOneLight}
                  >
                  {JSON.stringify(ctx.resource, null, 2)}
                </SyntaxHighlighter>
              </AccordionDetails>
          </Accordion>
        )) }
        </div>
      </CardContent>
    </Card>
  )
}
