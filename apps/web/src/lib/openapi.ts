import type { OpenAPIV3_1 } from 'openapi-types';

export const openApiSpec: OpenAPIV3_1.Document = {
  openapi: '3.1.0',
  info: {
    title: 'OnlySnow API',
    version: '1.0.0',
    description: `
**OnlySnow Ski Decision Engine API**

Find the best snow conditions, resorts, and powder days across North America.

This API powers the OnlySnow platform, helping skiers make data-driven decisions about where and when to ski based on:
- Real-time snow conditions
- Weather forecasts
- Pass types (Epic, Ikon, Indy)
- Drive times and proximity
- Storm tracking
- Personalized recommendations

## Authentication

Currently, all endpoints are public. Authentication will be added in a future release.

## Rate Limiting

- Development: No limits
- Production: 1000 requests/hour per IP

## Data Freshness

Snow conditions are updated every 6 hours. Forecasts are refreshed daily.
`,
    contact: {
      name: 'OnlySnow Support',
      url: 'https://onlysnow.app',
    },
    license: {
      name: 'Proprietary',
    },
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Local Development',
    },
    {
      url: 'https://api.onlysnow.app',
      description: 'Production',
    },
  ],
  tags: [
    {
      name: 'Resorts',
      description: 'Ski resort data, conditions, and forecasts',
    },
    {
      name: 'Regions',
      description: 'Geographic regions for storm chasing',
    },
    {
      name: 'Recommendations',
      description: 'Personalized resort recommendations',
    },
    {
      name: 'Drive Times',
      description: 'Travel time calculations',
    },
    {
      name: 'AI',
      description: 'AI-powered narratives and insights',
    },
  ],
  paths: {
    '/api/resorts': {
      get: {
        tags: ['Resorts'],
        summary: 'List all resorts',
        description: 'Get a list of ski resorts with optional filtering by region, pass type, and proximity.',
        operationId: 'listResorts',
        parameters: [
          {
            name: 'region',
            in: 'query',
            description: 'Filter by region (e.g., "colorado", "utah", "tahoe")',
            schema: { type: 'string' },
          },
          {
            name: 'passType',
            in: 'query',
            description: 'Filter by pass type',
            schema: {
              type: 'string',
              enum: ['epic', 'ikon', 'indy', 'independent'],
            },
          },
          {
            name: 'lat',
            in: 'query',
            description: 'Latitude for proximity filtering (requires lng and radiusMiles)',
            schema: { type: 'number', format: 'double' },
          },
          {
            name: 'lng',
            in: 'query',
            description: 'Longitude for proximity filtering (requires lat and radiusMiles)',
            schema: { type: 'number', format: 'double' },
          },
          {
            name: 'radiusMiles',
            in: 'query',
            description: 'Maximum distance in miles (requires lat and lng)',
            schema: { type: 'number', minimum: 1, maximum: 500 },
          },
        ],
        responses: {
          '200': {
            description: 'Successful response with resort list',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/ResortSummary' },
                },
              },
            },
          },
        },
      },
    },
    '/api/resorts/{id}': {
      get: {
        tags: ['Resorts'],
        summary: 'Get resort details',
        description: 'Get detailed information about a specific resort including current conditions.',
        operationId: 'getResort',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'Resort ID or slug',
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'Successful response with resort details',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ResortDetail' },
              },
            },
          },
          '404': {
            description: 'Resort not found',
          },
        },
      },
    },
    '/api/resorts/{id}/forecast': {
      get: {
        tags: ['Resorts'],
        summary: 'Get resort forecast',
        description: 'Get 10-day weather forecast for a specific resort.',
        operationId: 'getResortForecast',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'Resort ID or slug',
            schema: { type: 'string' },
          },
        ],
        responses: {
          '200': {
            description: 'Successful response with forecast data',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/DailyForecast' },
                },
              },
            },
          },
          '404': {
            description: 'Resort not found',
          },
        },
      },
    },
    '/api/regions': {
      get: {
        tags: ['Regions'],
        summary: 'List chase regions',
        description: 'Get all geographic regions with storm data for chase mode.',
        operationId: 'listRegions',
        responses: {
          '200': {
            description: 'Successful response with region data',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/RegionSummary' },
                },
              },
            },
          },
        },
      },
    },
    '/api/onboarding/recommendations': {
      post: {
        tags: ['Recommendations'],
        summary: 'Get personalized recommendations',
        description: 'Get AI-powered resort recommendations based on user preferences and profile.',
        operationId: 'getRecommendations',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/OnboardingRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Successful response with personalized recommendations',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/OnboardingRecommendationResponse' },
              },
            },
          },
          '400': {
            description: 'Invalid request body',
          },
          '500': {
            description: 'Failed to generate recommendations',
          },
        },
      },
    },
    '/api/drive-times': {
      post: {
        tags: ['Drive Times'],
        summary: 'Calculate drive times',
        description: 'Calculate driving times from a location to multiple resorts.',
        operationId: 'calculateDriveTimes',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  location: {
                    type: 'string',
                    description: 'Origin location (city name or coordinates)',
                    example: 'Denver, CO',
                  },
                  resortIds: {
                    type: 'array',
                    items: { type: 'number' },
                    description: 'Array of resort IDs',
                    example: [1, 2, 3],
                  },
                },
                required: ['location', 'resortIds'],
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Successful response with drive time data',
          },
          '400': {
            description: 'Invalid request body',
          },
        },
      },
    },
    '/api/narrative': {
      post: {
        tags: ['AI'],
        summary: 'Generate AI narrative',
        description: 'Generate an AI-powered narrative summary of current conditions and recommendations.',
        operationId: 'generateNarrative',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  persona: {
                    type: 'string',
                    description: 'User persona type',
                    enum: [
                      'core-local',
                      'storm-chaser',
                      'family-planner',
                      'weekend-warrior',
                      'resort-loyalist',
                      'learning-curve',
                      'social-skier',
                      'luxury-seeker',
                      'budget-maximizer',
                    ],
                  },
                  location: {
                    type: 'string',
                    description: 'User location',
                  },
                  passType: {
                    type: 'string',
                    description: 'Pass type',
                    enum: ['epic', 'ikon', 'indy', 'independent', 'none'],
                  },
                },
                required: ['persona'],
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Successful response with narrative',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    narrative: {
                      type: 'string',
                      description: 'AI-generated narrative',
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      ResortSummary: {
        type: 'object',
        properties: {
          id: { type: 'number', example: 1 },
          name: { type: 'string', example: 'Vail' },
          slug: { type: 'string', example: 'vail' },
          lat: { type: 'number', format: 'double', example: 39.6403 },
          lng: { type: 'number', format: 'double', example: -106.3742 },
          elevationSummit: { type: 'number', example: 11570 },
          elevationBase: { type: 'number', example: 8120 },
          region: { type: 'string', example: 'colorado' },
          passType: {
            type: 'string',
            enum: ['epic', 'ikon', 'indy', 'independent', null],
            example: 'epic',
          },
          conditions: {
            type: 'object',
            nullable: true,
            properties: {
              snowfall24h: { type: 'number', nullable: true, example: 8 },
              snowfall48h: { type: 'number', nullable: true, example: 12 },
              baseDepth: { type: 'number', nullable: true, example: 72 },
              liftsOpen: { type: 'number', nullable: true, example: 15 },
              trailsOpen: { type: 'number', nullable: true, example: 120 },
              surfaceCondition: { type: 'string', nullable: true, example: 'powder' },
              resortStatus: { type: 'string', nullable: true, example: 'open' },
            },
          },
          freshness: {
            type: 'object',
            properties: {
              dataAgeMinutes: { type: 'number', example: 45 },
              source: { type: 'string', example: 'scraper' },
              updatedAt: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
      ResortDetail: {
        type: 'object',
        properties: {
          id: { type: 'number' },
          name: { type: 'string' },
          slug: { type: 'string' },
          lat: { type: 'number', format: 'double' },
          lng: { type: 'number', format: 'double' },
          elevationSummit: { type: 'number' },
          elevationBase: { type: 'number' },
          region: { type: 'string' },
          passType: { type: 'string', nullable: true },
          totalLifts: { type: 'number', nullable: true },
          totalTrails: { type: 'number', nullable: true },
          terrainAcres: { type: 'number', nullable: true },
          conditions: {
            type: 'object',
            nullable: true,
            properties: {
              snowfall24h: { type: 'number', nullable: true },
              snowfall48h: { type: 'number', nullable: true },
              snowfall72h: { type: 'number', nullable: true },
              baseDepth: { type: 'number', nullable: true },
              liftsOpen: { type: 'number', nullable: true },
              trailsOpen: { type: 'number', nullable: true },
              surfaceCondition: { type: 'string', nullable: true },
              resortStatus: { type: 'string', nullable: true },
            },
          },
        },
      },
      DailyForecast: {
        type: 'object',
        properties: {
          date: { type: 'string', format: 'date', example: '2026-02-10' },
          tempHigh: { type: 'number', example: 32 },
          tempLow: { type: 'number', example: 18 },
          snowfall: { type: 'number', example: 6 },
          precipitation: { type: 'number', example: 0.5 },
          windSpeed: { type: 'number', example: 15 },
          conditions: { type: 'string', example: 'snowy' },
        },
      },
      RegionSummary: {
        type: 'object',
        properties: {
          id: { type: 'number' },
          name: { type: 'string', example: 'Colorado Front Range' },
          lat: { type: 'number', format: 'double' },
          lng: { type: 'number', format: 'double' },
          bestAirport: { type: 'string', nullable: true, example: 'DEN' },
          resortCount: { type: 'number', example: 12 },
          totalSnowfall5Day: { type: 'number', example: 18 },
          bestResort: {
            type: 'object',
            nullable: true,
            properties: {
              name: { type: 'string' },
              slug: { type: 'string' },
              snowfall5Day: { type: 'number' },
            },
          },
          stormSeverity: {
            type: 'string',
            enum: ['none', 'light', 'moderate', 'heavy', 'epic'],
            example: 'moderate',
          },
        },
      },
      OnboardingRequest: {
        type: 'object',
        required: ['location', 'passType', 'driveRadius', 'persona'],
        properties: {
          location: { type: 'string', example: 'Denver, CO' },
          passType: {
            type: 'string',
            enum: ['epic', 'ikon', 'indy', 'independent', 'multi', 'none'],
            example: 'epic',
          },
          driveRadius: { type: 'number', example: 120, description: 'Drive radius in minutes' },
          persona: { type: 'string', example: 'core-local' },
          experience: { type: 'string', example: 'advanced' },
          frequency: { type: 'string', example: 'core' },
          groupType: { type: 'string', example: 'solo' },
          triggers: { type: 'array', items: { type: 'string' }, example: ['snow', 'time'] },
        },
      },
      OnboardingRecommendationResponse: {
        type: 'object',
        properties: {
          recommendations: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string', example: 'Loveland' },
                slug: { type: 'string', example: 'loveland' },
                passType: { type: 'string', example: 'epic' },
                reason: {
                  type: 'string',
                  example: 'Close to Denver with great powder and fewer crowds',
                },
                currentConditions: { type: 'string', example: '8" fresh, 72" base' },
              },
            },
          },
          summary: {
            type: 'string',
            example: 'We found 12 Epic pass resorts within 2 hours of Denver',
          },
          totalMatching: { type: 'number', example: 12 },
        },
      },
    },
  },
};
