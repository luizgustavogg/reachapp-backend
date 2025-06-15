import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { format, subDays } from 'date-fns';

let analyticsDataClient;
let propertyId;

export function initAnalyticsClient(credentials, id) {
  analyticsDataClient = new BetaAnalyticsDataClient({ credentials });
  propertyId = id?.trim();
  if (!propertyId) throw new Error("GA4_PROPERTY_ID ausente");
}

function buildDateRange(startDate, endDate) {
  if (startDate && endDate) {
    return [{ startDate, endDate }];
  }
  const today = new Date();
  const thirtyDaysAgo = subDays(today, 29);
  return [{
    startDate: format(thirtyDaysAgo, 'yyyy-MM-dd'),
    endDate: format(today, 'yyyy-MM-dd'),
  }];
}

function getLast30Dates() {
  return Array.from({ length: 30 }, (_, i) =>
    format(subDays(new Date(), 29 - i), 'yyyy-MM-dd')
  );
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getPropertyId() {
  return `properties/${propertyId}`;
}

// --- Funções reais de dados ---
export async function getReach() {
  const [response] = await analyticsDataClient.runReport({
    property: getPropertyId(),
    dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
    dimensions: [{ name: 'date' }],
    metrics: [{ name: 'sessions' }, { name: 'totalUsers' }],
  });

  return response?.rows || [];
}

export async function getByDate(startDate, endDate, type) {
  if (type === 'example') return getLast30Dates().map(date => ({
    date,
    sessions: getRandomInt(10, 100),
    users: getRandomInt(5, 80),
  }));

  const [response] = await analyticsDataClient.runReport({
    property: getPropertyId(),
    dateRanges: buildDateRange(startDate, endDate),
    dimensions: [{ name: 'date' }],
    metrics: [{ name: 'sessions' }, { name: 'totalUsers' }],
  });

  return (response?.rows || []).map(row => ({
    date: row.dimensionValues[0]?.value,
    sessions: parseInt(row.metricValues[0]?.value || '0'),
    users: parseInt(row.metricValues[1]?.value || '0'),
  }));
}

export async function getByCountry(startDate, endDate, type) {
  if (type === 'example') {
    const countries = ['Brazil', 'US', 'India'];
    return getLast30Dates().flatMap(date =>
      countries.map(country => ({
        date,
        country,
        sessions: getRandomInt(1, 20),
      }))
    );
  }

  const [response] = await analyticsDataClient.runReport({
    property: getPropertyId(),
    dateRanges: buildDateRange(startDate, endDate),
    dimensions: [{ name: 'date' }, { name: 'country' }],
    metrics: [{ name: 'sessions' }],
  });

  return (response?.rows || []).map(row => ({
    date: row.dimensionValues[0]?.value,
    country: row.dimensionValues[1]?.value,
    sessions: parseInt(row.metricValues[0]?.value || '0'),
  }));
}

export async function getByDevice(startDate, endDate, type) {
  if (type === 'example') {
    const devices = ['mobile', 'desktop', 'tablet'];
    return getLast30Dates().flatMap(date =>
      devices.map(device => ({
        date,
        device,
        sessions: getRandomInt(1, 25),
      }))
    );
  }

  const [response] = await analyticsDataClient.runReport({
    property: getPropertyId(),
    dateRanges: buildDateRange(startDate, endDate),
    dimensions: [{ name: 'date' }, { name: 'deviceCategory' }],
    metrics: [{ name: 'sessions' }],
  });

  return (response?.rows || []).map(row => ({
    date: row.dimensionValues[0]?.value,
    device: row.dimensionValues[1]?.value,
    sessions: parseInt(row.metricValues[0]?.value || '0'),
  }));
}

export async function getTrafficSources(type) {
  if (type === 'example') {
    return ['google', 'direct', 'referral'].map(source => ({
      source,
      sessions: getRandomInt(50, 300),
    }));
  }

  const [response] = await analyticsDataClient.runReport({
    property: getPropertyId(),
    dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
    dimensions: [{ name: 'sessionSource' }],
    metrics: [{ name: 'sessions' }],
  });

  return (response?.rows || []).map(row => ({
    source: row.dimensionValues[0]?.value,
    sessions: parseInt(row.metricValues[0]?.value || '0'),
  }));
}

export async function getEngagement(type) {
  if (type === 'example') {
    return {
      averageSessionDuration: getRandomInt(60, 300),
      engagedSessions: getRandomInt(100, 500),
    };
  }

  const [response] = await analyticsDataClient.runReport({
    property: getPropertyId(),
    dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
    metrics: [{ name: 'averageSessionDuration' }, { name: 'engagedSessions' }],
  });

  const [row] = response?.rows || [];

  return {
    averageSessionDuration: parseFloat(row?.metricValues?.[0]?.value || '0'),
    engagedSessions: parseInt(row?.metricValues?.[1]?.value || '0'),
  };
}

export async function getUserRetention(type) {
  if (type === 'example') {
    return Array.from({ length: 5 }, (_, i) => ({
      cohort: `Dia ${i + 1}`,
      retentionRate: getRandomInt(10, 80),
    }));
  }

  const [response] = await analyticsDataClient.runReport({
    property: getPropertyId(),
    dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
    dimensions: [{ name: 'date' }, { name: 'newVsReturning' }],
    metrics: [{ name: 'activeUsers' }],
  });

  return (response?.rows || []).map(row => ({
    date: row.dimensionValues[0]?.value,
    userType: row.dimensionValues[1]?.value,
    activeUsers: parseInt(row.metricValues[0]?.value || '0'),
  }));
}
