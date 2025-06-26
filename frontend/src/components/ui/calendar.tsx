import React from 'react';
import RcCalendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

export type CalendarProps = React.ComponentProps<typeof RcCalendar>;

export function Calendar(props: CalendarProps) {
  return <RcCalendar {...props} />;
}
