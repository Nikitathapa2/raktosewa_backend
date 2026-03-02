const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const cleanupLegacy = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    const collections = ['adminusers', 'donorusers', 'orginizationusers'];
    const db = mongoose.connection.db;

    for (const colName of collections) {
      const collectionsList = await db.listCollections({ name: colName }).toArray();
      if (collectionsList.length > 0) {
        await db.dropCollection(colName);
        console.log(`Dropped collection: ${colName}`);
      } else {
        console.log(`Collection not found (already deleted): ${colName}`);
      }
    }

    console.log('Cleanup complete.');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

cleanupLegacy();
