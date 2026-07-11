export const environment = {
  production: false,

  serverBaseUrl: 'http://localhost:8080/api/v1',

  authenticationEndpointPath: '/authentication',
  userEndpointPath: '/users',
  rolesEndpointPath: '/roles',

  residentialEndpointPath: '/residential',
  buildingEndpointPath: '/residential/buildings',
  unitEndpointPath: '/residential/units',
  userUnitEndpointPath: '/residential/user-units',

  reservationEndpointPath: '/reservations',
  commonAreaEndpointPath: '/common-areas',
  commonAreaRulesEndpointPath: '/common-area-rules',

  paymentEndpointPath: '/payments',
  debtEndpointPath: '/payments/debts',

  postEndpointPath: '/posts',

  announcementEndpointPath: '/announcements',
  announcementReadEndpointPath: '/announcement-reads',

  notificationEndpointPath: '/notifications',
  deviceTokenEndpointPath: '/device-tokens',
  reportEndpointPath: '/reports'
};
