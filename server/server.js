const jsonServer = require('json-server');

const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(jsonServer.bodyParser);

const db = router.db;

const getNextId = (collectionName) => {
  const collection = db.get(collectionName).value();

  if (!collection.length) {
    return 1;
  }

  return Math.max(...collection.map(item => Number(item.id) || 0)) + 1;
};

server.post('/authentication/sign-in', (req, res) => {
  const { email, password } = req.body;

  const auth = db
    .get('authentication')
    .find({ email, password })
    .value();

  if (!auth) {
    return res.status(401).json('Credenciales incorrectas');
  }

  const user = db
    .get('users')
    .find({ id: auth.userId })
    .value();

  if (!user) {
    return res.status(404).json('Usuario no encontrado');
  }

  return res.status(200).json({
    id: user.id,
    email: user.email,
    token: auth.token
  });
});

server.post('/authentication/sign-up', (req, res) => {
  const {
    fullName,
    email,
    password,
    phone,
    documentType,
    documentNumber,

  } = req.body;

  const existingUser = db
    .get('users')
    .find({ email })
    .value();

  if (existingUser) {
    return res.status(400).json('El email ya se encuentra registrado');
  }

  const userId = getNextId('users');
  const authId = getNextId('authentication');

  const newUser = {
    id: userId,
    fullName,
    email,
    phone,
    status: 'ACTIVE',
    documentType,
    documentNumber,
    roles: ['ADMIN']
  };

  const token = `fake-jwt-token-user-${userId}-${Date.now()}`;

  const newAuthentication = {
    id: authId,
    email,
    password,
    token,
    userId
  };

  db.get('users').push(newUser).write();
  db.get('authentication').push(newAuthentication).write();

  return res.status(201).json(newUser);
});

server.use(jsonServer.rewriter({
  '/residential/buildings': '/buildings',
  '/residential/buildings/:id': '/buildings/:id',

  '/residential/units': '/units',
  '/residential/units/:id': '/units/:id',

  '/residential/user-units': '/userUnits',
  '/residential/user-units/:id': '/userUnits/:id',

  '/residential/buildings/:idBuilding/units': '/units?idBuilding=:idBuilding',
  '/residential/buildings/:idBuilding/residents': '/userUnits?idBuilding=:idBuilding',

  '/common-areas': '/commonAreas',
  '/common-areas/:id': '/commonAreas/:id',

  '/common-area-rules': '/commonAreaRules',
  '/common-area-rules/:id': '/commonAreaRules/:id',

  '/reservations': '/reservations',
  '/reservations/:id': '/reservations/:id',

  '/payments/debts': '/debts',
  '/payments/debts/:id': '/debts/:id',
  '/payments/debts/unit/:unitId': '/debts?unitId=:unitId',

  '/payments/user/:userId': '/payments?userId=:userId',
  '/payments/user/:userId/year/:year': '/payments?userId=:userId&paymentDate_like=:year',

  '/posts': '/posts',
  '/posts/:id': '/posts/:id'
}));

server.use(router);

server.listen(3000, () => {
  console.log('JSON Server running at http://localhost:3000');
});
