export interface AnalyticsEvent {
  name: string;
  payload?: Record<string, unknown>;
}

export class Analytics {
  track(event: AnalyticsEvent) {
    if (process.env.NODE_ENV !== 'production') {
      console.info('[analytics]', event.name, event.payload ?? {});
    }
  }
}

export const analytics = new Analytics();
