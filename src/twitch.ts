import { ApiClient } from "twitch";
import { ClientCredentialsAuthProvider } from "twitch-auth";
import { readConfig } from "./config";

const conf = readConfig();

const clientId = conf.client_id;
const clientSecret = conf.client_secret;

console.log(clientId, clientSecret);

const authProvider = new ClientCredentialsAuthProvider(clientId, clientSecret);
const apiClient = new ApiClient({ authProvider });

export const getClient = async (name: string) => apiClient;

export const getLogo = async (name: string) =>
  await apiClient.kraken.users
    .getUserByName(name)
    .then((user) => user?.logoUrl)
    .catch((e) => {});
