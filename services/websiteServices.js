import { BetaAnalyticsDataClient } from '@google-analytics/data';
import dotenv from 'dotenv';
import { format, subDays } from 'date-fns';
dotenv.config();

const analyticsDataClient = new BetaAnalyticsDataClient();

function buildDateRange(startDate, endDate) {
  if (startDate && endDate) {
    return [{ startDate, endDate }];
  }
  return [{ startDate: '7daysAgo', endDate: 'today' }];
}

function getLast7Dates() {
  return Array.from({ length: 7 }, (_, i) => format(subDays(new Date(), 6 - i), 'yyyy-MM-dd'));
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomExampleByDate() {
  return getLast7Dates().map(date => ({
    date,
    sessions: getRandomInt(10, 100),
    users: getRandomInt(5, 80)
  }));
}

function getRandomExampleByCountry() {
  const countries = ['Brazil', 'United States', 'India', 'Canada'];
  return getLast7Dates().flatMap(date =>
    countries.map(country => ({
      date,
      country,
      sessions: getRandomInt(1, 20)
    }))
  );
}

function getRandomExampleByDevice() {
  const devices = ['mobile', 'desktop', 'tablet'];
  return getLast7Dates().flatMap(date =>
    devices.map(device => ({
      date,
      device,
      sessions: getRandomInt(1, 25)
    }))
  );
}

export async function getReach() {
  const [response] = await analyticsDataClient.runReport({
    property: `properties/${process.env.GA4_PROPERTY_ID}`,
    dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
    dimensions: [{ name: 'date' }],
    metrics: [{ name: 'users' }, { name: 'sessions' }]
  });

  return response.rows;
}

export async function getByDate(startDate, endDate, type) {
  if (type === 'example') return getRandomExampleByDate();

  const [response] = await analyticsDataClient.runReport({
    property: `properties/${process.env.GA4_PROPERTY_ID}`,
    dateRanges: buildDateRange(startDate, endDate),
    dimensions: [{ name: 'date' }],
    metrics: [{ name: 'sessions' }, { name: 'users' }]
  });

  return response.rows.map(row => ({
    date: row.dimensionValues[0]?.value,
    sessions: parseInt(row.metricValues[0]?.value || '0'),
    users: parseInt(row.metricValues[1]?.value || '0')
  }));
}

export async function getByCountry(startDate, endDate, type) {
  if (type === 'example') return getRandomExampleByCountry();

  const [response] = await analyticsDataClient.runReport({
    property: `properties/${process.env.GA4_PROPERTY_ID}`,
    dateRanges: buildDateRange(startDate, endDate),
    dimensions: [{ name: 'date' }, { name: 'country' }],
    metrics: [{ name: 'sessions' }]
  });

  return response.rows.map(row => ({
    date: row.dimensionValues[0]?.value,
    country: row.dimensionValues[1]?.value,
    sessions: parseInt(row.metricValues[0]?.value || '0')
  }));
}

export async function getByDevice(startDate, endDate, type) {
  if (type === 'example') return getRandomExampleByDevice();

  const [response] = await analyticsDataClient.runReport({
    property: `properties/${process.env.GA4_PROPERTY_ID}`,
    dateRanges: buildDateRange(startDate, endDate),
    dimensions: [{ name: 'date' }, { name: 'deviceCategory' }],
    metrics: [{ name: 'sessions' }]
  });

  return response.rows.map(row => ({
    date: row.dimensionValues[0]?.value,
    device: row.dimensionValues[1]?.value,
    sessions: parseInt(row.metricValues[0]?.value || '0')
  }));
}
