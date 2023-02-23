import Head from 'next/head'
import Image from 'next/image'
import { Inter } from '@next/font/google'
import styles from '@/styles/Home.module.css'
import { useWallet } from "@solana/wallet-adapter-react";
import { useMemo, useCallback, useEffect, useState } from "react";
import { Connection } from "@solana/web3.js";
import { useGumSDK } from '../hooks/gumHook';
import { v4 as uuidv4 } from "uuid";
import { uploadToIPFS } from "../utils/ipfs"
import dynamic from 'next/dynamic';
import { PublicKey } from '@solana/web3.js';
import { useCreateProfile, useCreateUser, useProfile } from '@gumhq/react-sdk';
import { getFeed, getUserDetailsByWalletAndNamespace } from '@/utils/gumHelper';
import { useCreatePost } from '@gumhq/react-sdk';
import axios from 'axios';


const WalletMultiButtonDynamic = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false }
);
const inter = Inter({ subsets: ['latin'] })


export default function Home () {
  const wallet = useWallet();
  const userPublicKey = wallet.publicKey;
  const connection = useMemo(() => new Connection("https://api.devnet.solana.com", "confirmed"), []);
  const sdk = useGumSDK(connection, { preflightCommitment: "confirmed" }, "devnet");
  const [allUsers, setAllUsers] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [profilesList, setProfilesList] = useState([]);
  const { create } = useCreateUser(sdk);
  const { create: createUserProfile } = useCreateProfile(sdk);

  const { create: createUserPost } = useCreatePost(sdk);
  // console.log('profilePDA', userPDA)



  const setupUsers = async () => {
    const [data, posts] = await Promise.all([
      getUserDetailsByWalletAndNamespace(sdk),
      getFeed(sdk)
    ])
    console.log('allUsers', data)
    // console.log('shuffledPosts', shuffledPosts)
    console.log('allposts', posts)
    setAllUsers(data)
  }

  const createPost = async () => {
    try {
      const metadata_id = uuidv4();
      const ipfsResult = await uploadToIPFS({
        metadata_id,
        content: {
          content: "this is on 23rd feb!!",
          format: "markdown",
        },
        type: "text",
        authorship: {
          signature: "signature",
          publicKey: userPublicKey.toString(),
        }
      });
      console.log('ipfsResult', `https://${ipfsResult}.ipfs.dweb.link/${metadata_id}.json`)
      const p = profilesList.find(p => p.account.namespace.professional)
      console.log('p', p)
      const post = await createUserPost(`https://${ipfsResult}.ipfs.dweb.link/${metadata_id}.json`, p.publicKey, p.account.user, wallet.publicKey)
      // const a = await post.instructionMethodBuilder.rpc()
      // console.log('a', a)
      console.log('post', post)
    } catch (error) {
      console.log('error while posting', error)
    }
  }

  const getUserData = async () => {
    if (!wallet.connected) return;
    const [users, profiles, [profileMetadata]] = await Promise.all([
      sdk.user.getUserAccountsByUser(userPublicKey),
      sdk.profile.getProfileAccountsByUser(userPublicKey),
      sdk.profileMetadata.getProfileMetadataByUserAndNamespace(userPublicKey, 'Professional'),
    ]);
    // const up = await sdk.profile.getProfilesByUserAndNamespace(userPublicKey, 'Professional');
    // console.log('up', up)
    if (profileMetadata) {
      const profileMetadataData = await axios.get(profileMetadata.metadatauri)
      // console.log(`profileMetadataData for ${staticAddresses[i]}`, profileMetadataData)
      profileMetadata.data = profileMetadataData.data
    }
    const prof = profiles.filter(p => p.account.namespace.professional)
    prof[0].profileMetadata = profileMetadata
    setupUsers();
    setProfilesList(prof);
    setUsersList(users);
    console.log('profiles', prof)
    // console.log('users', users)
  };
  useEffect(() => {
    getUserData();
  }, [wallet.connected]);

  const createUser = async () => {
    if (usersList.length > 0) return;
    const user = await create(wallet.publicKey)
    console.log('user', user)
    getUserData();
  }

  const createProfile = async () => {
    if (profilesList.length > 0) return;
    try {
      const metadata_id = uuidv4();
      const ipfsResult = await uploadToIPFS({
        metadata_id,
        name: "Chirag",
        bio: "amazing life!!!",
        username: "chirag",
        avatar: "https://pbs.twimg.com/profile_images/1592873440477958144/9YMSHarv_400x400.jpg"
      });
      const profile = await createUserProfile(`https://${ipfsResult}.ipfs.dweb.link/${metadata_id}.json`, 'Professional', new PublicKey(usersList[0].publicKey), userPublicKey)
      console.log('profile', profile)

    } catch (error) {
      console.log('error', error)
    }

  }
  return (
    <>
      <Head>
        <title>Gum App</title>
      </Head>
      <main className={styles.main}>
        <div className={styles.walletButtons}>
          <WalletMultiButtonDynamic />
        </div>
        <div>
          <button onClick={createUser}> Create User</button>
          <button onClick={createProfile}>Create Profile</button>
          <button onClick={createPost}>Create Post</button>
        </div>
        <div className={styles.usersContainer}>
          <h2 className={styles.title}>List of Users</h2>
          {usersList.map((user, index) => (
            <div key={index} className={styles.userCard}>
              <div className={styles.userNumber}>
                {index + 1}
              </div>
              <div className={styles.userInfo}>
                <p className={styles.userEmail}>User Account: {user.publicKey.toBase58()}</p>
                <p className={styles.userAuthority}>Authority: {user.account.authority.toBase58()}</p>
              </div>
            </div>
          ))}
        </div>
        <div className={styles.listContainer}>
          <h2 className={styles.title}>Your Profile Accounts</h2>
          {profilesList.map((user, index) => (
            <div key={index} className={styles.userCard}>
              <div className={styles.userNumber}>
                {index + 1}
              </div>
              <div className={styles.userInfo}>
                <img alt="avatar" height={50} width={50} src={user.profileMetadata.data.avatar} />
                <p>Bio: {user.profileMetadata.data.bio}</p>
                <p>Name: {user.profileMetadata.data.name}</p>
                <p>Username: {user.profileMetadata.data.username}</p>
                <p className={styles.userEmail}>Profile Account: {user.publicKey.toBase58()}</p>
                <p className={styles.userAuthority}>User Account: {user.account.user.toBase58()}</p>
                <p className={styles.userAuthority}>Namespace: {JSON.stringify(user.account.namespace)}</p>
              </div>
            </div>
          ))}
        </div>
        <div className={styles.listContainer}>
          <h2 className={styles.title}>Your Profile Accounts</h2>
          {allUsers.map((user, index) => (
            <div key={index} className={styles.userCard}>
              <div className={styles.userNumber}>
                {index + 1}
              </div>
              <div className={styles.userInfo}>
                <p className={styles.userEmail}>User Account: {JSON.stringify(user)}</p>

              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  )
}
