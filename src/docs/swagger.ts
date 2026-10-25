import swaggerAutogen from 'swagger-autogen';

const doc = {
  info: { title: 'Review Kantin API - Tugas 3', version: '1.0.0' },
  host: 'localhost:3000',
  schemes: ['http'],
  securityDefinitions: {
    bearerAuth: {
      type: 'apiKey',
      in: 'header',
      name: 'Authorization',
      description: 'Isi dengan: Bearer <token>',
    },
  },
  definitions: {
    RegisterInput: {
      $name: 'Siti Aminah',
      $email: 'siti@test.com',
      $password: 'password123',
    },
    LoginInput: {
      $email: 'siti@test.com',
      $password: 'password123',
    },
    StallInput: {
      $name: 'Warung Baru',
      category: 'Nasi',
      location: 'Kantin FK',
      description: 'Deskripsi warung',
    },
    ReviewInput: {
      $rating: 5,
      comment: 'Enak banget',
    },
    UserInput: {
      $name: 'Bagas Pratama',
      $email: 'bagas2@student.test',
      $password: 'password123',
      $role: 'customer',
    },
    MenuItemInput: { $stallId: 1, $name: 'Menu Baru', $price: 15000, isAvailable: true },
    LikeInput: { $reviewId: 1, $userId: 13 },
    FlagStatusInput: { $status: 'resolved' },
    AuditLogInput: {
      $userId: 1,
      $action: 'CREATE',
      $targetTable: 'STALLS',
      $targetId: 1,
      metadata: '{}',
    },
  },
};

const outputFile = './swagger-output.json';
const endpointsFiles = ['./src/index.ts'];

swaggerAutogen()(outputFile, endpointsFiles, doc);