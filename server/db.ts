import { CloudantV1 } from '@ibm-cloud/cloudant';
import { IamAuthenticator } from 'ibm-cloud-sdk-core';
import dotenv from 'dotenv';

dotenv.config();

let client: CloudantV1 | null = null;
const DATABASE_NAME = 'lifescore';

export function getDbClient() {
  if (!client) {
    const url = process.env.CLOUDANT_URL;
    const apikey = process.env.CLOUDANT_APIKEY;

    if (!url || !apikey) {
      console.warn("CLOUDANT_URL or CLOUDANT_APIKEY not found in environment.");
      return null;
    }

    const authenticator = new IamAuthenticator({ apikey });
    client = CloudantV1.newInstance({ authenticator });
    client.setServiceUrl(url);

    // Initial check/setup
    ensureDatabase();
  }
  return client;
}

async function ensureDatabase() {
  if (!client) return;
  try {
    await client.putDatabase({ db: DATABASE_NAME });
    console.log(`Cloudant database '${DATABASE_NAME}' initialized.`);
  } catch (err: any) {
    if (err.status !== 412) { // 412 means already exists
      console.error("Cloudant database initialization error:", err);
    }
  }
}

export const dbName = DATABASE_NAME;

// Helper to query documents by type and userId
export async function findDocs(selector: any) {
  const service = getDbClient();
  if (!service) return [];

  const response = await service.postFind({
    db: dbName,
    selector: selector,
  });
  return response.result.docs || [];
}

export async function saveDoc(doc: any) {
  const service = getDbClient();
  if (!service) throw new Error("DB client not initialized");

  const response = await service.postDocument({
    db: dbName,
    document: doc,
  });
  return response.result;
}
