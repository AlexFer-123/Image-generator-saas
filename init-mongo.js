// Script de inicialização do MongoDB
db = db.getSiblingDB('ai-image-generator');

// Criar usuário da aplicação
db.createUser({
  user: 'app',
  pwd: 'apppassword123',
  roles: [
    {
      role: 'readWrite',
      db: 'ai-image-generator'
    }
  ]
});

// Criar coleções com validação
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['email', 'name', 'password'],
      properties: {
        email: {
          bsonType: 'string',
          pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
          description: 'must be a valid email address'
        },
        name: {
          bsonType: 'string',
          minLength: 2,
          maxLength: 50,
          description: 'must be a string between 2 and 50 characters'
        },
        password: {
          bsonType: 'string',
          minLength: 6,
          description: 'must be a string with at least 6 characters'
        },
        imagesGenerated: {
          bsonType: 'int',
          minimum: 0,
          description: 'must be a non-negative integer'
        },
        maxImages: {
          bsonType: 'int',
          minimum: 0,
          description: 'must be a non-negative integer'
        }
      }
    }
  }
});

db.createCollection('subscriptions');
db.createCollection('generatedimages');

// Criar índices para performance
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ stripeCustomerId: 1 }, { unique: true, sparse: true });

db.subscriptions.createIndex({ userId: 1 }, { unique: true });
db.subscriptions.createIndex({ stripeSubscriptionId: 1 }, { unique: true });

db.generatedimages.createIndex({ userId: 1, createdAt: -1 });
db.generatedimages.createIndex({ createdAt: -1 });

print('MongoDB initialization completed successfully!');

