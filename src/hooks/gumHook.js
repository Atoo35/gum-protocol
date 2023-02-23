import { AnchorWallet, useAnchorWallet } from "@solana/wallet-adapter-react";
import { useGum } from "@gumhq/react-sdk";
import { SDK } from "@gumhq/sdk";
import { GraphQLClient } from "graphql-request";

const DEVNET_GRAPHQL_ENDPOINT = "https://aware-earwig-49.hasura.app/v1/graphql";
const gqlClient = new GraphQLClient(DEVNET_GRAPHQL_ENDPOINT);
export const useGumSDK = (connection, opts, cluster) => {
  const anchorWallet = useAnchorWallet();

  const sdk = useGum(anchorWallet, connection, opts, cluster, gqlClient);

  return sdk;
};