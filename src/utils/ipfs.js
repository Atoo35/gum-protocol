import { Web3Storage } from 'web3.storage'

export const uploadToIPFS = async (data) => {
  const client = new Web3Storage({ token: process.env.NEXT_PUBLIC_WEB3_STORAGE_KEY })
  // const buffer = require("buffer/").Buffer.from(JSON.stringify(data))
  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' })
  const file = [new File([blob], `${data.metadata_id}.json`)]
  console.log(file)
  const uploadResponse = await client.put(file);
  return uploadResponse;
}

// "https://" + ipfsResult + ".ipfs.dweb.link/" + metadata_id + ".json"
//  const metadata_id = uuidv4();