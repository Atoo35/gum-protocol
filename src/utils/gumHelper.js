import axios from "axios"
import { staticAddresses } from "./constants"

export const getUserDetailsByWalletAndNamespace = async (sdk) => {
  const namespace = 'Professional'
  const data = [];
  for (let i = 0; i < staticAddresses.length; i++) {
    const [user, [profileMetadata]] = await Promise.all([
      sdk.user.getUserAccountsByAuthority(staticAddresses[i]),
      // sdk.profile.getProfilesByUserAndNamespace(staticAddresses[i], namespace),
      sdk.profileMetadata.getProfileMetadataByUserAndNamespace(staticAddresses[i], namespace),
    ])
    // console.log(`profileMetadata for ${staticAddresses[i]}`, profileMetadata)
    if (profileMetadata) {
      const profileMetadataData = await axios.get(profileMetadata.metadatauri)
      // console.log(`profileMetadataData for ${staticAddresses[i]}`, profileMetadataData)
      profileMetadata.data = profileMetadataData.data
    }
    data.push({ [staticAddresses[i]]: { user, profileMetadata } })
  }
  return data;
}

const shuffleArray = (array) => {
  let arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
  }
  return arr;
}

export const getFeed = async (sdk) => {
  const posts = [];
  for (let i = 0; i < staticAddresses.length; i++) {

    const postAccounts = await sdk.post.getPostsByUser(staticAddresses[i]);
    // console.log(`postAccounts for ${staticAddresses[i]}`, postAccounts)
    if (postAccounts.length > 0) {
      for (let j = 0; j < postAccounts.length; j++) {
        const postMetadata = await axios.get(postAccounts[j].metadatauri)
        // console.log(`postMetadata for ${staticAddresses[i]}`, postMetadata)
        postAccounts[j].data = postMetadata.data
        postAccounts[j].walletAddress = staticAddresses[i]
        posts.push(postAccounts[j])
      }
    }
  }

  return shuffleArray(posts);
}

